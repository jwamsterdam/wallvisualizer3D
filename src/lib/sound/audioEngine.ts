import { designFirFilter, type FirDesignResult } from './fir';
import type { PlaybackMappingResult } from './playbackMapping';
import type { ListenMode } from './types';

interface PlaybackNodes {
  source: AudioBufferSourceNode;
  gain: GainNode;
  convolver?: ConvolverNode;
}

const MAX_DECODED_URL_CACHE_ENTRIES = 4;
const MAX_IMPULSE_BUFFER_CACHE_ENTRIES = 16;
const REBUILD_DEBOUNCE_MS = 180;
const DEFAULT_IMPULSE_LENGTH = 129;

export class AudioSimulationEngine {
  private context?: AudioContext;
  private buffer?: AudioBuffer;
  private decodedUrlCache = new Map<string, AudioBuffer>();
  private impulseBufferCache = new Map<string, AudioBuffer>();
  private nodes?: PlaybackNodes;
  private mode: ListenMode = 'source';
  private existingMapping?: PlaybackMappingResult;
  private nextMapping?: PlaybackMappingResult;
  private existingFirDesign?: FirDesignResult;
  private nextFirDesign?: FirDesignResult;
  private startedAt = 0;
  private pausedAt = 0;
  private playing = false;
  private rebuildTimer?: number;
  private volume = 0.78;

  async loadUrl(url: string): Promise<number> {
    const context = this.getContext();
    const cachedBuffer = this.decodedUrlCache.get(url);
    if (cachedBuffer) {
      this.decodedUrlCache.delete(url);
      this.decodedUrlCache.set(url, cachedBuffer);
      this.buffer = cachedBuffer;
      this.stop();
      return cachedBuffer.duration;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Audio sample kon niet worden geladen: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    this.buffer = await context.decodeAudioData(arrayBuffer.slice(0));
    setLruCacheValue(this.decodedUrlCache, url, this.buffer, MAX_DECODED_URL_CACHE_ENTRIES);
    this.stop();
    return this.buffer.duration;
  }

  setVolume(volume: number): void {
    this.volume = Math.min(Math.max(volume, 0), 1);

    if (!this.nodes || !this.context) {
      return;
    }

    const now = this.context.currentTime;
    this.nodes.gain.gain.setTargetAtTime(this.volume, now, 0.015);
  }

  setPlaybackMappings(existingMapping?: PlaybackMappingResult, nextMapping?: PlaybackMappingResult): void {
    const previousExistingFirKey = this.existingFirDesign?.cacheKey;
    const previousNextFirKey = this.nextFirDesign?.cacheKey;
    this.existingMapping = existingMapping;
    this.nextMapping = nextMapping;

    if (!this.context) {
      return;
    }

    this.refreshFirDesigns();

    if (
      this.nodes &&
      (previousExistingFirKey !== this.existingFirDesign?.cacheKey ||
        previousNextFirKey !== this.nextFirDesign?.cacheKey)
    ) {
      this.scheduleGraphRebuild();
    }
  }

  setMode(mode: ListenMode): void {
    if (this.mode === mode) {
      return;
    }

    this.mode = mode;

    if (this.nodes && this.playing) {
      this.rebuildGraphAtCurrentTime();
    }
  }

  async play(): Promise<void> {
    if (!this.buffer || this.playing) {
      return;
    }

    const context = this.getContext();
    if (context.state === 'suspended') {
      await context.resume();
    }

    const offset = this.pausedAt % this.buffer.duration;
    this.nodes = this.createPlaybackGraph();
    this.startedAt = context.currentTime - offset;
    this.playing = true;
    this.nodes.source.start(0, offset);
    this.nodes.source.onended = () => {
      if (this.playing && this.getCurrentTime() >= (this.buffer?.duration ?? 0) - 0.05) {
        this.stop();
      }
    };
  }

  stop(): void {
    this.stopSources();
    this.pausedAt = 0;
    this.playing = false;
  }

  getIsPlaying(): boolean {
    return this.playing;
  }

  getCurrentTime(): number {
    if (!this.playing || !this.context) {
      return this.pausedAt;
    }
    return this.context.currentTime - this.startedAt;
  }

  async dispose(): Promise<void> {
    this.stop();
    this.buffer = undefined;
    this.decodedUrlCache.clear();
    this.existingMapping = undefined;
    this.nextMapping = undefined;
    this.existingFirDesign = undefined;
    this.nextFirDesign = undefined;
    this.impulseBufferCache.clear();

    const context = this.context;
    this.context = undefined;
    if (context && context.state !== 'closed') {
      await context.close();
    }
  }

  private getContext(): AudioContext {
    if (!this.context || this.context.state === 'closed') {
      const AudioContextConstructor =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextConstructor) {
        throw new Error('Web Audio wordt niet ondersteund in deze browser.');
      }

      this.context = new AudioContextConstructor({ latencyHint: 'interactive' });
      this.refreshFirDesigns();
    }

    return this.context;
  }

