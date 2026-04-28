import React, {useState} from 'react'

function Dictionary({setCurrentWord, setCurrentDefinition, setCurrentSynonyms, setCurrentAntonyms, setSearchTerm, user}){
    const [searchTermLocal, setSearchTermLocal] = useState('')
    const [definition, setDefinition] = useState(null)
    const [loading, setLoading] = useState(false)

    const searchWord = async () => {
        if(!searchTermLocal.trim()) {
            return
        }

        setLoading(true)
        try{
            const response =await fetch(`/dictionary/${searchTermLocal}`)
            if (!response.ok){
                throw new Error('Word not found')
            }
            const data = await response.json()

            setDefinition(data)
            setCurrentWord(data.word)
            setCurrentDefinition(data.definition)
            setCurrentSynonyms([])
            setCurrentAntonyms([])

            setSearchTerm(searchTermLocal)

        }catch(error){
            setDefinition({error: `"${searchTermLocal}" not found`})
            setSearchTerm('')
        }finally{
            setLoading(false)
        }
    }

    const saveCurrentWord = async () => {
        if (!definition) {
            alert('No word to save')
            return
        }

        const response = await fetch('/saved', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                word: definition.word,
                definition: definition.definition,
                synonyms: '',
                antonyms: '',
                folder_id: null
            })
        })

        if (response.ok) {
            alert(`"${definition.word}" saved!`)
        } else {
            alert('Failed to save word')
        }
    }

    return(
        <div className = "dictionary-panel">
            <h2> Dictionary</h2>
            <div className = "search-section">
                <input
                type = "text"
                value={searchTermLocal}
                onChange={(e) => setSearchTermLocal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchWord()}
                placeholder="Awaiting a word..."
                />
                <button onClick={searchWord}>Search</button>
            </div>
            
            <div className = "results-panel">
                {loading && <p>Searching...</p>}
                {definition && !definition.error && (
                    <>
                    <h3>{definition.word}</h3>
                    <p><em>{definition.partOfSpeech}</em></p>
                    <p>{definition.definition}</p>
                    {definition.example && <p><strong>Example:</strong> {definition.example}</p>}
                    </>
                )}
                {definition?.error && <p>{definition.error}</p>}
                {!loading && !definition && <p>Search for a word to get the definition and more!</p>}
            </div>
            {user && definition && !definition.error && (
                <button onClick={saveCurrentWord} className="save-btn">
                    Save "{definition.word}" to My Dictionary
                </button>
            )}
        </div>
    )
}

export default Dictionary