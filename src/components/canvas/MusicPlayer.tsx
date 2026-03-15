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

// Free ambient audio from public domain sources
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

  // Audio element management
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }
    const audio = audioRef.current;
    audio.src = track?.url || '';
    audio.muted = isMuted;
    if (isPlaying && track?.url) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [currentTrack, tracks]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying && track?.url) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const nextTrack = () => setCurrentTrack((prev) => (prev + 1) % tracks.length);
  const prevTrack = () => setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);

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
      setTracks(prev => [...prev, newTrack]);
      setCurrentTrack(tracks.length);
      setIsPlaying(true);
    }
    e.target.value = '';
  }, [user, tracks.length]);

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
            className="mb-3 w-72 bg-card border border-card-border rounded-xl shadow-lg overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
              <span className="font-display font-semibold text-xs text-foreground">Writer's Radio</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 rounded text-muted-foreground hover:text-foreground"
                  title="Upload music"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
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
            <div className="border-t border-border px-2 py-2 max-h-40 overflow-y-auto">
              {tracks.map((t, i) => (
                <div
                  key={t.id}
                  className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                    i === currentTrack ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <button
                    onClick={() => { setCurrentTrack(i); setIsPlaying(true); }}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  >
                    <Music className="w-3 h-3 shrink-0" />
                    <span className="font-body text-xs truncate">{t.title}</span>
                    <span className="font-body text-[10px] text-muted-foreground ml-auto">{t.artist}</span>
                  </button>
                  {!t.isDefault && (
                    <button
                      onClick={() => handleDeleteTrack(t)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-destructive hover:text-destructive transition-opacity"
                      title="Remove track"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Spotify link */}
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
