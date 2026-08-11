"use client";

import { AlertCircle, LoaderCircle, Music2, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type MusicTrack = { title?: string | null; artist?: string | null; url: string; volume?: number | null; source?: "novel" | "chapter" };

export default function MusicPlayer({ track, compact = false }: { track: MusicTrack; compact?: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const volume = Math.max(0, Math.min(100, track.volume ?? 35)) / 100;

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
    return () => { audio?.pause(); };
  }, [track.url, volume]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { pause(); return; }
    setError("");
    setLoading(true);
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setError("Audio tidak dapat diputar. Periksa URL atau format file.");
      setPlaying(false);
    } finally {
      setLoading(false);
    }
  }

  return <section className={`reader-music-player ${compact ? "reader-music-compact" : ""}`} aria-label="Pemutar musik">
    <audio ref={audioRef} src={track.url} preload="metadata" loop onWaiting={() => setLoading(true)} onCanPlay={() => setLoading(false)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setError("Audio gagal dimuat."); setLoading(false); setPlaying(false); }} />
    <button type="button" onClick={toggle} className={`reader-music-prompt ${playing ? "is-playing" : ""}`} aria-label={playing ? "Jeda musik pengiring" : "Putar musik pengiring"} disabled={loading}>
      <span className="reader-music-prompt-icon">{loading ? <LoaderCircle className="animate-spin" size={18} /> : playing ? <Pause size={17} fill="currentColor" /> : <Music2 size={18} />}</span>
      <span className="reader-music-prompt-copy"><strong>{playing ? "Musik sedang diputar" : "Putar musik pengiring"}</strong><small>{playing ? (track.title || "Ketuk untuk menjeda") : "Disarankan untuk menemani membaca"}</small></span>
      {!playing ? <Play className="reader-music-prompt-play" size={15} fill="currentColor" aria-hidden="true" /> : null}
    </button>
    {error ? <p className="reader-music-error" role="alert"><AlertCircle size={15} />{error}</p> : null}
  </section>;
}
