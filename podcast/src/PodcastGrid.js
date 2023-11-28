import React, { useEffect, useState } from 'react';
import Fuse from 'fuse.js';
import Header from './Header';
import './PodcastGrid.css';

function PodcastGrid() {
  const [rowData, setRowData] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [sortOption, setSortOption] = useState('');
  const [originalData, setOriginalData] = useState([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(null);
  const [favoriteShows, setFavoriteShows] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteSortOption, setFavoriteSortOption] = useState('');
  const [episodeData, setEpisodeData] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetch('https://podcast-api.netlify.app/shows')
      .then(response => response.json())
      .then(shows => Promise.all(shows.map(show => fetch(`https://podcast-api.netlify.app/id/${show.id}`)
        .then(response => response.json())
        .then(({ id, title, description, seasons, image, genres, updated, episodes }) => ({
          id, title, description, seasons, image, genres: genres ? genres.join(', ') : '', updated, episodes: episodes || []
        })))))
      .then(data => {
        setRowData(data);
        setOriginalData(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedEpisodeId) {
      fetch(`https://podcast-api.netlify.app/id/${selectedEpisodeId}`)
        .then(response => response.json())
        .then(data => setEpisodeData(data))
        .catch(error => console.error('Error:', error));
    }
  }, [selectedEpisodeId]);

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

  const sortFavorites = () => {
    let sortedFavorites;
    switch (favoriteSortOption) {
      case 'az':
        sortedFavorites = [...favoriteShows].sort((a, b) => {
          const showA = rowData.find(show => show.id === a);
          const showB = rowData.find(show => show.id === b);
          return showA.title.localeCompare(showB.title);
        });
        break;
      case 'za':
        sortedFavorites = [...favoriteShows].sort((a, b) => {
          const showA = rowData.find(show => show.id === a);
          const showB = rowData.find(show => show.id === b);
          return showB.title.localeCompare(showA.title);
        });
        break;
      case 'dateAsc':
        sortedFavorites = [...favoriteShows].sort((a, b) => {
          const showA = rowData.find(show => show.id === a);
          const showB = rowData.find(show => show.id === b);
          return new Date(showA.updated) - new Date(showB.updated);
        });
        break;
      case 'dateDesc':
        sortedFavorites = [...favoriteShows].sort((a, b) => {
          const showA = rowData.find(show => show.id === a);
          const showB = rowData.find(show => show.id === b);
          return new Date(showB.updated) - new Date(showA.updated);
        });
        break;
      default:
        sortedFavorites = favoriteShows;
        break;
    }
    setFavoriteShows(sortedFavorites);
  };

  const handleFavorite = (id) => {
    const isFavorite = !favorites[id]?.isFavorite;
    const dateAdded = new Date().toLocaleString();
    const updatedFavorites = { ...favorites, [id]: { isFavorite, dateAdded } };
    setFavorites(updatedFavorites);
    const favoriteShowsList = Object.keys(updatedFavorites).filter(key => updatedFavorites[key].isFavorite);
    setFavoriteShows(favoriteShowsList);
  };

  const handleFavoriteEpisode = (episodeId) => {
    const isFavorite = !favorites[episodeId]?.isFavorite;
    const dateAdded = new Date().toLocaleString();
    const updatedFavorites = { ...favorites, [episodeId]: { isFavorite, dateAdded } };
    setFavorites(updatedFavorites);
    const favoriteShowsList = Object.keys(updatedFavorites).filter(key => updatedFavorites[key].isFavorite);
    setFavoriteShows(favoriteShowsList);
  };

  const handleSearch = (searchTerm) => {
    const options = { keys: ['title'], includeScore: true };
    const fuse = new Fuse(originalData, options);
    const result = fuse.search(searchTerm);
    setRowData(result.map(({ item }) => item));
  };

  const handleGenreClick = (genre) => {
    const filteredData = originalData.filter(row => row.genres.includes(genre));
    setRowData(filteredData);
  };

  const handleSelectSeason = (seasonNumber, showId) => {
    const selectedShow = rowData.find(show => show.id === showId);
    const selectedSeason = selectedShow.seasons.find(season => season.season === Number(seasonNumber));
    setSelectedSeason(selectedSeason);
  };

  return (
    <div className="podcast-grid-container">
      <div style={{ padding: '10px', backgroundColor: '#2c3e50' }}>
        <Header onSearch={handleSearch} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div>
            <select onChange={e => setSortOption(e.target.value)}>
              <option value="">Sort by:</option>
              <option value="az">Title A-Z</option>
              <option value="za">Title Z-A</option>
              <option value="dateAsc">Date Ascending</option>
              <option value="dateDesc">Date Descending</option>
            </select>
            <button onClick={sortData}>Sort</button>
          </div>
          <button onClick={() => setShowFavorites(!showFavorites)} style={{ marginTop: '10px' }}>
            {showFavorites ? 'Hide' : 'Show'} Favorites
          </button>
        </div>
        {showFavorites && (
          <div>
            <h2>Favorite Shows:</h2>
            <select onChange={e => setFavoriteSortOption(e.target.value)}>
              <option value="">Sort by:</option>
              <option value="az">Title A-Z</option>
              <option value="za">Title Z-A</option>
              <option value="dateAsc">Date Ascending</option>
              <option value="dateDesc">Date Descending</option>
            </select>
            <button onClick={sortFavorites}>Sort</button>
            {favoriteShows.map(favoriteId => {
              const favoriteShow = rowData.find(row => row.id === favoriteId);
              return (
                <div key={favoriteId}>
                  <h3>{favoriteShow.title}</h3>
                  <p>Added on {favorites[favoriteId].dateAdded}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : episodeData ? (
        <div>
          <h2>{episodeData.title}</h2>
          <p>{episodeData.description}</p>
          <audio controls>
            <source src={episodeData.audio} type="audio/mpg" />
            Your browser does not support the audio element.
          </audio>
          <button onClick={() => setSelectedEpisodeId(null)}>Back to Podcasts</button>
        </div>
      ) : (
        <div className="podcast-grid">
          {rowData.map((row, index) => (
            <div key={index} className="podcast-card">
              <img src={row.image} alt={row.title} style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }} />
              <h2>{row.title}</h2>
              <p>{row.description}</p>
              <p>Seasons: {row.seasons.length}</p>
              <p>Last Updated: {row.updated}</p>
              <div style={{ marginTop: '10px' }}>
              <button style={{ marginRight: '10px', color: favorites[row.id]?.isFavorite ? 'red' : 'black' }} onClick={() => handleFavorite(row.id)}>
                  ❤️
                </button>
              </div>
              <select onChange={e => handleSelectSeason(e.target.value, row.id)}>
                <option value="">Select a season</option>
                {row.seasons.sort((a, b) => a.season - b.season).map((season, seasonIndex) => (
                  <option key={seasonIndex} value={season.season}>
                    Season {season.season}
                  </option>
                ))}
              </select>
              {selectedSeason && row.seasons.includes(selectedSeason) && (
                <div>
                  <h3>Episodes:</h3>
                  <ul>
                    {selectedSeason.episodes.map((episode, episodeIndex) => (
                      <li key={episodeIndex}>
                        <h4>{episode.title}</h4>
                        <p>{episode.description}</p>
                        <audio controls>
                          <source src={episode.file} type="audio/mpg" />
                          Your browser does not support the audio element.
                        </audio>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
      )}
    </div>
  );
}

export default PodcastGrid;


