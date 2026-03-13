import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, ChevronUp, ChevronDown, Link, ExternalLink } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
}

const ambientTracks: Track[] = [
  { id: 'lo-fi', title: 'Lo-fi Chill', artist: 'Ambient' },
  { id: 'rain', title: 'Rain Sounds', artist: 'Nature' },
  { id: 'cafe', title: 'Coffee Shop', artist: 'Ambiance' },
  { id: 'piano', title: 'Soft Piano', artist: 'Classical' },
  { id: 'forest', title: 'Forest Birds', artist: 'Nature' },
];

export function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showSpotify, setShowSpotify] = useState(false);
  const [spotifyUrl, setSpotifyUrl] = useState('');

  const track = ambientTracks[currentTrack];

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % ambientTracks.length);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + ambientTracks.length) % ambientTracks.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      {/* Expanded player */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-3 w-64 bg-card border border-card-border rounded-xl shadow-lg overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-muted/30 border-b border-border">
              <div className="flex items-center justify-between">
                <span className="font-display font-semibold text-xs text-foreground">Writer's Radio</span>
                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Current track */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-medium text-sm text-foreground truncate">{track.title}</p>
                  <p className="font-body text-xs text-muted-foreground">{track.artist}</p>
                </div>
              </div>

              {/* Waveform animation */}
              <div className="flex items-end gap-0.5 h-6 mt-3 px-1">
                {Array.from({ length: 24 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-full bg-primary/40"
                    animate={isPlaying ? {
                      height: [4, Math.random() * 20 + 4, 4],
                    } : { height: 4 }}
                    transition={isPlaying ? {
                      duration: 0.8 + Math.random() * 0.4,
                      repeat: Infinity,
                      delay: i * 0.05,
                    } : {}}
                    style={{ height: 4 }}
                  />
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mt-3">
                <button onClick={prevTrack} className="text-muted-foreground hover:text-foreground transition-colors">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button onClick={nextTrack} className="text-muted-foreground hover:text-foreground transition-colors">
                  <SkipForward className="w-4 h-4" />
                </button>
                <button onClick={() => setIsMuted(!isMuted)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Track list */}
            <div className="border-t border-border px-2 py-2 max-h-32 overflow-y-auto">
              {ambientTracks.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => { setCurrentTrack(i); setIsPlaying(true); }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${
                    i === currentTrack ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Music className="w-3 h-3 shrink-0" />
                  <span className="font-body text-xs truncate">{t.title}</span>
                  <span className="font-body text-[10px] text-muted-foreground ml-auto">{t.artist}</span>
                </button>
              ))}
            </div>

            {/* Spotify / External link */}
            <div className="border-t border-border px-4 py-2.5">
              {showSpotify ? (
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 text-xs font-body bg-muted rounded-md px-2 py-1.5 outline-none text-foreground placeholder:text-muted-foreground"
                    placeholder="Paste Spotify playlist URL..."
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                  />
                  <button
                    onClick={() => { if (spotifyUrl) window.open(spotifyUrl, '_blank'); }}
                    className="p-1.5 rounded-md bg-[hsl(141,73%,42%)] text-primary-foreground hover:opacity-90"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSpotify(true)}
                  className="w-full flex items-center justify-center gap-2 text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Link className="w-3 h-3" />
                  Connect Spotify / Music App
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini FAB */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors ${
            isPlaying ? 'bg-primary text-primary-foreground' : 'bg-card border border-card-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <Music className="w-5 h-5" />
          {isPlaying && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary"
              animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.button>
      )}
    </motion.div>
  );
}
