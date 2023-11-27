// Header.js
import React, { useState } from 'react';

function Header(props) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        props.onSearch(event.target.value);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: '#3498db' }}>
            <h1>The Film Club</h1>
            <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Search..." />
        </div>
    );
    
    
}

export default Header;
