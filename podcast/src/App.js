import React from "react";
import { PodcastGrid } from './PodcastGrid';



function App() {
    return (
      <div className="App">
        
        <PodcastGrid
          rssfeed = "https://podcast-api.netlify.app/shows"
          height= "500px"
          width="100%"
        ></PodcastGrid>
      </div>
    );
  }

  export default App;