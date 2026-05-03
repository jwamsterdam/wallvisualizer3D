import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AudioSample } from '../data/audioSamples';
import { comparableGain } from '../lib/audio/player';
import { AudioSimulationEngine } from '../lib/sound/audioEngine';
import type { PlaybackMappingResult } from '../lib/sound/playbackMapping';
import type { ListenMode } from '../types';

type UseAudioPlayerOptions = {
  existingMapping?: PlaybackMappingResult;
  nextMapping?: PlaybackMappingResult;
  mode?: ListenMode;
  autoPlayRequestId?: number;
};

export function useAudioPlayer(sample: AudioSample, options: UseAudioPlayerOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.78);
  const mode = options.mode ?? 'source';
  const engine = useMemo(() => new AudioSimulationEngine(), []);
  const progressTimerRef = useRef<number | null>(null);

  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const refreshProgress = useCallback(() => {
    setIsPlaying(engine.getIsPlaying());
    setPosition(engine.getCurrentTime());
  }, [engine]);

  const startProgressTimer = useCallback(() => {
    clearProgressTimer();
    progressTimerRef.current = window.setInterval(refreshProgress, 120);
  }, [clearProgressTimer, refreshProgress]);

  const stop = useCallback(() => {
    engine.stop();
    clearProgressTimer();
    setIsPlaying(false);
    setPosition(0);
  }, [clearProgressTimer, engine]);

  const play = useCallback(async () => {
    await engine.play();
    refreshProgress();
    startProgressTimer();
  }, [engine, refreshProgress, startProgressTimer]);

  const restart = useCallback(async () => {
    engine.stop();
    setPosition(0);
    await play();
  }, [engine, play]);

  const setVolume = useCallback(
    (nextVolume: number) => {
      const safeVolume = comparableGain(nextVolume);
      setVolumeState(safeVolume);
      engine.setVolume(safeVolume);
    },
    [engine],
  );

  useEffect(() => {
    engine.setPlaybackMappings(options.existingMapping, options.nextMapping);
  }, [engine, options.existingMapping, options.nextMapping]);

  useEffect(() => {
    engine.setMode(mode);
  }, [engine, mode]);

  useEffect(() => {
    let isCancelled = false;
    stop();
    setDuration(0);

    void engine.loadUrl(sample.src).then((sampleDuration) => {
      if (!isCancelled) {
        setDuration(sampleDuration);

        if (options.autoPlayRequestId && options.autoPlayRequestId > 0) {
          void engine.play().then(() => {
            if (!isCancelled) {
              refreshProgress();
              startProgressTimer();
            }
          });
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [
    engine,
    options.autoPlayRequestId,
    refreshProgress,
    sample.src,
    startProgressTimer,
    stop,
  ]);

  useEffect(
    () => () => {
      clearProgressTimer();
      void engine.dispose();
    },
    [clearProgressTimer, engine],
  );

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
