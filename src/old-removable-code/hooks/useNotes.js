// hooks/useNotes.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const useNotes = (userDetails) => {
    const [notes, setNotes] = useState([]);

    const handleEdit = (updatedNote) => {
        setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
    };
    useEffect(() => {
        if (userDetails && userDetails['USER#']) {
            const userId = userDetails['USER#'].replace('USER#', '');
            axios.get(`${process.env.REACT_APP_BACKEND_URL}/get_notes/${userId}`)
            .then(response => {
                const notesWithPosition = response.data.notes.map(note => ({
                    ...note,
                    positionX: note.PositionX || 0,
                    positionY: note.PositionY || 0,
                    tags: note.Tags || [] // Initialize tags with an empty array if it's undefined
                }));
                setNotes(notesWithPosition);
            })
            .catch(error => console.error('Failed to fetch notes:', error));
        }
    }, [userDetails]);

    const handleDelete = (noteId) => {
        if (!userDetails || !userDetails['USER#']) {
          console.error('User information is missing.');
          return;
        }
      
        const userId = userDetails['USER#'];
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/delete_note`, JSON.stringify({ userId, noteId }), { 
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then(response => {
          console.log(response.data.message);
          setNotes(notes.filter(note => note.id !== noteId));
        })
        .catch(error => {
          console.error('Error deleting the note:', error);
        });
      };

      
    const handleSubmit = (noteData, resetForm) => {
        console.log('Submitting note:', noteData);
        
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/save_note`, noteData) 
        .then(response => {
            console.log('Note saved successfully:', response.data);
            setNotes([...notes, { ...noteData, id: noteData.noteId }]);
            resetForm();
        })
        .catch(error => {
            console.error('Failed to save the note:', error);
        });
    };

    return { notes, handleDelete, handleSubmit, handleEdit };
};

export default useNotes;
