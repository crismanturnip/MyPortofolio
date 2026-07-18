"use client";

import { AlertCircle, LoaderCircle, Music2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type MusicTrack = { title?: string | null; artist?: string | null; url: string; source?: "novel" | "chapter" };

function timeLabel(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}

export default function MusicPlayer({ track, compact = false }: { track: MusicTrack; compact?: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    return () => { audio?.pause(); };
  }, [track.url]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { pause(); return; }
    setError(""); setLoading(true);
    try { await audio.play(); setPlaying(true); }
    catch { setError("Audio tidak dapat diputar. Periksa URL atau format file."); setPlaying(false); }
    finally { setLoading(false); }
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(value)) return;
    audio.currentTime = value;
    setCurrentTime(value);
  }

  function changeVolume(value: number) {
    const audio = audioRef.current;
    const next = Math.max(0, Math.min(1, value));
    if (audio) audio.volume = next;
    setVolume(next);
  }

  return <section className={`reader-music-player ${compact ? "reader-music-compact" : ""}`} aria-label="Pemutar musik">
    <audio ref={audioRef} src={track.url} preload="metadata" onLoadedMetadata={(event) => { setDuration(event.currentTarget.duration || 0); setLoading(false); }} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onWaiting={() => setLoading(true)} onCanPlay={() => setLoading(false)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => { setError("Audio gagal dimuat."); setLoading(false); setPlaying(false); }} />
    <div className="reader-music-main">
      <button type="button" onClick={toggle} className="reader-music-toggle" aria-label={playing ? "Jeda musik" : "Putar musik"} disabled={loading}>
        {loading ? <LoaderCircle className="animate-spin" size={20} /> : playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
      </button>
      <span className={`reader-equalizer ${playing ? "is-playing" : ""}`} aria-hidden="true"><i /><i /><i /></span>
      <div className="reader-music-copy"><p className="reader-music-title">{track.title || "Musik pengiring"}</p><p className="reader-music-meta">{track.artist || "Audio pilihan penulis"}{track.source ? ` · Musik ${track.source}` : ""}</p></div>
      <button type="button" onClick={() => changeVolume(volume > 0 ? 0 : 0.75)} className="reader-music-volume-button" aria-label={volume > 0 ? "Bisukan musik" : "Aktifkan suara"}>{volume > 0 ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
    </div>
    <div className="reader-music-controls"><span>{timeLabel(currentTime)}</span><input type="range" min={0} max={duration || 0} step={0.1} value={Math.min(currentTime, duration || 0)} onChange={(event) => seek(Number(event.target.value))} aria-label="Posisi musik" className="reader-music-progress" /><span>{timeLabel(duration)}</span><label className="reader-music-volume"><Volume2 size={15} aria-hidden="true" /><input type="range" min={0} max={1} step={0.05} value={volume} onChange={(event) => changeVolume(Number(event.target.value))} aria-label="Volume musik" /></label></div>
    {error ? <p className="reader-music-error" role="alert"><AlertCircle size={15} />{error}</p> : null}
  </section>;
}
