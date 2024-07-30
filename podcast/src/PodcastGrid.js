import React, { useEffect, useState, useCallback } from 'react';
import Fuse from 'fuse.js';
import Slider from 'react-slick';
import Header from './Header';
import './PodcastGrid.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function PodcastGrid() {
  const [rowData, setRowData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [favoriteEpisodes, setFavoriteEpisodes] = useState({});
  const [favoriteShows, setFavoriteShows] = useState([]);
  const [sortOption, setSortOption] = useState('');
  const [favoriteSortOption, setFavoriteSortOption] = useState('');
  const [episodeData, setEpisodeData] = useState(null);
  const [expandedShowId, setExpandedShowId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastListeningState, setLastListeningState] = useState(null);

  useEffect(() => {
    // Load last listening state
    const savedState = localStorage.getItem('lastListeningState');
    if (savedState) {
      setLastListeningState(JSON.parse(savedState));
    }

    setIsLoading(true);
    fetch('https://podcast-api.netlify.app/shows')
      .then(response => response.json())
      .then(shows => Promise.all(shows.map(show =>
        fetch(`https://podcast-api.netlify.app/id/${show.id}`)
          .then(response => response.json())
          .then(({ id, title, description, seasons, image, genres, updated, episodes }) => ({
            id, title, description, seasons, image, genres: genres ? genres.join(', ') : '', updated, episodes: episodes || []
          }))
      )))
      .then(data => {
        setRowData(data);
        setOriginalData(data);
        setIsLoading(false);

        if (savedState) {
          const { showId, episodeId, timestamp } = savedState;
          const show = data.find(s => s.id === showId);
          if (show) {
            const episode = show.episodes.find(e => e.id === episodeId);
            if (episode) {
              setEpisodeData({ ...episode, timestamp });
            }
          }
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
        setErrorMessage('Failed to fetch podcast data. Please try again later.');
      });
  }, []);

  useEffect(() => {
    if (episodeData && episodeData.timestamp !== undefined) {
      // Save the last listening state to local storage
      const { id: showId, episodes } = rowData.find(show => show.episodes.includes(episodeData));
      const { id: episodeId, timestamp } = episodeData;
      localStorage.setItem('lastListeningState', JSON.stringify({ showId, episodeId, timestamp }));
    }
  }, [episodeData, rowData]);

  const handleFavorite = useCallback((id) => {
    const isFavorite = !favorites[id]?.isFavorite;
    const dateAdded = new Date().toLocaleString();
    const updatedFavorites = { ...favorites, [id]: { isFavorite, dateAdded } };
    setFavorites(updatedFavorites);
    const favoriteShowsList = Object.keys(updatedFavorites).filter(key => updatedFavorites[key].isFavorite);
    setFavoriteShows(favoriteShowsList);
  }, [favorites]);

  const sortData = useCallback((option) => {
    const sortedData = [...rowData].sort((a, b) => {
      switch (option) {
        case 'az':
          return a.title.localeCompare(b.title);
        case 'za':
          return b.title.localeCompare(a.title);
        case 'dateAsc':
          return new Date(a.updated) - new Date(b.updated);
        case 'dateDesc':
          return new Date(b.updated) - new Date(a.updated);
        default:
          return 0;
      }
    });
    setRowData(sortedData);
    setSortOption(option);
  }, [rowData]);

  const handleFavoriteSort = useCallback((option) => {
    const sortedFavorites = [...favoriteShows].sort((a, b) => {
      const showA = rowData.find(show => show.id === a);
      const showB = rowData.find(show => show.id === b);
      switch (option) {
        case 'az':
          return showA.title.localeCompare(showB.title);
        case 'za':
          return showB.title.localeCompare(showA.title);
        default:
          return 0;
      }
    });
    setFavoriteShows(sortedFavorites);
    setFavoriteSortOption(option);
  }, [favoriteShows, rowData]);

  const handleSearch = useCallback((searchTerm) => {
    const options = { keys: ['title'], includeScore: true };
    const fuse = new Fuse(originalData, options);
    const result = fuse.search(searchTerm);
    setRowData(result.map(({ item }) => item));
  }, [originalData]);

  const handleGenreClick = useCallback((genre) => {
    const filteredData = originalData.filter(row => row.genres.includes(genre));
    setRowData(filteredData);
  }, [originalData]);

  const handleSelectSeason = (season, showId) => {
    const show = rowData.find(s => s.id === showId);
    const selected = show.seasons.find(s => s.season === parseInt(season));
    setSelectedSeason(selected);
  };

  const handleFavoriteEpisode = (episode) => {
    const isFavorite = !favoriteEpisodes[episode.id]?.isFavorite;
    const updatedFavorites = { ...favoriteEpisodes, [episode.id]: { isFavorite } };
    setFavoriteEpisodes(updatedFavorites);
  };

  const toggleShowDetails = (id) => {
    setExpandedShowId(expandedShowId === id ? null : id);
  };

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1
        }
      }
    ]
  };

  // Filter the favorite shows from the rowData
  const favoriteShowData = rowData.filter(show => favoriteShows.includes(show.id));

  return (
    <div className="podcast-grid-container">
      <Header onSearch={handleSearch} onSort={sortData} onFavoriteSort={handleFavoriteSort} />
      
      {/* Conditionally render the carousel based on the presence of favorite shows */}
      {favoriteShowData.length > 0 && (
        <div className="carousel">
          <h2>Favorite Shows</h2>
          <Slider {...carouselSettings}>
            {favoriteShowData.map((show, index) => (
              <div key={index} className="carousel-item">
                <img src={show.image} alt={show.title} className="carousel-image" />
                <h3>{show.title}</h3>
              </div>
            ))}
          </Slider>
        </div>
      )}

      <div className="podcast-grid">
        {isLoading ? (
          <p>Loading...</p>
        ) : errorMessage ? (
          <p>{errorMessage}</p>
        ) : episodeData ? (
          <div>
            <h2>{episodeData.title}</h2>
            <p>{episodeData.description}</p>
            <audio controls currentTime={episodeData.timestamp || 0}>
              <source src={episodeData.file} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
            <button onClick={() => setEpisodeData(null)}>Back to Podcasts</button>
          </div>
        ) : (
          rowData.map((show, index) => (
            <PodcastCard 
              key={index} 
              show={show} 
              expandedShowId={expandedShowId} 
              toggleShowDetails={toggleShowDetails} 
              handleFavorite={handleFavorite} 
              selectedSeason={selectedSeason}
              handleSelectSeason={handleSelectSeason}
              handleFavoriteEpisode={handleFavoriteEpisode}
              handleGenreClick={handleGenreClick}
              favorites={favorites}
              favoriteEpisodes={favoriteEpisodes}
            />
          ))
        )}
      </div>
    </div>
  );
}

