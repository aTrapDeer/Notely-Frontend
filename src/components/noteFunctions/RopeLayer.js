// RopeLayer.js
import React from 'react';

const RopeLayer = ({ notes }) => {
  const ropes = [];

  notes.forEach(note => {
    if (note.linkedNoteId) {
      const linkedNote = notes.find(n => n.id === note.linkedNoteId);
      if (linkedNote) {
        const from = {
          x: note.positionX + (note.width || 300) / 2,
          y: note.positionY,
        };
        const to = {
          x: linkedNote.positionX + (linkedNote.width || 300) / 2,
          y: linkedNote.positionY + (linkedNote.height || 390),
        };

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const controlPointOffset = Math.min(100, distance / 2);

        const path = `M${from.x},${from.y} C${from.x},${from.y - controlPointOffset} ${to.x},${to.y + controlPointOffset} ${to.x},${to.y}`;

        ropes.push(<path key={`${note.id}-${linkedNote.id}`} d={path} stroke="brown" strokeWidth="2" fill="none" />);
      }
    }
  });

  return (
    <svg className="rope-svg">
      {ropes}
    </svg>
  );
};

export default RopeLayer;
