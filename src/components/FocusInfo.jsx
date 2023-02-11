import React, { useState } from 'react';

/* 
TODO:
- [ ] Unit
- [ ] Fix alt value by multiply by EARTH_RADIUS
*/
export default function FocusInfo ({ data, earthRadius }) {
  const [hide, setHide] = useState(false);

  if (!data) return 

  if (hide) {
    return (
      <button
        className="absolute z-20 bottom-[10vh] right-3 font-bold w-12 h-12 bg-zinc-900 rounded"
        onClick={() => setHide(false)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 m-auto">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </button>
    )
  }

  return (
    <div className="absolute z-20 max-w-[20vw] bottom-[10vh] right-3 bg-zinc-900 rounded-lg p-3 text-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="uppercase font-semibold mr-10">Selected Satellite</div>
        <button className="w-5 h-5 rounded text-gray-400 hover:bg-zinc-800" onClick={() => setHide(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 m-auto">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1 py-1 items-center">
        <div className="uppercase">Name</div>
        <div>{data.name}</div>
      </div>
      <div className="grid grid-cols-2 gap-1 py-1 items-center">
        <div>lat</div>
        <div>{data.lat.toFixed(3)}</div>
      </div>
      <div className="grid grid-cols-2 gap-1 py-1 items-center">
        <div>lng</div>
        <div>{data.lng.toFixed(3)}</div>
      </div>
      <div className="grid grid-cols-2 gap-1 py-1 items-center">
        <div>alt</div>
        <div>{(data.alt * earthRadius).toFixed(3)}</div>
      </div>
    </div>
  )
}