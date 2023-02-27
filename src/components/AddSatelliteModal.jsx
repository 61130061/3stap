import React, { useState, useEffect } from 'react';

export default function AddSatelliteModal({ onClose, norad, globe, onPushSats }) {
  const [isByName, setIsByName] = useState(true);
  const [search, setSearch] = useState('');
  const [range, setRange] = useState([0, 30])
  const [data, setData] = useState(norad.filter(item => !globe.checkSatAdd(item.OBJECT_NAME)).slice(range[0], range[1]));

  const handleScroll = e => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 100;

    if (bottom) {
      const newRange = [range[0]+30, range[1]+30]
      setData([...data, ...norad.slice(newRange[0], newRange[1])])
      setRange(newRange);
    }
  };

  return (
    <div className="relative z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"></div>
      <div className="fixed inset-0 z-10 overflow-hidden">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-zinc-900 text-left shadow-xl transition-all sm:my-2 sm:w-full sm:max-w-lg py-3">
            <button onClick={onClose} className="absolute top-2 right-2 w-7 h-7 rounded hover:bg-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 m-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div>
              <div className="px-5 py-1 mb-2 text-xl font-semibold">Active Satellite List</div>
              <div className="flex text-sm items-center gap-2 px-3 mb-1 bg-zinc-900">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 px-3 py-2 bg-zinc-800 rounded-lg"
                  type="text"
                  placeholder="Search"
                />

                <div className="flex items-center">
                  <input className="peer/name hidden" id="by Name" name="search by" type="radio" checked={isByName} onChange={() => setIsByName(true)} />
                  <label
                    className="peer-checked/name:border-gray-400 peer-checked/name:text-white border-transparent text-gray-400 border px-2 rounded py-1 font-medium hover:cursor-pointer peer-checked/name:hover:cursor-default"
                    htmlFor="by Name"
                  >
                    by Name
                  </label>

                  <input className="peer/norad hidden" id="by Norad ID" name="search by" type="radio" checked={!isByName} onChange={() => setIsByName(false)} />
                  <label
                    className="peer-checked/norad:border-gray-400 peer-checked/norad:text-white border-transparent text-gray-400 border px-2 rounded py-1 font-medium hover:cursor-pointer peer-checked/norad:hover:cursor-default"
                    htmlFor="by Norad ID"
                  >
                    by Norad ID
                  </label>
                </div>
              </div>
              <div className="bg-zinc-900 grid grid-cols-3 gap-2 pr-6 px-5 py-3 items-center uppercase text-xs font-semibold">
                <div>Name</div>
                <div className="text-center">Norad CAT ID</div>
              </div>
              {search == '' ?
                <>
                  {data ?
                    <div onScroll={e => handleScroll(e)} className="relative bg-zinc-900 overflow-y-auto h-[50vh]">
                      {data.map((d, i) =>
                        !globe.checkSatAdd(d.OBJECT_NAME) &&
                        <div key={i} className="grid grid-cols-3 gap-2 px-5 py-2 items-center text-xs font-semibold hover:bg-zinc-800 border-b border-opacity-50 border-zinc-500 last:border-0">
                          <div className="">{d.OBJECT_NAME}</div>
                          <div className="text-center">{d.NORAD_CAT_ID}</div>
                          <div className="flex justify-end">
                            <button onClick={() => onPushSats(d)} className="px-1 py-1 text-xs bg-zinc-800 rounded border border-zinc-900 group">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:text-green-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div> :
                    <div className="h-[50vh] px-5 text-xs text-center">Loading...</div>
                  }</> :
                <div className="relative bg-zinc-900 overflow-y-auto h-[50vh]">
                  {norad.filter(item => {
                    if (!isByName) {
                      return item.NORAD_CAT_ID.toString().toLowerCase().includes(search.toLowerCase())
                    }
                    return item.OBJECT_NAME.toLowerCase().includes(search.toLowerCase())
                  }).map((d, i) =>
                    !globe.checkSatAdd(d.OBJECT_NAME) &&
                    <div key={i} className="grid grid-cols-3 gap-2 px-5 py-2 items-center text-xs font-semibold hover:bg-zinc-800 border-b border-opacity-50 border-zinc-500 last:border-0">
                      <div className="">{d.OBJECT_NAME}</div>
                      <div className="text-center">{d.NORAD_CAT_ID}</div>
                      <div className="flex justify-end">
                        <button onClick={() => onPushSats(d)} className="px-1 py-1 text-xs bg-zinc-800 rounded border border-zinc-900 group">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:text-green-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}