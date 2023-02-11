import React, { useState, useEffect, useRef } from 'react';

import * as satellite from 'satellite.js';

import Globe from './Globe.js';
import tleUrl from './assets/tle.txt';

function App() {
  const [globe, setGlobe] = useState(null);
  const [time, setTime] = useState(new Date());
  const [satData, setSatData] = useState([]);

  const globeRef = useRef(null);

  useEffect(() => {
    setGlobe(new Globe(globeRef, frameTicker));
  }, [])

  function frameTicker(sd, t) {
    setSatData(sd);
    setTime(t);
  }

  return (
    <main>
      <div className="tr-container">
        hi
      </div>
      <div className="time-log" elevation={0}>{time.toString()}</div>
      <div ref={globeRef} />
      <style>{`
      .tr-container {
        position: absolute;
        top: 20px;
        right: 20px;
      }
      .sat-list-paper {
        padding: 15px;
      }
      `}</style>
    </main>
  )
}

export default App
