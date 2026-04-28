import React, { useState, useEffect } from 'react'
import Auth from './components/Auth'
import Dictionary from './components/Dictionary'
import Thesaurus from './components/Thesaurus'
import SavedWords from './components/SavedWords'
import Folders from './components/Folders'
import './App.css'

function App() {
    const [user, setUser] = useState(null)
    const [currentWord, setCurrentWord] = useState(null)
    const [currentDefinition, setCurrentDefinition] = useState(null)
    const [currentSynonyms, setCurrentSynonyms] = useState([])
    const [currentAntonyms, setCurrentAntonyms] = useState([])
    const [selectedFolder, setSelectedFolder] = useState(null)
    const [refreshSaved, setRefreshSaved] = useState(0)
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('http://localhost:3000/user')
            .then(res => res.json())
            .then(data => {
                if (data.loggedIn) {
                    setUser(data)
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="loading-container">
                <h1>📖 Mark My Words</h1>
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="container">
            <header>
                <h1>Mark My Words</h1>
            </header>

            <Auth user={user} setUser={setUser} />

            <div className="split-layout">
                <Dictionary
                  setCurrentWord={setCurrentWord}
                  setCurrentDefinition={setCurrentDefinition}
                  setCurrentSynonyms={setCurrentSynonyms}
                  setCurrentAntonyms={setCurrentAntonyms}
                  setSearchTerm={setSearchTerm}
                  user={user}
                />
                <Thesaurus searchTerm={searchTerm} />
            </div>

            {user && (
                <div className="my-dictionary">
                    <h2>My Dictionary</h2>
                    <Folders user={user} refreshSaved={refreshSaved} setRefreshSaved={setRefreshSaved} setSelectedFolder={setSelectedFolder}/>
                    <SavedWords
                      user={user}
                      refreshSaved={refreshSaved}
                      currentWord={currentWord}
                      currentDefinition={currentDefinition}
                      currentSynonyms={currentSynonyms}
                      currentAntonyms={currentAntonyms}
                      selectedFolder={selectedFolder}
                    />
                </div>
            )}
        </div>
    )
}

export default App