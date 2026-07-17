"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type QuoteMusicPlayerProps = {
  src: string;
  targetId: string;
};

export default function QuoteMusicPlayer({ src, targetId }: QuoteMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  async function playAudio() {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = 0.42;

    try {
      await audio.play();
      setIsPlaying(true);
      setAutoplayBlocked(false);
    } catch {
      setIsPlaying(false);
      setAutoplayBlocked(true);
    }
  }

  function pauseAudio() {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.pause();
    setIsPlaying(false);
  }

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.45 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  useEffect(() => {
    if (isVisible) {
      void playAudio();
      return;
    }

    pauseAudio();
  }, [isVisible]);

  useEffect(() => {
    function unlockAudio() {
      if (isVisible && autoplayBlocked) {
        void playAudio();
      }
    }

    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, [autoplayBlocked, isVisible]);

  const toggleAudio = () => {
    if (isPlaying) {
      pauseAudio();
      return;
    }

    void playAudio();
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button
        type="button"
        className={`reader-quote-audio ${isVisible ? "is-visible" : ""} ${isPlaying ? "is-playing" : ""}`}
        onClick={toggleAudio}
        aria-label={isPlaying ? "Pause quote music" : "Play quote music"}
        title={isPlaying ? "Pause quote music" : "Play quote music"}
      >
        {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
    </>
  );
}
