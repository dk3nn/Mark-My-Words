//npm install express pg express-session dotenv
require('dotenv').config();
const express = require('express');
const cors = require('cors')
const session = require('express-session');
const path = require('path');
const {Pool} = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const pool =new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false}
}));

async function initDB() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE,
            password TEXT
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS folders(
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            name TEXT
        )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS saved_words (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            folder_id INTEGER REFERENCES folders(id),
            word TEXT,
            definition TEXT,
            user_definition TEXT,
            synonyms TEXT,
            antonyms TEXT
        )
    `);
    console.log('Database ready');
}
initDB();

app.get('/dictionary/:word', async (req,res) => {
    const word = req.params.word;
    try{
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await response.json();
        if(!response.ok){
            return res.status(404).json({error: 'Word not found'});
        }
            res.json({
                word: word,
                definition: data[0].meanings[0].definitions[0].definition,
                partOfSpeech: data[0].meanings[0].partOfSpeech,
                example: data[0].meanings[0].definitions[0].example || null
        });
    }catch (error){
         res.status(500).json({error: 'API error'});
    }
});

app.get('/thesaurus/:word', async (req,res) =>{
    const word = req.params.word;
    try{
        //link for api
        const synResponse = await fetch(`https://api.datamuse.com/words?rel_syn=${word}`);
        const synonyms = await synResponse.json();
        const antResponse = await fetch(`https://api.datamuse.com/words?rel_ant=${word}`);
        const antonyms = await antResponse.json();
        res.json({
            word: word,
            synonyms: synonyms.slice(0,10).map(s => s.word),
            antonyms: antonyms.slice(0,10).map(a => a.word)
        });
    }catch(error){
        res.status(500).json({error: 'API error'})
    }
});

app.post('/signup', async (req,res) => {
    const {username, password} =req.body;
    try{
        await pool.query('INSERT INTO users (username,password) VALUES ($1,$2)', [username,password]);
        res.json({success: true});
    }catch(error){
        if (error.code === '23505'){
            res.status(400).json({ error: 'Username already exists'});
        }else{
            res.status(500).json({error: 'Sign up failed'});
        }
    }
});

app.post('/login', async (req,res) => {
    const {username, password} = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if(result.rows.length===0){
        return res.status(401).json({error: 'Invalid username or password'});
    }
    if(password === result.rows[0].password){
        req.session.userId = result.rows[0].id;
        req.session.username = username;
        res.json({success:true, username});
    }else{
        res.status(401).json({error: 'Invalid username or password'});
    }
});

app.post('/logout',(req,res) => {
    req.session.destroy();
    res.json({success:true});
});

app.get('/user', (req,res) => {
    if(req.session.userId){
        res.json({loggedIn: true, username: req.session.username, userId: req.session.userId});
    }else{
        res.json({loggedIn: false});
    }
});

app.get('/folders', async (req,res) => {
    if(!req.session.userId){
        return res.json([]);
    }
    const result = await pool.query('SELECT * FROM folders WHERE user_id = $1', [req.session.userId]);
    res.json(result.rows);
});

app.post('/folders', async(req,res) => {
    if(!req.session.userId){
        return res.status(401).json({error: 'Not logged in'});
    }
    const {name} = req.body;
    const result = await pool.query('INSERT INTO folders (user_id, name) VALUES ($1,$2) RETURNING *', [req.session.userId, name]);
    res.json(result.rows[0]);
});

app.delete('/folders/:id', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    try {
        await pool.query('UPDATE saved_words SET folder_id = NULL WHERE folder_id = $1 AND user_id = $2',
            [req.params.id, req.session.userId]
        );
        await pool.query('DELETE FROM folders WHERE id = $1 AND user_id = $2', [req.params.id, req.session.userId] );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete folder' });
    }
});

app.get('/saved', async (req, res) => {
    if (!req.session.userId) {
        return res.json([]);
    }
    const { folder } = req.query;
    let query = 'SELECT * FROM saved_words WHERE user_id = $1';
    let params = [req.session.userId];
    if (folder) {
        query += ' AND folder_id = $2';
        params.push(folder);
    }
    query += ' ORDER BY id DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
});

app.post('/saved', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    const { word, definition, synonyms, antonyms, folder_id } = req.body;
    const result = await pool.query(`INSERT INTO saved_words (user_id, folder_id, word, definition, synonyms, antonyms) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,[req.session.userId, folder_id || null, word, definition, 
        synonyms || '', antonyms || '']
    );
    res.json(result.rows[0]);
});

app.put('/saved/:id/definition', async (req,res) => {
    if(!req.session.userId){
        return res.status(401).json({error: 'Not logged in'});
    }
    const {user_definition} = req.body;
    await pool.query('UPDATE saved_words SET user_definition = $1 WHERE id =$2 AND user_id = $3', 
        [user_definition, req.params.id, req.session.userId]
    );
    res.json({success: true});
})

app.put('/saved/:id/folder', async (req,res) => {
    if(!req.session.userId){
        return res.status(401).json({error: 'Not logged in'});
    }
    const {folder_id} = req.body;
    await pool.query(
        'UPDATE saved_words SET folder_id = $1 WHERE id = $2 AND user_id = $3', [folder_id || null, req.params.id, req.session.userId]
    );
    res.json({success:true})
});

app.delete('/saved/:id', async (req,res) => {
    if(!req.session.userId){
        return res.status(401).json({error: 'Not logged in'});
    }
    await pool.query('DELETE FROM saved_words WHERE id =$1 AND user_id = $2', [req.params.id, req.session.userId]

    );
    res.json({success: true});
});
/** 
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/dist')));
}
*/
app.use(express.static(path.join(__dirname, 'client/dist')));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
