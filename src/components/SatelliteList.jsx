export default function SatelliteList({ satData, globe }) {

  return (
    <div className="absolute top-3 right-3 bg-zinc-900 rounded-lg py-3 text-sm flex flex-col gap-2">
      {satData.length > 0 &&
      <div className="grid grid-cols-6 gap-1 px-4 py-1 items-center uppercase text-xs font-semibold">
        <div className="col-span-3">Satellite</div>
        <div className="text-center">Label</div>
        <div className="text-center">Track</div>
        <div className="text-center"></div>
      </div>
      }
      {satData.length > 0 &&
      <div className="max-h-[30vh] overflow-y-auto">
        {satData.map((d, i) =>
          <div key={i} className="grid grid-cols-6 gap-1 hover:cursor-pointer hover:bg-zinc-800 px-4 py-1 items-center">
            <div className="col-span-3">{d.name}</div>
            <div className="flex justify-center">
              <button className="w-4 h-4 bg-zinc-600 rounded"></button>
            </div>
            <div className="flex justify-center">
              {d.path ?
                <button onClick={() => globe.delPath(d)} className="w-4 h-4 bg-blue-400 rounded flex justify-center items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </button>:
                <button onClick={() => {
                  globe.genPath(d)
                  globe.updatePath();
                }} className="w-4 h-4 bg-zinc-600 rounded"></button>
              }
            </div>
            <button className="px-2 py-1 rounded hover:bg-zinc-700">del</button>
          </div>
        )}
      </div>
      }
      <div className="px-4 py-1 text-xs">
        <button className="uppercase bg-zinc-500 hover:bg-zinc-400 px-16 py-2 rounded font-bold text-black w-full">+ add satellite</button>
      </div>
    </div>
  )
}