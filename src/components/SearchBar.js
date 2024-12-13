import React, { useState } from 'react';

function SearchBar() {
  const [searchScope, setSearchScope] = useState('global');

  return (
    <div className="hidden md:flex items-center h-8">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search notes.."
        className="h-full w-[300px] bg-white/10 text-white placeholder-gray-300 
        rounded-l-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20
        border border-white/10"
      />

      {/* Scope Selector */}
      <div className="h-full flex">
        <button
          onClick={() => setSearchScope('global')}
          className={`h-full px-3 flex items-center transition-colors duration-200
          ${searchScope === 'global' ? 'bg-blue-600' : 'bg-white/10 hover:bg-white/20'}`}
          aria-label="Global Search"
        >
          <svg 
            className="h-4 w-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </button>
        <button
          onClick={() => setSearchScope('personal')}
          className={`h-full px-3 flex items-center transition-colors duration-200
          ${searchScope === 'personal' ? 'bg-blue-600' : 'bg-white/10 hover:bg-white/20'}`}
          aria-label="Personal Search"
        >
          <svg 
            className="h-4 w-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
            />
          </svg>
        </button>
      </div>

      {/* Search Button */}
      <button
        className="h-full bg-white/10 hover:bg-white/20 text-white px-4 rounded-r-md 
        text-sm font-medium border border-white/10 transition-colors duration-200 
        flex items-center"
      >
        Search
      </button>
    </div>
  );
}

export default SearchBar; 