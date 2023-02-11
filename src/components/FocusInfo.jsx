import React, { useState } from 'react';

/* 
TODO:
- [ ] Unit
- [ ] Fix alt value by multiply by EARTH_RADIUS
*/
export default function FocusInfo ({ data }) {
  const [hide, setHide] = useState(false);

  const keys = ['name', 'lat', 'lng', 'alt'];

  if (!data) return 

  if (hide) {
    return (
      <button
        className="absolute bottom-[10vh] right-3 font-bold px-5 py-2 bg-zinc-900 rounded"
        onClick={() => setHide(false)}
      >I</button>
    )
  }

  return (
    <div className="absolute bottom-[10vh] right-3 bg-zinc-900 rounded-lg p-3 text-sm">
      <div className="flex justify-between mb-2">
        <div className="uppercase font-semibold mr-10">Selected Satellite</div>
        <button onClick={() => setHide(true)}>hide</button>
      </div>
      {keys.map((k, i) =>
        <div key={i} className="grid grid-cols-2 gap-1 py-1 items-center">
          <div className="uppercase">{k}</div>
          {['lat', 'lng', 'alt'].includes(k) ?
            <div>{data[k].toFixed(3)}</div> :
            <div>{data[k]}</div>
          }
        </div>
      )}
    </div>
  )
}