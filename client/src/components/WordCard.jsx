import React, { useState, useEffect } from 'react'

function WordCard({word, onDelete, onEdit, onMove}){
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(word.userDefinition || '')
    const [showMoveMenu, setShowMoveMenu] = useState(false)
    const [folders, setFolders] = useState([])

    useEffect(() => {fetch('/folders').then(res => res.json()).then(data => setFolders(data))}, [])

    const handleSaveEdit = () => {
        onEdit(word.id, editValue)
        setIsEditing(false)
    }

    const moveToFolder = async (folderId) => {
        await fetch(`/saved/${word.id}/folder`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folder_id: folderId })
        })
        setShowMoveMenu(false)
        if (onMove){ 
            onMove()
        }
    }

    return(
        <div className = "word-card">
            <div className = "word-header">
                <h3>{word.word}</h3>
                <div className = "word-actions">
                    <button onClick={() => setShowMoveMenu(!showMoveMenu)}>
                        Add to Folder
                    </button>
                    <button onClick={() => setIsEditing(true)}>
                        My Definition
                    </button>
                    <button className="delete-btn" onClick={() => onDelete(word.id)}>
                        Delete
                    </button>
                </div>
            </div>
            {showMoveMenu && (
                <div className="move-menu">
                    <button onClick={() => moveToFolder(null)}>My Dictionary</button>
                    {folders.map(folder => (
                        <button key={folder.id} onClick={() => moveToFolder(folder.id)}>
                            {folder.name}
                        </button>
                    ))}
                </div>
            )}
            <div className="word-definition">
                <strong>Dictionary:</strong> {word.definition || 'No Definition'}
            </div>
            {word.user_definition && (
                <div className="user-definition">
                    <strong>My Definition:</strong> {word.user_definition}
                </div>
            )}
            {isEditing?(
                <div className="edit-definition">
                    <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows="3"
                    />
                    <button onClick = {handleSaveEdit}>
                        Save
                    </button>
                    <button onClick = {()=> setIsEditing(false)}>
                        Cancel
                    </button>
                </div>
            ) : (
                word.userDefinition && (
                    <div className="user-definition">
                        <strong>My definition:</strong> {word.userDefinition}
                    </div>
                )
            )}
            {word.synonyms && (
                <div className="word-synonym">
                    <strong>Synonyms:</strong> {word.synonyms}
                </div>
            )}
        </div>
            
    )
}

export default WordCard