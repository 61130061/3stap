import React, { useState, useEffect, useRef } from 'react';
import * as satellite from 'satellite.js';

import SatelliteList from './components/SatelliteList';
import FocusInfo from './components/FocusInfo';

import Globe from './Globe.js';
import tleActive from './assets/tle_active.txt';


function App() {
  const [loading, setLoading] = useState(true);
  const [norad, setNorad] = useState(null);

  const [globe, setGlobe] = useState(null);
  const [time, setTime] = useState(new Date());
  const [satData, setSatData] = useState([]);
  const [pause, setPause] = useState(false);
  const [timeSel, setTimeSel] = useState('x2');
  const [focus, setFocus] = useState(null);

  const [source, setSource] = useState('3STAP TLE');
  const [isRefresh, setIsRefresh] = useState(false);

  const globeRef = useRef(null);
  const url = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle';
  var params = new URLSearchParams(window.location.search);

  useEffect(() => {
    if (!norad) {
      if (params.get('data') == 'dev') {
        console.log('dev mode');
        fetchData(setNorad, false, () => {
          setSource('previous data collected by 3STAP (click REFRESH DATA to download latest data)');
        });
      } else {
        fetchNoradData(setNorad, true);
      }
    }
  }, [])

  function frameTicker(sd, t, p, ts, fs) {
    setSatData([...sd]);
    setTime(t);
    setPause(p);
    setTimeSel(ts);
    setFocus(fs);
  }

  function fetchNoradData(set, abort) {
    // Fetching aborting
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    setIsRefresh(true);

    fetch('https://celestrak.org/NORAD/elements/index.php?FORMAT=tle', { signal: abort && controller.signal }).then((res) => res.text()).then((html) => {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, "text/html");

      const updateEle = doc.activeElement.firstElementChild.getElementsByTagName('h3');
      const localUpdate = localStorage.getItem('celestrak-update');

      if (updateEle.length > 0 && localUpdate && updateEle[0].innerText == localUpdate) {
        // fetch data from localstorage
        const ctData = localStorage.getItem('celestrak-data');
        if (ctData) {
          console.log('Loading data from localstorage!');
          
          let arr = [];

          const tleData = ctData.replace(/\r/g, '').split(/\n(?=[^12])/).map(tle => tle.split('\n'));
          tleData.map((d, i) => {
            const satrec = satellite.twoline2satrec(d[1], d[2]);

            arr.push({
              satrec,
              name: d[0].trim().replace(/^0 /, ''), // trim name
              norad_id: satrec.satnum.replace(/\b0+/g, ''),
              orbitalPeriod: (2 * Math.PI) / (satrec.no / 60),
              path: null,
              showLabel: false
            }); });

          set(arr);
          setLoading(false);
          setTimeout(() => setIsRefresh(false), 3000);
          setGlobe(new Globe(globeRef, arr, frameTicker));
          setSource('celestrak.org ' + updateEle[0].innerText);
        }
        return
      }

      fetchData(set, url, true, (data) => {
        localStorage.setItem('celestrak-update', updateEle[0].innerText);
        localStorage.setItem('celestrak-data', data);
        setSource('celestrak.org ' + updateEle[0].innerText);
        setTimeout(() => setIsRefresh(false), 3000);
      });
    }).catch((err) => {
      console.log('Failed to check update data from CelesTrak!');
      console.log(err);

      // fetch data from file
      fetchData(set, tleActive, false, () => {
        setSource('previous data collected by 3STAP (click REFRESH DATA to download latest data)');
        setTimeout(() => setIsRefresh(false), 3000);
      });
    });

  }

  function fetchData (set, source, abort, callback) {
    // Fetching aborting
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    let arr = [];

    console.log(source);

    fetch(source, { signal: abort && controller.signal }).then(res => res.text()).then(rawData => {
      const tleData = rawData.replace(/\r/g, '').split(/\n(?=[^12])/).map(tle => tle.split('\n'));
      tleData.map((d, i) => {
        const satrec = satellite.twoline2satrec(d[1], d[2]);

        arr.push({
          satrec,
          name: d[0].trim().replace(/^0 /, ''), // trim name
          norad_id: satrec.satnum.replace(/\b0+/g, ''),
          orbitalPeriod: (2 * Math.PI) / (satrec.no / 60),
          path: null,
          showLabel: false
        });
      });

      return rawData;
    }).then((data) => {
      set(arr);
      setLoading(false);
      setGlobe(new Globe(globeRef, arr, frameTicker));
      if (callback) callback(data);
    }).catch((err) => {
      console.log('Failed to fetch data from source!');
      console.log(err);

      fetchData(set, tleActive, false, () => {
        setSource('previous data collected by 3STAP (click REFRESH DATA to download latest data)');
      });
    })
  }

  return (
    <main>
      {loading ?
        <div className="flex z-[999] justify-center items-center h-screen">
          <p>Loading...</p>
        </div> :
        <>
          <div className="z-[90] select-none absolute top-3 left-5">
            <div className="text-6xl font-bold mb-2">3STAP</div>
            <div className="text-sm mb-3">by <a className="font-bold text-yellow-400" href="https://ascom-lab.space" target="_blank">ASCOM-LAB.SPACE</a></div>
            <div className="text-xs rounded max-w-[200px] mb-1 text-gray-500">
              TLE source: {source} 
            </div>
            <button 
              onClick={() => {
                fetchNoradData(setNorad, false);
              }}
              className="text-sm text-gray-400 underline underline-offset-2 hover:text-white disabled:cursor-not-allowed disabled:no-underline disabled:hover:text-gray-400"
              disabled={isRefresh}
            >
              {isRefresh ? 'Loading...' : 'REFRESH DATA'}
            </button>
          </div>
          <SatelliteList norad={norad} satData={satData} globe={globe} focus={focus} />
          <FocusInfo data={focus ? satData.filter(item => item.name == focus)[0] : null} earthRadius={globe?.getEarthRadius()} />
          <div className="absolute bottom-3 z-[90] left-3 text-sm">
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
            <div className="text-xs sm:text-normal px-2 py-1 bg-zinc-900 rounded">
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
