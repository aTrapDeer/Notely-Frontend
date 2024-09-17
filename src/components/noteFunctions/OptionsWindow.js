// OptionsWindow.js
import React, { useEffect } from 'react';
import './OptionsWindow.css'; // Corrected the filename

function OptionsWindow({ onSelect, onClose, showOptionsWindow }) {
  useEffect(() => {
    if (!showOptionsWindow) return; // Only add listeners if the window is shown

    const handleClickOutside = (event) => {
      if (!event.target.closest('.options-window')) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, showOptionsWindow]); // Include showOptionsWindow in dependencies

  if (!showOptionsWindow) return null; // Early return after hooks are called

  const handleOptionClick = (option) => (e) => {
    e.stopPropagation(); // Prevent event from bubbling up to the overlay
    onSelect(option);
    onClose();
  };

  const handleTouchStart = (e) => {
    e.stopPropagation(); // Prevent touch event from bubbling up to the overlay
  };

  return (
    <div className="options-overlay">
      <div
        className="options-window"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the window from bubbling up
        onTouchStart={handleTouchStart} // Prevent touch events inside the window from bubbling up
        role="dialog"
        aria-modal="true"
        aria-labelledby="options-window-title"
      >
        <h2 id="options-window-title" className="visually-hidden">
          Select an Option
        </h2>
        <div
          className="option-item"
          onClick={handleOptionClick('todo')}
          onTouchStart={handleOptionClick('todo')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleOptionClick('todo')(e);
            }
          }}
          aria-label="Insert Todo Checkbox"
        >
          Checkbox
        </div>

      </div>
    </div>
  );
}

export default OptionsWindow;