  private refreshFirDesigns(): void {
    if (!this.context) {
      return;
    }

    const context = this.context;
    this.existingFirDesign = this.existingMapping
      ? designFirFilter(this.existingMapping, context.sampleRate, DEFAULT_IMPULSE_LENGTH)
      : undefined;
    this.nextFirDesign = this.nextMapping
      ? designFirFilter(this.nextMapping, context.sampleRate, DEFAULT_IMPULSE_LENGTH)
      : undefined;
  }

  private createPlaybackGraph(): PlaybackNodes {
    const context = this.getContext();
    if (!this.buffer) {
      throw new Error('No audio buffer loaded');
    }

    const source = context.createBufferSource();
    source.buffer = this.buffer;

    const gain = context.createGain();
    gain.gain.value = this.volume;

    const firDesign = this.getActiveFirDesign(context);
    let convolver: ConvolverNode | undefined;

    if (firDesign) {
      convolver = context.createConvolver();
      convolver.normalize = false;
      convolver.buffer = this.getImpulseBuffer(context, firDesign);
      source.connect(convolver).connect(gain).connect(context.destination);
    } else {
      source.connect(gain).connect(context.destination);
    }

    return {
      source,
      gain,
      convolver,
    };
  }

  private getActiveFirDesign(context: AudioContext): FirDesignResult | undefined {
    if (this.mode === 'existing') {
      this.existingFirDesign =
        this.existingFirDesign ??
        (this.existingMapping
          ? designFirFilter(this.existingMapping, context.sampleRate, DEFAULT_IMPULSE_LENGTH)
          : undefined);
      return this.existingFirDesign;
    }

    if (this.mode === 'new') {
      this.nextFirDesign =
        this.nextFirDesign ??
        (this.nextMapping
          ? designFirFilter(this.nextMapping, context.sampleRate, DEFAULT_IMPULSE_LENGTH)
          : undefined);
      return this.nextFirDesign;
    }

    return undefined;
  }

  private stopSources(): void {
    this.clearScheduledGraphRebuild();
    if (!this.nodes) {
      return;
    }

    const nodes = this.nodes;
    nodes.source.onended = null;
    try {
      nodes.source.stop();
    } catch {
      // Sources may already have ended.
    }
    disconnectPlaybackNodes(nodes);
    this.nodes = undefined;
  }

  private rebuildGraphAtCurrentTime(): void {
    if (!this.buffer) {
      return;
    }

    const wasPlaying = this.playing;
    const currentTime = this.getCurrentTime();
    this.stopSources();
    this.pausedAt = currentTime % this.buffer.duration;
    this.playing = false;
    if (wasPlaying) {
      void this.play();
    }
  }

  private scheduleGraphRebuild(): void {
    this.clearScheduledGraphRebuild();
    this.rebuildTimer = window.setTimeout(() => {
      this.rebuildTimer = undefined;
      this.rebuildGraphAtCurrentTime();
    }, REBUILD_DEBOUNCE_MS);
  }

  private clearScheduledGraphRebuild(): void {
    if (this.rebuildTimer === undefined) {
      return;
    }
    window.clearTimeout(this.rebuildTimer);
    this.rebuildTimer = undefined;
  }

  private getImpulseBuffer(context: AudioContext, firDesign: FirDesignResult): AudioBuffer {
    const cacheKey = `${context.sampleRate}:${firDesign.cacheKey}`;
    const cachedBuffer = this.impulseBufferCache.get(cacheKey);
    if (cachedBuffer) {
      this.impulseBufferCache.delete(cacheKey);
      this.impulseBufferCache.set(cacheKey, cachedBuffer);
      return cachedBuffer;
    }

    const buffer = context.createBuffer(1, firDesign.impulse.length, context.sampleRate);
    buffer.getChannelData(0).set(new Float32Array(firDesign.impulse));
    setLruCacheValue(this.impulseBufferCache, cacheKey, buffer, MAX_IMPULSE_BUFFER_CACHE_ENTRIES);
    return buffer;
  }
}

function disconnectPlaybackNodes(nodes: PlaybackNodes): void {
  safeDisconnect(nodes.source);
  safeDisconnect(nodes.gain);
  if (nodes.convolver) {
    nodes.convolver.buffer = null;
    safeDisconnect(nodes.convolver);
  }
}

function safeDisconnect(node?: AudioNode): void {
  if (!node) {
    return;
  }
  try {
    node.disconnect();
  } catch {
    // Some browsers throw when a node has already been disconnected.
  }
}

function setLruCacheValue<K, V>(cache: Map<K, V>, key: K, value: V, maxEntries: number): void {
  if (cache.has(key)) {
    cache.delete(key);
  }
  cache.set(key, value);
  while (cache.size > maxEntries) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey === undefined) {
      return;
    }
    cache.delete(oldestKey);
  }
}
