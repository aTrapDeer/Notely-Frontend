import React from 'react';
import Note from './Note';

const NoteList = ({ notes, onDeleteClick, onEdit, workspaceRef, zoomLevel }) => {
  return (
    <div className="note-list">
      {notes.map(note => (
        <Note
          key={note.id}
          note={note}
          onDeleteClick={onDeleteClick}
          onEdit={onEdit}
          workspaceRef={workspaceRef}
          zoomLevel={zoomLevel}
        />
      ))}
    </div>
  );
};

export default NoteList;