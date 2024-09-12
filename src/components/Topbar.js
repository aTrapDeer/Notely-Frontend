import React from 'react';
import Dropdown from './dropDown';

function TopBar({ signOut }) {
  return (
    <div className="top-bar z-5 bg-gradient-to-b from-blue-600 to-blue-700 shadow-lg">
      <div className="w-full px-1 py-0.5 flex justify-between items-center">
        <div className="flex items-center">
          <img src={require('../images/logo192.png')} alt="Notely Logo" className="h-8 w-8 mr-2" /> 
          <span className="text-2xl font-bold text-white">Notely</span>
        </div>
        <Dropdown 
          onSignOut={signOut}
          buttonClassName="bg-blue-700 hover:bg-blue-600 text-white font-bold py-0.5 px-2 rounded focus:outline-none transition duration-300 ease-in-out text-sm" 
          menuClassName="origin-top-right absolute right-0 mt-0.5 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out transform -translate-y-1 scale-95"
        />
      </div>
    </div>
  );
}

export default TopBar;