// OptionsWindow.js
import React, { useEffect } from 'react';
import './OptionsWindow.css';

function OptionsWindow({ onSelect, onClose, showOptionsWindow, options }) {
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
  }, [onClose, showOptionsWindow]);

  if (!showOptionsWindow) return null;

  const handleOptionClick = (option) => (e) => {
    e.stopPropagation();
    onSelect(option);
    onClose();
  };

  const handleTouchStart = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="options-overlay">
      <div
        className="options-window"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        role="dialog"
        aria-modal="true"
        aria-labelledby="options-window-title"
      >
        {options && options.length > 0 ? (
          options.map((option) => (
            <div
              key={option.id}
              className="option-item"
              onClick={() => onSelect(option)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelect(option);
                }
              }}
              aria-label={`Rope to note ${option.title}`}
            >
              {option.title}
            </div>
          ))
        ) : (
          <>
            <div
              className="option-item"
              onClick={handleOptionClick('todo')}
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

            <div
              className="option-item"
              onClick={handleOptionClick('rope')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleOptionClick('rope')(e);
                }
              }}
              aria-label="Create Rope"
            >
              Note Rope
            </div>

            <div
              className="option-item"
              onClick={handleOptionClick('gpt')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleOptionClick('gpt')(e);
                }
              }}
              aria-label="Generate note data"
            >
              Generate Note Data
            </div>

            <div
              className="option-item"
              onClick={handleOptionClick('finish')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleOptionClick('finish')(e);
                }
              }}
              aria-label="Finish note with AI"
            >
              Finish Note
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OptionsWindow;
