import { useState, useEffect } from 'react';
import axios from 'axios';

const useNotes = (userDetails) => {
    const [notes, setNotes] = useState([]);

  // After fetching and setting notes
  useEffect(() => {
    if (userDetails && userDetails['USER#']) {
      const userId = userDetails['USER#'].replace('USER#', '');
      axios.get(`${process.env.REACT_APP_BACKEND_URL}/get_notes/${userId}`)
        .then(response => {
          const notesWithPosition = response.data.notes.map(note => ({
            ...note,
            positionX: note.positionX || 0, 
            positionY: note.positionY || 0, 
            width: note.width || 400,  // Ensure width is set
            height: note.height || 390,  // Ensure height is set
            tags: note.tags || [],
            organization: note.organization || '', // Ensure organization is set
            linkedNoteId: note.linkedNoteId || null, // Ensure linkedNoteId is set
          }));
          setNotes(notesWithPosition);
          console.log("Fetched Notes:", notesWithPosition); // Add this line
        })
        .catch(error => console.log('Error fetching notes:', error));
    }
  }, [userDetails]);

  const handleSubmit = (noteData, workspaceTransform) => {
    const newNote = {
      ...noteData,
      id: noteData.noteId,
      positionX: workspaceTransform.x,
      positionY: workspaceTransform.y,
    };
    
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/save_note`, newNote)
      .then(response => {
        //console.log('Note saved successfully:', response.data);
        setNotes([...notes, newNote]);
      })
      .catch(error => {
        console.error('Failed to save the note:', error);
      });
  };

  const handleDelete = (noteId) => {
    if (!userDetails || !userDetails['USER#']) {
      console.error('User information is missing.');
      return;
    }
 
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/delete_note`, { 
      userId: userDetails['USER#'],
      noteId: noteId 
    })
    .then(response => {
      //console.log(response.data.message);
      setNotes(notes.filter(note => note.id !== noteId));
    })
    .catch(error => {
      console.error('Error deleting the note:', error);
    });
  };

    
  const handleEdit = (updatedNote) => {
    const newNotes = notes.map((note) => 
      note.id === updatedNote.id ? { ...note, ...updatedNote } : note
    );
    setNotes(newNotes);

  axios.post(`${process.env.REACT_APP_BACKEND_URL}/update_note`, {
    userId: userDetails['USER#'],
    id: updatedNote.id,
    positionX: updatedNote.positionX,
    positionY: updatedNote.positionY,
    width: updatedNote.width,
    height: updatedNote.height,
    ...updatedNote  
  })
    .then(response => {
      //console.log('Note updated successfully:', response.data);
    })
    .catch(error => {
      console.error('Failed to update the note:', error);
    });
};

  return { notes, handleSubmit, handleDelete, handleEdit};
};
export default useNotes;