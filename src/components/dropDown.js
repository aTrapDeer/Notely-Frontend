import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Dropdown = ({ onSignOut, buttonClassName, menuClassName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = async (option) => {
    if (option === 'Logout') {
      try {
        await onSignOut();
        // After successful signOut, redirect to the root page
        navigate('/');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="dropdown dropdown-end" ref={dropdownRef}>
      <label 
        tabIndex={0} 
        className={`btn m-1 ${buttonClassName}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        Settings
      </label>
      {isOpen && (
        <ul tabIndex={0} className={`dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 ${menuClassName}`}>
          <li><Link to="/app" onClick={() => handleOptionClick('Dashboard')}>Dashboard</Link></li>
          <li><a onClick={() => handleOptionClick('My Account')}>My Account</a></li>
          <li><a onClick={() => handleOptionClick('Billing')}>Billing</a></li>
          <li><a onClick={() => handleOptionClick('Logout')}>Logout</a></li>
        </ul>
      )}
    </div>
  );
};

export default Dropdown;