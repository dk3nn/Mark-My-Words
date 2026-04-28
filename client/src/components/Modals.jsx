import React from 'react'

function Modals({isOPen, onClose, title, children}){
    
    if(!isOpen){
        return null
    }

    return(
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropafation()}>
                <span className ="close" onClick={onClose}>
                    &times;
                </span>
                <h3>{title}</h3>
                {children}
            </div>
        </div>
    )
}


export default Modals