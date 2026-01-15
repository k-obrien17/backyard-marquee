import { useState } from 'react';

export default function LineupSlotWithNote({ position, artist, onRemove, onNoteChange }) {
  const slotLabels = ['Going first', 'Second', 'Third', 'Fourth', 'Going last'];
  const [showNote, setShowNote] = useState(false);

  return (
    <div
      className={`rounded-xl border transition ${
        artist
          ? 'bg-gradient-to-r from-pink-500/20 to-purple-600/20 border-pink-500/50'
          : 'bg-white/5 border-white/10 border-dashed'
      }`}
    >
      <div className="flex items-center gap-4 p-4">
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
              onClick={() => setShowNote(!showNote)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                artist.note
                  ? 'bg-purple-500/30 text-purple-300 hover:bg-purple-500/40'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {artist.note ? 'Edit note' : '+ Add note'}
            </button>
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

      {/* Note input area */}
      {artist && showNote && (
        <div className="px-4 pb-4">
          <textarea
            value={artist.note || ''}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder={`Why did you pick ${artist.name}? What makes them special to you?`}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-pink-500 resize-none"
            rows={2}
          />
        </div>
      )}

      {/* Show note preview when collapsed */}
      {artist && artist.note && !showNote && (
        <div className="px-4 pb-3">
          <p className="text-sm text-gray-400 italic truncate">"{artist.note}"</p>
        </div>
      )}
    </div>
  );
}
