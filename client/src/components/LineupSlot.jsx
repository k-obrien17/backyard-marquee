export default function LineupSlot({ position, artist, onRemove }) {
  const slotLabels = ['Going first', 'Second', 'Third', 'Fourth', 'Going last'];

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border transition ${
        artist
          ? 'bg-gradient-to-r from-pink-500/20 to-purple-600/20 border-pink-500/50'
          : 'bg-white/5 border-white/10 border-dashed'
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
        {position}
      </div>

      {artist ? (
        <>
          {artist.image ? (
            <img
              src={artist.image}
              alt={artist.name}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-2xl">🎵</span>
            </div>
          )}
          <div className="flex-1">
            <p className="font-semibold text-lg">{artist.name}</p>
            <p className="text-gray-400 text-sm">{slotLabels[position - 1]}</p>
          </div>
          <button
            onClick={onRemove}
            className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 transition flex items-center justify-center"
          >
            ×
          </button>
        </>
      ) : (
        <div className="flex-1 text-gray-500">
          <p className="font-medium">{slotLabels[position - 1]}</p>
          <p className="text-sm">Search and add an artist</p>
        </div>
      )}
    </div>
  );
}
