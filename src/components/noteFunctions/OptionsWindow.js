import React from 'react';

function OptionsWindow({ onSelect, showOptionsWindow }) {
  if (!showOptionsWindow) return null;

  return (
    <div className="options-window absolute bottom-full left-0 bg-white border border-gray-300 rounded shadow-lg p-2">
      <div className="option cursor-pointer hover:bg-gray-100 p-1" onClick={() => onSelect('todo')}>
        Checkbox
      </div>
      {/* Add more options here */}
    </div>
  );
}

export default OptionsWindow;