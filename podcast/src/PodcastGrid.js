import React, { useEffect, useState } from 'react';
import Fuse from 'fuse.js';
import Header from './Header';
import './PodcastGrid.css';

function PodcastGrid(props) {
    const [rowData, setRowData] = useState([]);
    const [favorites, setFavorites] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [sortOption, setSortOption] = useState('');
    const [originalData, setOriginalData] = useState([]);
    const [selectedEpisodeId, setSelectedEpisodeId] = useState(null); // New state for selected episode

    useEffect(() => {
        setIsLoading(true);

        // Fetch shows data
        fetch('https://podcast-api.netlify.app/shows')
            .then(response => response.json())
            .then(shows => {
                const promises = shows.map(show => {
                    // Fetch episode data for each show
                    return fetch(`https://podcast-api.netlify.app/id/${show.id}`)
                        .then(response => response.json())
                        .then(showData => {
                            // Process and structure the episode data as needed
                            const id = showData.id;
                            const title = showData.title;
                            const description = showData.description;
                            const seasons = showData.seasons;
                            const image = showData.image;
                            const genres = showData.genres ? showData.genres.join(', ') : '';
                            const updated = showData.updated;
                            const episodes = showData.episodes || [];

                            return { id, title, description, seasons, image, genres, updated, episodes };
                        });
                });

                // Resolve promises for each show
                Promise.all(promises)
                    .then(data => {
                        setRowData(data);
                        setOriginalData(data);
                        setIsLoading(false);
                    })
                    .catch(error => {
                        console.error('Error fetching episode data:', error);
                        setIsLoading(false);
                    });
            })
            .catch(error => {
                console.error('Error fetching shows data:', error);
                setIsLoading(false);
            });
    }, []);

    const sortData = () => {
        let sortedData;
        switch (sortOption) {
            case 'az':
                sortedData = [...rowData].sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'za':
                sortedData = [...rowData].sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'dateAsc':
                sortedData = [...rowData].sort((a, b) => new Date(a.updated) - new Date(b.updated));
                break;
            case 'dateDesc':
                sortedData = [...rowData].sort((a, b) => new Date(b.updated) - new Date(a.updated));
                break;
            default:
                sortedData = rowData;
                break;
        }
        setRowData(sortedData);
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

    const loadEpisodeData = (episodeId) => {
        setSelectedEpisodeId(episodeId);
    };

    return (
        <div className="podcast-grid-container">
            {isLoading ? (
                <p>Loading...</p>
            ) : selectedEpisodeId ? (
                <div>
                    {/* Display selected episode details directly within PodcastGrid */}
                    <h2>{rowData.find(row => row.id === selectedEpisodeId).title}</h2>
                    {/* Add other episode details as needed */}
                    <button onClick={() => setSelectedEpisodeId(null)}>Back to Podcasts</button>
                </div>
            ) : (
                <>
                    <div style={{ padding: '10px', backgroundColor: '#2c3e50' }}>
                        <Header onSearch={handleSearch} />
                        <select onChange={handleSortOptionChange}>
                            <option value="">Sort by:</option>
                            <option value="az">Title A-Z</option>
                            <option value="za">Title Z-A</option>
                            <option value="dateAsc">Date Ascending</option>
                            <option value="dateDesc">Date Descending</option>
                        </select>
                        <button onClick={sortData}>Sort</button>
                    </div>
                    <div className="podcast-grid">
                        {rowData.map((row, index) => (
                            <div key={index} className="podcast-card">
                                <img src={row.image} alt={row.title} style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }} />
                                <h2>{row.title}</h2>
                                <p>{row.description}</p>
                                <p>Seasons: {row.seasons.length}</p>
                                <select onChange={handleSeasonChange}>
                                    {Array.from({ length: row.seasons.length }, (_, i) => i + 1).map((season) => (
                                        <option key={season} value={season}>
                                            Season {season}
                                        </option>
                                    ))}
                                </select>
                                <p>Last Updated: {row.updated}</p>
                                <button onClick={() => loadEpisodeData(row.id)}>Load Episode</button>
                                <div style={{ marginTop: '10px' }}>
                                    <button style={{ marginRight: '10px' }} onClick={() => handleFavorite(row.id)}>
                                        {favorites[row.id]?.isFavorite ? `❤️ Added to favorites on ${favorites[row.id].dateAdded}` : '❤️'}
                                    </button>
                                </div>
                                <div>
                                    
                                    <ul>
                                        {row.episodes.map((episode, episodeIndex) => (
                                            <li key={episodeIndex}>
                                                <h4>{episode.title}</h4>
                                                <p>{episode.description}</p>
                                                {/* Add other episode details as needed */}
                                                <button onClick={() => loadEpisodeData(episode.id)}>Episode</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                <h3>Genres:</h3>
                                <ul>
                                 {row.genres.split(', ').map((genre, index) => (
                           <li key={index} onClick={() => handleGenreClick(genre)} style={{ cursor: 'pointer' }}>
                            {genre}
            </li>
        ))}
    </ul>
</div>

                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default PodcastGrid;



















