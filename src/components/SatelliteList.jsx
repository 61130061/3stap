import React, { useState } from 'react';

import AddSatelliteModal from './AddSatelliteModal';

export default function SatelliteList({ satData, globe, focus, norad }) {
  const [modal, setModal] = useState(false);

  function onPushSats(tle) {
    globe.pushSats([tle]);
    setModal(false);
  }

  return (
    <>
      {modal &&
        <AddSatelliteModal globe={globe} norad={norad} onClose={() => setModal(false)} onPushSats={onPushSats} />
      }
      <div className="absolute max-w-[360px] top-3 right-3 bg-zinc-900 z-[90] rounded-lg py-3 text-sm flex flex-col gap-2">
        {satData.length > 0 &&
          <div className="grid grid-cols-6 gap-2 px-4 py-1 items-center uppercase text-xs font-semibold">
            <div className="col-span-3">Satellite</div>
            <div className="text-center">Label</div>
            <div className="text-center">Track</div>
            <div className="text-center"></div>
          </div>
        }
        {satData.length > 0 &&
          <div className="max-h-[30vh] overflow-y-auto scroll-smooth">
            {satData.map((d, i) =>
              <div key={i} id={'sat-list-' + d.name} className="grid grid-cols-6 gap-2 hover:bg-zinc-800 px-4 py-1 items-center">
                <div onClick={() => globe.setFocus(d.name)} className={`hover:cursor-pointer col-span-3${d.name == focus ? ' text-yellow-300' : ''}`}>{d.name}</div>
                <div className="flex justify-center">
                  {d.showLabel ?
                    <button onClick={() => globe.setLabel(d.name)} className="w-4 h-4 bg-blue-400 rounded flex justify-center items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </button> :
                    <button onClick={() => globe.setLabel(d.name)} className="w-4 h-4 bg-zinc-600 rounded"></button>
                  }
                </div>
                <div className="flex justify-center">
                  {d.path ?
                    <button onClick={() => globe.delPath(d)} className="w-4 h-4 bg-blue-400 rounded flex justify-center items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </button> :
                    <button onClick={() => {
                      globe.genPath(d)
                      globe.updatePath();
                    }} className="w-4 h-4 bg-zinc-600 rounded"></button>
                  }
                </div>
                <div className="flex justify-center">
                  <button onClick={() => globe.delSat(d.name)} className="w-6 h-6 flex justify-center items-center rounded hover:bg-zinc-700 hover:text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        }
        <div className="px-4 py-1 text-xs">
          <button onClick={() => setModal(true)} className="uppercase bg-zinc-500 hover:bg-zinc-400 px-16 py-2 rounded font-bold text-black w-full">+ add satellite</button>
        </div>
      </div>
    </>
  )
}