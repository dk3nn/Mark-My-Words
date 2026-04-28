import React, { useState, useEffect } from 'react'

function Thesaurus({searchTerm}){
    const [synonyms, setSynonyms] = useState([])
    const [antonyms, setAntonyms] = useState([])
    const [loading, setLoading] = useState(false)
    const [currentWord, setCurrentWord] = useState('')

    useEffect(() => {
        if(!searchTerm){
            setSynonyms([])
            setAntonyms([])
            setCurrentWord('')
            return
        }

        const fetchThesaurus = async () => {
            setLoading(true)
            setCurrentWord(searchTerm)

            try{
                const response = await fetch(`/thesaurus/${searchTerm}`)
                const data = await response.json()
                setSynonyms(data.synonyms || [])
                setAntonyms(data.antonyms || [])
            }catch (error){
                setSynonyms([])
                setAntonyms([])
            }finally{
                setLoading(false)
            }
        }

        fetchThesaurus()
    }, [searchTerm])

    const searchSynonym = (word) => {
        const event = new CustomEvent('searchFromThesaurus', {detail: word})
        window.dispatchEvent(event)
    }

    useEffect(() => {
        const handleSearchFromThesaurus = (event) => {
            const word = event.detail
            const input = document.querySelector('.dictionary-panel input')
            if(input){
                input.value = word
                input.dispatchEvent(new Event('input', {bubbles: true}))
                const searchBtn = document.querySelector('.dictionary-panel button')
                if(searchBtn){
                    searchBtn.click()
                }
            }
        }

        window.addEventListener('searchFromThesaurus', handleSearchFromThesaurus)
        return () => window.removeEventListener('searchFromThesaurus', handleSearchFromThesaurus)
    },[])

    return(
        <div className= "thesaurus-panel">
            <h2> Thesaurus </h2>
            <div className="results-panel">
                {loading && <p>Searching...</p>}
                {!loading && !currentWord && <p>Search for a word</p>}
                {!loading && currentWord && synonyms.length === 0 && antonyms.length === 0 && (
                    <p> No synonyms or antonyms for "{currentWord}"</p>
                )}
                {synonyms.length > 0 && (
                    <div className = "synonyms-section">
                        <h4> Synonyms for "{currentWord}" </h4>
                        <div className = "word-cloud">
                            {synonyms.map(s =>(
                                <span key = {s} className = "synonym-word" onClick={()=> searchSynonym(s)}>
                                    {s}
                                </span>
                            ))}
                            </div>
                            </div>
                )}
                {antonyms.length > 0 && (
                    <div className = "antonyms-section">
                        <h4>Antonyms for {currentWord}</h4>
                        <div className = "word-cloud">
                            {antonyms.map(a =>(
                                <span key={a} className = "antonym-word">
                                    {a}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )


}

export default Thesaurus