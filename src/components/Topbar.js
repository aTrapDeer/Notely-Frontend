import React from 'react';
import Dropdown from './dropDown';

function TopBar({ signOut, isCollapsed, onToggleCollapse }) {
  return (
    <header className="w-full">
      <div className={`top-bar fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-blue-600 to-blue-700 shadow-lg transition-all duration-300 ease-in-out ${
        isCollapsed ? 'h-8' : 'h-14'
      }`}>
        <div className="w-full h-full flex justify-between items-center px-4">
          {!isCollapsed && (
            <div className="flex items-center h-full py-2">
              <img src={require('../images/logo192.png')} alt="Notely Logo" className="h-6 w-6 mr-2" />
              <span className="text-xl font-bold text-white">Notely</span>
            </div>
          )}
          
          <div className="flex items-center h-full gap-2">
            <button
              onClick={onToggleCollapse}
              className="bg-blue-700 hover:bg-blue-600 text-white p-1 rounded focus:outline-none transition duration-300 ease-in-out w-6 h-6 flex items-center justify-center"
              aria-label={isCollapsed ? 'Expand toolbar' : 'Collapse toolbar'}
            >
              {isCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              )}
            </button>

            {!isCollapsed && (
              <Dropdown 
                onSignOut={signOut}
                buttonClassName="bg-blue-700 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded focus:outline-none transition duration-300 ease-in-out text-sm" 
                menuClassName="origin-top-right absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
              />
            )}
          </div>
        </div>
      </div>

      {/* Spacer div with fixed height */}
      <div className={`${isCollapsed ? 'h-8' : 'h-14'}`} />
    </header>
  );
}

export default TopBar;