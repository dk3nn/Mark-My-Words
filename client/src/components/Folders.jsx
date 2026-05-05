import React, { useState, useEffect } from 'react'

function Folders({user, refreshSaved, setRefreshSaved, setSelectedFolder}){
    const [folders, setFolders] = useState([])
    const [showNewFolder, setShowNewFolder] = useState(false)
    const [localSelectedFolder, setLocalSelectedFolder] = useState(null)
    const [newFolderName, setNewFolderName] = useState('')

    useEffect(() =>{
        if (user){
            loadFolders()
        }
    },[user])

    const loadFolders = async () => {
        const response = await fetch('/folders',{
            credentials: 'include'
        })
        const data = await response.json()
        setFolders(data)
    }

    const createFolder = async () => {
        if(!newFolderName.trim()) return
        
        await fetch('/folders',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name: newFolderName}),
        })
        
        setNewFolderName('')
        setShowNewFolder(false)
        loadFolders()
    }

    const deleteFolder = async (folderId) => {
    if (!confirm('Delete this folder?')) return
    
        try {
            const response = await fetch(`/folders/${folderId}`, {
                method: 'DELETE',
                credentials: 'include'
            })
        
            if (response.ok) {
                loadFolders()
                setRefreshSaved(prev => prev + 1)
            }else {
                alert('Failed to delete folder')
            }
        }catch (error) {
            alert('Error deleting folder')
        }
    }

    const filterByFolder = (folderId) => {
         setLocalSelectedFolder(folderId)  
        setSelectedFolder(folderId)        
        setRefreshSaved(prev => prev + 1)
    }

    if(!user){
        return null
    }

    return (
    <div className="folders-bar">
        <div className="folders-list">
            <button className={`folder-btn ${!localSelectedFolder ? 'active' : ''}`} onClick={() => filterByFolder(null)}>
                My Dictionary
            </button>
            {folders.map(folder => (
                <div key={folder.id} className="folder-item">
                    <button className={`folder-btn ${localSelectedFolder === folder.id ? 'active' : ''}`}
                     onClick={() => filterByFolder(folder.id)}>
                        {folder.name}
                    </button>
                    <button 
                        className="delete-folder-btn" 
                        onClick={() => deleteFolder(folder.id)} 
                        title="Delete folder"
                    >
                        Delete Folder
                    </button>
                </div>
            ))}
        </div>
        
        {showNewFolder ? (
            <div>
                <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                />
                <button onClick={createFolder}>Create</button>
                <button onClick={() => setShowNewFolder(false)}>Cancel</button>
            </div>
        ) : (
            <button className="small-btn" onClick={() => setShowNewFolder(true)}>
                New Folder
            </button>
        )}
    </div>
)
    

}

export default Folders
