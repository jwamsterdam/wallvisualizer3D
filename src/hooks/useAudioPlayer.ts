import { useCallback, useEffect, useRef, useState } from 'react';
import type { AudioSample } from '../data/audioSamples';
import { comparableGain } from '../lib/audio/player';

export function useAudioPlayer(sample: AudioSample) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.78);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef(volume);

  const stop = useCallback(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setIsPlaying(false);
    setPosition(0);
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = comparableGain(volumeRef.current);
    await audio.play();
    setIsPlaying(true);
  }, []);

  const restart = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.currentTime = 0;
    await play();
  }, [play]);

  const setVolume = useCallback((nextVolume: number) => {
    const safeVolume = comparableGain(nextVolume);
    volumeRef.current = safeVolume;
    setVolumeState(safeVolume);

    if (audioRef.current) {
      audioRef.current.volume = safeVolume;
    }
  }, []);

  useEffect(() => {
    const audio = new Audio(sample.src);
    audio.loop = true;
    audio.preload = 'metadata';
    audio.volume = comparableGain(volumeRef.current);
    audioRef.current = audio;
    setPosition(0);
    setDuration(0);
    setIsPlaying(false);

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const handleTimeUpdate = () => {
      setPosition(audio.currentTime);
    };
    const handlePlay = () => {
      setIsPlaying(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [sample.src]);

  return {
    isPlaying,
    position,
    duration,
    volume,
    play,
    stop,
    restart,
    setVolume,
  };
}
