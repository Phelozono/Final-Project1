import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Fuse from 'fuse.js';

function Header(props) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        props.onSearch(searchTerm);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1>The Film Club</h1>
            <form onSubmit={handleSearchSubmit}>
                <input type="text" value={searchTerm} onChange={handleSearchChange} placeholder="Search..." />
                <button type="submit">Search</button>
            </form>
        </div>
    );
}

function PodcastGrid(props) {
    const [rowData, setRowData] = useState([]);
    const [favorites, setFavorites] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [sortOption, setSortOption] = useState('');
    const [originalData, setOriginalData] = useState([]);

    useEffect(() => {
        // Your existing useEffect code...
    }, []);

    const sortData = () => {
        // Your existing sortData function...
    };

    const handleSortOptionChange = (event) => {
        setSortOption(event.target.value);
    };

    const handleFavorite = (id) => {
        setFavorites({
            ...favorites,
            [id]: {
                dateAdded: new Date().toLocaleDateString(),
                isFavorite: !favorites[id]?.isFavorite
            }
        });
    };

    const handleGoBack = () => {
        console.log('Going back...');
    };

    const handleSeasonChange = (event) => {
        setSelectedSeason(event.target.value);
    };

    const handleSearch = (searchTerm) => {
        const options = {
            keys: ['title'],
            includeScore: true
        };
        const fuse = new Fuse(originalData, options);
        const result = fuse.search(searchTerm);
        setRowData(result.map(({ item }) => item));
    };

    const handleGenreClick = (genre) => {
        const filteredData = originalData.filter(row => row.genres.includes(genre));
        setRowData(filteredData);
    };

    return (
        <Router>
            <div>
                <nav>
                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/favorites">Favorites</Link>
                        </li>
                    </ul>
                </nav>

                <Route path="/" exact>
                    {/* Your existing JSX... */}
                </Route>
                <Route path="/favorites">
                    <Favorites favorites={favorites} />
                </Route>
            </div>
        </Router>
    );
}

function Favorites({ favorites }) {
    const favoritePodcasts = Object.values(favorites);

    return (
        <div>
            <h1>Your Favorites</h1>
            {favoritePodcasts.length > 0 ? (
                favoritePodcasts.map((podcast, index) => (
                    <div key={index}>
                        <h2>{podcast.title}</h2>
                        <p>Added on: {podcast.dateAdded}</p>
                        <img src={podcast.image} alt={podcast.title} />
                        <p>{podcast.description}</p>
                    </div>
                ))
            ) : (
                <p>You have no favorites yet.</p>
            )}
        </div>
    );
}

export default PodcastGrid;
