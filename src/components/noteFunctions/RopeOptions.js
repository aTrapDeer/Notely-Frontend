// RopeOptions.js
import React, { useEffect } from 'react';
import './RopeOptions.css';

function RopeOptions({ options, onSelect, onClose }) {
  useEffect(() => {
    if (!options || options.length === 0) return;

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
  }, [onClose, options]);

  if (!options || options.length === 0) return null;

  const handleOptionClick = (option) => (e) => {
    e.stopPropagation();
    onSelect(option);
    onClose();
  };

  return (
    <div className="rope-options-overlay" onClick={onClose}>
      <div
        className="rope-options-window"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rope-options-title"
      >
        <h2 id="rope-options-title">Select a Note to Rope</h2>
        {options.map((option) => (
          <div
            key={option.id}
            className="option-item"
            onClick={handleOptionClick(option)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleOptionClick(option)(e);
              }
            }}
            aria-label={`Rope to note ${option.title}`}
          >
            {option.title}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RopeOptions;
