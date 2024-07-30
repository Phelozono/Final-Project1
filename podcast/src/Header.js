// Header.js
import React, { useState } from 'react';
import './Header.css';

const Header = ({ onSearch, onSort }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1>The FILM CLUB</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search podcasts..."
            value={searchTerm}
            onChange={handleInputChange}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <div className="sort-container">
          <button onClick={() => onSort('az')}>Sort A-Z</button>
          <button onClick={() => onSort('za')}>Sort Z-A</button>
          <button onClick={() => onSort('dateAsc')}>Sort by Date Asc</button>
          <button onClick={() => onSort('dateDesc')}>Sort by Date Desc</button>
        </div>
      </div>
    </header>
  );
};

export default Header;

