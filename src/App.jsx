import React, { useState, useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import * as satellite from 'satellite.js';

import Globe from './Globe.js';
import tleUrl from './assets/tle.txt';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

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
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <main>
        <Button onClick={() => console.log(satData)} variant='contained'>Show</Button>
        <div className="tr-container">
          <Paper className="sat-list-paper" elevation={0}>
            Hi
          </Paper>
        </div>
        <Paper className="time-log" elevation={0}>{time.toString()}</Paper>
        <div ref={globeRef} />
      </main>
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
    </ThemeProvider>
  )
}

export default App
