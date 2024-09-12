import React from 'react';
import Dropdown from './dropDown';

function TopBar({ signOut }) {
  return (
    <div className="top-bar z-10 bg-white shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="text-6xl font-black text-white uppercase tracking-wider py-4 px-6 bg-gray-800 rounded-xl">Notely</div>
        <Dropdown 
          onSignOut={signOut}
          buttonClassName="bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none" 
          menuClassName="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-md bg-white transition-transform duration-300 ease-in-out transform -translate-y-1 scale-95"
        />
      </div>
    </div>
  );
}

export default TopBar;