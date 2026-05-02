import { describe, expect, it } from 'vitest';
import { audioSamples } from '../../data/audioSamples';
import { comparableGain, formatAudioTime } from './player';

describe('audio player helpers', () => {
  it('defines file-backed public audio samples', () => {
    expect(audioSamples.length).toBeGreaterThan(0);

    for (const sample of audioSamples) {
      expect(sample.src).toMatch(/^\/audiosamples\/.+\.mp3$/);
      expect(sample.title).not.toHaveLength(0);
      expect(sample.description).not.toHaveLength(0);
    }
  });

  it('formats time and clamps comparable gain', () => {
    expect(formatAudioTime(64.8)).toBe('1:04');
    expect(comparableGain(-1)).toBe(0);
    expect(comparableGain(0.42)).toBe(0.42);
    expect(comparableGain(2)).toBe(1);
  });
});
