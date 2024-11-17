import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './sidePanel.css';

const SidePanel = ({ userDetails }) => {
    const [notes, setNotes] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (userDetails && userDetails['USER#']) {
            console.log('UserDetails for fetch:', userDetails);
            fetchNotes();
        }
    }, [userDetails]);

    const fetchNotes = async () => {
        try {
            const userId = userDetails['USER#'].split('#')[1];
            console.log('Fetching notes for user ID:', userId);
            
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/get_notes_panel/${userId}`
            );
            
            console.log('API Response:', response.data);
            
            if (response.data && Array.isArray(response.data.notes)) {
                const sortedNotes = [...response.data.notes].sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                    return dateB - dateA;
                });
                setNotes(sortedNotes);
                setError(null);
            } else {
                console.error('Invalid response format:', response.data);
                setError('Invalid response format');
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            setError(error.message);
        }
    };

    const handleNotebookClick = (noteId) => {
        // Placeholder for notebook functionality
        console.log('Opening notebook for note:', noteId);
    };

    const handleGoToClick = (noteId) => {
        // Placeholder for go to functionality
        console.log('Going to note:', noteId);
    };

    return (
        <>
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)} 
                    className="expand-button"
                    aria-label="Open notes panel"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}
            <div className={`side-panel ${isOpen ? 'open' : 'closed'}`}>
                <div className="panel-header">
                    <h2>My Notes</h2>
                    <button onClick={() => setIsOpen(!isOpen)} className="toggle-button">
                        {isOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                    </button>
                </div>
                <div className="notes-list">
                    {error && <p className="error-message">Error: {error}</p>}
                    {!error && notes.length === 0 && (
                        <p className="no-notes">No notes found</p>
                    )}
                    {notes.map((note) => (
                        <div key={note.id} className="note-card">
                            <h3 className="note-title">{note.title || 'Untitled'}</h3>
                            <div className="tags-container">
                                {Array.isArray(note.tags) && note.tags.map((tag, index) => (
                                    <span key={index} className="tag">{tag}</span>
                                ))}
                            </div>
                            <p className="note-preview">
                                {note.content ? note.content.substring(0, 100) + '...' : 'No content'}
                            </p>
                            <div className="note-meta">
                                {note.createdAt && (
                                    <span className="note-date">
                                        Created: {new Date(note.createdAt).toLocaleDateString()}
                                    </span>
                                )}
                                <div className="note-actions">
                                    <button 
                                        onClick={() => handleNotebookClick(note.id)}
                                        className="action-button notebook-button"
                                    >
                                        Notebook
                                    </button>
                                    <button 
                                        onClick={() => handleGoToClick(note.id)}
                                        className="action-button goto-button"
                                    >
                                        Go To
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default SidePanel;