function PodcastCard({ show, expandedShowId, toggleShowDetails, handleFavorite, selectedSeason, handleSelectSeason, handleFavoriteEpisode, handleGenreClick, favorites, favoriteEpisodes }) {
  return (
    <div className="podcast-card">
      <img src={show.image} alt={show.title} className="podcast-image" />
      <h2>{show.title}</h2>
      {expandedShowId === show.id ? (
        <>
          <p>{show.description}</p>
          <p>Seasons: {show.seasons.length}</p>
          <p>Last Updated: {show.updated}</p>
          <button onClick={() => handleFavorite(show.id)}>
            {favorites[show.id]?.isFavorite ? '💔' : '❤️'}
          </button>
          <select onChange={e => handleSelectSeason(e.target.value, show.id)}>
            <option value="">Select a season</option>
            {show.seasons.sort((a, b) => a.season - b.season).map((season, seasonIndex) => (
              <option key={seasonIndex} value={season.season}>
                Season {season.season} ({season.episodes.length} episodes)
              </option>
            ))}
          </select>
          {selectedSeason && show.seasons.find(season => season.season === selectedSeason.season) && (
            <div>
              <h3>Episodes:</h3>
              <ul>
                {selectedSeason.episodes.map((episode, episodeIndex) => (
                  <li key={episodeIndex}>
                    <h4>{episode.title}</h4>
                    <button onClick={() => handleFavoriteEpisode(episode)}>
                      {favoriteEpisodes[episode.id]?.isFavorite ? '💔' : '❤️'}
                    </button>
                    <audio controls>
                      <source src={episode.file} type="audio/mp3" />
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
              {show.genres.split(', ').map((genre, index) => (
                <li key={index} onClick={() => handleGenreClick(genre)} style={{ cursor: 'pointer' }}>
                  {genre}
                </li>
              ))}
            </ul>
          </div>
          <button onClick={() => toggleShowDetails(show.id)}>Hide Details</button>
        </>
      ) : (
        <button onClick={() => toggleShowDetails(show.id)}>Show Details</button>
      )}
    </div>
  );
}

export default PodcastGrid;

