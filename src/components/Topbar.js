import React from 'react';
import Dropdown from './dropDown';

function TopBar({ signOut, isCollapsed, onToggleCollapse }) {
  return (
    <div className="relative">
      <div className={`top-bar z-50 bg-gradient-to-b from-blue-600 to-blue-700 shadow-lg transition-all duration-300 ease-in-out ${
        isCollapsed ? 'h-6' : 'h-12'
      }`}>
        <div className="w-full px-1 py-0.5 flex justify-between items-center relative h-full">
          {!isCollapsed && (
            <div className="flex items-center">
              <img src={require('../images/logo192.png')} alt="Notely Logo" className="h-6 w-6 mr-2" />
              <span className="text-xl font-bold text-white">Notely</span>
            </div>
          )}
          
          {!isCollapsed && (
            <div className="flex items-center">
              <Dropdown 
                onSignOut={signOut}
                buttonClassName="bg-blue-700 hover:bg-blue-600 text-white font-bold py-0.5 px-2 rounded focus:outline-none transition duration-300 ease-in-out text-xs" 
                menuClassName="origin-top-right absolute right-0 mt-0.5 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out transform -translate-y-1 scale-95"
              />
            </div>
          )}
        </div>
      </div>

      {/* Expander Tab */}
      <div className="absolute left-[70%] -bottom-4 transform -translate-x-1/2">
        <button
          onClick={onToggleCollapse}
          className="bg-gradient-to-b from-blue-600 to-blue-700 text-white p-1 rounded-b-lg focus:outline-none transition duration-300 ease-in-out shadow-md hover:from-blue-500 hover:to-blue-600 w-8 h-4 flex items-center justify-center"
          aria-label={isCollapsed ? 'Expand toolbar' : 'Collapse toolbar'}
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default TopBar;