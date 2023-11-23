import React from 'react';

function EpisodeList({ episodes }) {
    return (
        <div>
            {episodes.map((episode, index) => (
                <div key={index}>
                    <h2>{episode.title}</h2>
                    <p>{episode.description}</p>
                    <audio controls src={episode.audioUrl}>
                        Your browser does not support the audio element.
                    </audio>
                </div>
            ))}
        </div>
    );
}

export default EpisodeList;
