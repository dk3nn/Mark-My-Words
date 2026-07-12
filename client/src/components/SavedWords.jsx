import React, { useState, useEffect } from 'react'
import WordCard from './WordCard'

function SavedWords({user, refreshSaved, currentWord, currentDefinition, currentSynonyms, currentAntonyms, selectedFolder}){
    const [savedWords, setSavedWords] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user){
            loadSavedWords()
        }
    }, [user, refreshSaved, selectedFolder])

    const loadSavedWords = async () => {
        setLoading(true)

        try{
            let url = '/saved'
            if(selectedFolder){
                url+= `?folder=${selectedFolder}`
            }
            const response = await fetch(url)
            const data = await response.json()
            setSavedWords(data)
        }catch(error){
            console.error('Failed to load saved words')
        }finally{
            setLoading(false)
        }
    }

    const saveCurrentWord = async () => {
        if(!currentWord){
            alert('No word to save')
            return
        }

        const response = await fetch('/saved', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                word: currentWord,
                definition: currentDefinition,
                synonyms: currentSynonyms.join(', '),
                antonyms: currentAntonyms.join(', '),
                folder_id: null
            })
        })

        if (response.ok){
            alert(`"${currentWord}" saved!`)
            loadSavedWords()
        }else{
            alert('Failed to save word')
        }
    }

    const deleteWord = async (id) => {
        if(!confirm('Delete this word?')) return
        await fetch(`/saved/${id}`, {method: 'DELETE'})
        loadSavedWords()
    }

    const editDefinition = async (id, newDefinition) => {
        try {
            const response = await fetch(`/saved/${id}/definition`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_definition: newDefinition }),
                credentials: 'include'
            })
            
            const data = await response.json()
            
            if (response.ok) {
                loadSavedWords()
                alert('Definition saved!')
            } else {
                alert('Failed to save definition')
            }
        } catch (error) {
            alert('Error saving definition')
        }
    }

    if(!user){
        return <p>Login to save words</p>
    }

    return(
        <div>
            {currentWord&& (
                <button onClick ={saveCurrentWord} className = "save-btn">
                    Save "{currentWord}" to "My Dictionary"
                </button>
            )}

            <div className="saved-words-list">
                {loading&& <p>Loading...</p>}
                {!loading && savedWords.length === 0 && <p>You have no saved words in this folder. Add words from "My Dictionary"</p>}
                {savedWords.map(word =>(
                    <WordCard key={word.id} word={word} onDelete={deleteWord} onEdit={editDefinition} onMove={loadSavedWords}/>
                ))}
            </div>
        </div>
    )

}

export default SavedWords
