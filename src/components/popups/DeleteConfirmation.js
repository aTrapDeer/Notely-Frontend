import React, { useEffect, useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import './DeleteConfirmation.css';

const DeleteConfirmation = ({ isOpen, onClose, onConfirm }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`delete-confirmation-overlay ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`delete-confirmation-content ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="delete-confirmation-header">
          <FaExclamationTriangle size={24} className="delete-confirmation-icon" />
          <h2 className="delete-confirmation-title">Confirm Deletion</h2>
        </div>
        <p className="delete-confirmation-message">Are you sure you want to delete this note? This action cannot be undone.</p>
        <div className="delete-confirmation-buttons">
          <button 
            onClick={onClose}
            className="delete-confirmation-button delete-confirmation-button-cancel"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="delete-confirmation-button delete-confirmation-button-delete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;