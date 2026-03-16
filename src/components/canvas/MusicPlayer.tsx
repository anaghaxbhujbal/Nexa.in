import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, ChevronDown, Upload, Trash2, ExternalLink, Link } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  isDefault?: boolean;
}

const defaultTracks: Track[] = [
  { id: 'rain', title: 'Rain Sounds', artist: 'Nature', url: 'https://cdn.pixabay.com/audio/2022/05/31/audio_95e3e48007.mp3', isDefault: true },
  { id: 'forest', title: 'Forest Birds', artist: 'Nature', url: 'https://cdn.pixabay.com/audio/2022/08/31/audio_419263fc12.mp3', isDefault: true },
  { id: 'lofi', title: 'Lo-fi Chill', artist: 'Ambient', url: 'https://cdn.pixabay.com/audio/2024/11/01/audio_a29ef1dbe8.mp3', isDefault: true },
  { id: 'piano', title: 'Soft Piano', artist: 'Classical', url: 'https://cdn.pixabay.com/audio/2023/09/10/audio_4fba069de3.mp3', isDefault: true },
];

export function MusicPlayer() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [tracks, setTracks] = useState<Track[]>(defaultTracks);
  const [showSpotify, setShowSpotify] = useState(false);
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userInteracted = useRef(false);

  // Create audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 1;
    audioRef.current = audio;

    // Listen for canplay to auto-play when track loads
    const handleCanPlay = () => {
      if (userInteracted.current && audioRef.current) {
        audioRef.current.play().catch(console.error);
      }
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', (e.target as HTMLAudioElement)?.error);
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Load user tracks from DB
  useEffect(() => {
    if (!user) return;
    supabase.from('user_tracks').select('*').eq('user_id', user.id).order('created_at').then(({ data }) => {
      if (data && data.length > 0) {
        const userTracks: Track[] = data.map(t => ({
          id: t.id, title: t.title, artist: t.artist,
          url: t.storage_path
            ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/music/${t.storage_path}`
            : t.external_url || '',
        }));
        setTracks([...defaultTracks, ...userTracks]);
      }
    });
  }, [user]);

  const track = tracks[currentTrack];

  // Load new track source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track?.url) return;
    
    // Only change src if it's actually different
    const currentSrc = audio.src;
    const newSrc = track.url;
    if (currentSrc === newSrc) return;

    audio.pause();
    audio.src = newSrc;
    audio.load();
    // canplaythrough listener will auto-play if userInteracted is true
  }, [track?.url]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      userInteracted.current = true;
      // Only play if we have a source loaded
      if (audio.readyState >= 2) {
        audio.play().catch(console.error);
      }
      // Otherwise canplaythrough will handle it
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Handle mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const playTrack = (index: number) => {
    userInteracted.current = true;
    setCurrentTrack(index);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    userInteracted.current = true;
    setIsPlaying(prev => !prev);
  };

  const nextTrack = () => playTrack((currentTrack + 1) % tracks.length);
  const prevTrack = () => playTrack((currentTrack - 1 + tracks.length) % tracks.length);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from('music').upload(path, file);
    if (uploadError) { console.error(uploadError); return; }

    const title = file.name.replace(/\.[^/.]+$/, '');
    const { data } = await supabase.from('user_tracks').insert({
      user_id: user.id, title, artist: 'My Upload', storage_path: path,
    }).select().single();

    if (data) {
      const newTrack: Track = {
        id: data.id, title: data.title, artist: data.artist,
        url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/music/${path}`,
      };
      setTracks(prev => {
        const updated = [...prev, newTrack];
        playTrack(updated.length - 1);
        return updated;
      });
    }
    e.target.value = '';
  }, [user]);

  const handleDeleteTrack = useCallback(async (trackToDelete: Track) => {
    if (trackToDelete.isDefault) return;
    await supabase.from('user_tracks').delete().eq('id', trackToDelete.id);
    setTracks(prev => {
      const filtered = prev.filter(t => t.id !== trackToDelete.id);
      if (currentTrack >= filtered.length) setCurrentTrack(0);
      return filtered;
    });
  }, [currentTrack]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleUpload}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-3 w-72 glass-strong rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
              <span className="font-display font-semibold text-xs text-foreground">🎵 Writer's Radio</span>
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Upload music"
                >
                  <Upload className="w-3.5 h-3.5" />
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)} 
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Current track */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"
                  animate={isPlaying ? { rotate: [0, 360] } : { rotate: 0 }}
                  transition={isPlaying ? { duration: 4, repeat: Infinity, ease: 'linear' } : {}}
                >
                  <Music className="w-5 h-5 text-primary" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-medium text-sm text-foreground truncate">{track?.title}</p>
                  <p className="font-body text-xs text-muted-foreground">{track?.artist}</p>
                </div>
              </div>

              {/* Waveform */}
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
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={prevTrack} className="text-muted-foreground hover:text-foreground transition-colors">
                  <SkipBack className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <AnimatePresence mode="wait">
                    {isPlaying ? (
                      <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Pause className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Play className="w-4 h-4 ml-0.5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={nextTrack} className="text-muted-foreground hover:text-foreground transition-colors">
                  <SkipForward className="w-4 h-4" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => setIsMuted(!isMuted)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </motion.button>
              </div>
            </div>

            {/* Track list */}
            <div className="border-t border-border px-2 py-2 max-h-40 overflow-y-auto">
              {tracks.map((t, i) => (
                <motion.div
                  key={t.id}
                  whileHover={{ x: 2 }}
                  className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                    i === currentTrack ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <button
                    onClick={() => playTrack(i)}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  >
                    {i === currentTrack && isPlaying ? (
                      <motion.div 
                        className="w-3 h-3 shrink-0 flex items-end gap-px"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <span className="block w-0.5 h-1.5 bg-primary rounded-full" />
                        <span className="block w-0.5 h-3 bg-primary rounded-full" />
                        <span className="block w-0.5 h-2 bg-primary rounded-full" />
                      </motion.div>
                    ) : (
                      <Music className="w-3 h-3 shrink-0" />
                    )}
                    <span className="font-body text-xs truncate">{t.title}</span>
                    <span className="font-body text-[10px] text-muted-foreground ml-auto shrink-0">{t.artist}</span>
                  </button>
                  {!t.isDefault && (
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => handleDeleteTrack(t)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-destructive hover:text-destructive transition-opacity"
                      title="Remove track"
                    >
                      <Trash2 className="w-3 h-3" />
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Spotify link */}
            <div className="border-t border-border px-4 py-2.5">
              <AnimatePresence mode="wait">
                {showSpotify ? (
                  <motion.div 
                    key="input"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2"
                  >
                    <input
                      className="flex-1 text-xs font-body bg-muted rounded-lg px-2.5 py-1.5 outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-shadow"
                      placeholder="Paste Spotify playlist URL..."
                      value={spotifyUrl}
                      onChange={(e) => setSpotifyUrl(e.target.value)}
                    />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { if (spotifyUrl) window.open(spotifyUrl, '_blank'); }}
                      className="p-1.5 rounded-lg bg-[hsl(141,73%,42%)] text-primary-foreground hover:opacity-90"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setShowSpotify(true)}
                    whileHover={{ scale: 1.02 }}
                    className="w-full flex items-center justify-center gap-2 text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Link className="w-3 h-3" />
                    Connect Spotify / Music App
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors relative ${
              isPlaying ? 'bg-primary text-primary-foreground' : 'glass-strong text-muted-foreground hover:text-foreground'
            }`}
          >
            <Music className="w-5 h-5" />
            {isPlaying && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary"
                animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
