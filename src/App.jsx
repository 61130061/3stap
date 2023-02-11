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
  const [pause, setPause] = useState(false);
  const [timeSel, setTimeSel] = useState('x2');
  const [focus, setFocus] = useState(null);

  const globeRef = useRef(null);

  useEffect(() => {
    setGlobe(new Globe(globeRef, frameTicker));

    return () => {
      setGlobe(null);
    }
  }, [])

  function frameTicker(sd, t, p, ts, fs) {
    setSatData(sd);
    setTime(t);
    setPause(p);
    setTimeSel(ts);
    setFocus(fs);
  }

  return (
    <main>
      {globe &&
        <>
          <div onClick={() => console.log(focus)} className="z-20 text-5xl font-bold select-none absolute top-3 left-3">3STAP</div>
          <SatelliteList satData={satData} globe={globe} focus={focus} />
          <FocusInfo data={focus ? satData.filter(item => item.name == focus)[0] : null} earthRadius={globe.getEarthRadius()} />
          <div className="absolute bottom-3 z-20 left-3 text-sm">
            <div className="flex gap-2 mb-2">
              <button onClick={() => globe.pause = !pause} className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 rounded capitalize text-xs font-semibold">
                {pause ?
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                  </svg> :
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                  </svg>
                }
              </button>
              {timeSel == 'live' ?
                <div className="px-3 py-2 bg-zinc-900 text-red-600 text-center hover:bg-zinc-800 rounded capitalize text-xs font-semibold">Live</div> :
                <button onClick={() => globe.timeSel = 'live'} className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 rounded capitalize text-xs font-semibold">Live</button>
              }
              {['x2', 'x5', 'x10'].map((d, i) =>
                d == timeSel ?
                  <div className="px-3 py-2 select-none bg-zinc-900 border border-gray-400 rounded text-xs font-semibold" key={i}>{d}</div> :
                  <button onClick={() => globe.timeSel = d} className="px-3 py-2 bg-zinc-900 border border-transparent hover:bg-zinc-800 rounded text-xs font-semibold" key={i}>{d}</button>
              )}
            </div>
            <div className="px-2 py-1 bg-zinc-900 rounded">
              {time.toString()}
            </div>
          </div>
        </>
      }
      <div ref={globeRef} />
    </main>
  )
}

export default App
