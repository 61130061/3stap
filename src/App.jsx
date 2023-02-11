import React, { useState, useEffect, useRef } from 'react';
import * as satellite from 'satellite.js';

import SatelliteList from './components/SatelliteList';
import FocusInfo from './components/FocusInfo';

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
      <div onClick={() => globe.test()} className="text-5xl font-bold select-none absolute top-3 left-3">3STAP</div> 
      <SatelliteList satData={satData} />
      <FocusInfo data={null} />
      <div className="absolute bottom-3 left-3 text-sm p-1 bg-zinc-900 rounded">
        {time.toString()}
      </div>
      <div ref={globeRef} />
    </main>
  )
}

export default App
