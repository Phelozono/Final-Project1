import React from 'react';

export function AudioPlayer({ src }) 
{
    return (
        <audio controls>
            <source src={src} type="audio/mpeg" />
            Your browser does not support the audio element.
        </audio>
    );
}

export default AudioPlayer;