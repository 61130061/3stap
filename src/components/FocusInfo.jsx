import React, { useState } from 'react';

/* 
TODO:
- [ ] Unit
- [x] Fix alt value by multiply by EARTH_RADIUS
*/
export default function FocusInfo ({ data, earthRadius }) {
  const [hide, setHide] = useState(false);

  if (!data || !earthRadius) return 

  if (hide) {
    return (
      <button
        className="absolute z-[90] bottom-[20vh] right-3 font-bold w-12 h-12 bg-zinc-900 rounded-lg text-gray-300"
        onClick={() => setHide(false)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 m-auto">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </button>
    )
  }

  return (
    <div className="absolute z-20 max-w-[260px] bottom-[15vh] right-3 bg-zinc-900 rounded-lg p-3 text-sm">
      <button className="absolute top-3 right-3 w-6 h-6 rounded text-gray-400 hover:bg-zinc-800" onClick={() => setHide(true)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 m-auto">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
      <div className="flex justify-between items-center mb-2">
        <div className="uppercase font-semibold mr-10">Selected Satellite</div>
      </div>
      <div className="grid grid-cols-6 gap-2 py-1 items-start">
        <div className="uppercase col-span-2">Name:</div>
        <div className="col-span-4">{data.name}</div>
      </div>
      <div className="grid grid-cols-6 gap-2 py-1 items-start">
        <div className="uppercase col-span-2">Norad ID:</div>
        <div className="col-span-4">{data.norad_id}</div>
      </div>
      <div className="grid grid-cols-6 gap-2 py-1 items-start">
        <div className="col-span-2">lat:</div>
        <div className="col-span-3">{data.lat.toFixed(3)}</div>
        <div>deg</div>
      </div>
      <div className="grid grid-cols-6 gap-2 py-1 items-start">
        <div className="col-span-2">lng:</div>
        <div className="col-span-3">{data.lng.toFixed(3)}</div>
        <div>deg</div>
      </div>
      <div className="grid grid-cols-6 gap-2 py-1 items-start">
        <div className="col-span-2">alt:</div>
        <div className="col-span-3">{(data.alt * earthRadius).toFixed(3)}</div>
        <div>deg</div>
      </div>
      <div className="grid grid-cols-6 gap-2 py-1 items-start">
        <div className="col-span-2">velocity:</div>
        <div className="col-span-3">{data.vel.toFixed(3)}</div>
        <div>km/s</div> 
      </div>
    </div>
  )
}