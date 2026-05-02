import { memo } from 'react';
import type { PlaybackMappingResult } from '../../lib/sound/playbackMapping';
import type { FrequencyBandResult } from '../../lib/sound/types';
import type { SoundWaveSettings } from '../../types';

type SoundEqDisplayProps = {
  existingBands: FrequencyBandResult[];
  nextBands: FrequencyBandResult[];
  playbackMapping: PlaybackMappingResult;
  colors: Pick<SoundWaveSettings, 'oldColor' | 'newColor'>;
};

function formatFrequency(frequencyHz: number) {
  if (frequencyHz >= 1000) {
    return `${frequencyHz / 1000} kHz`;
  }

  return `${frequencyHz} Hz`;
}

function SoundEqDisplayComponent({
  existingBands,
  nextBands,
  playbackMapping,
  colors,
}: SoundEqDisplayProps) {
  const comparedBands = existingBands.map((existingBand, index) => {
    const nextBand = nextBands[index] ?? existingBand;
    const extraAttenuationDb = nextBand.attenuationDb - existingBand.attenuationDb;

    return {
      frequencyHz: existingBand.frequencyHz,
      existingAttenuationDb: existingBand.attenuationDb,
      nextAttenuationDb: nextBand.attenuationDb,
      extraAttenuationDb,
    };
  });
  const maxDb = Math.max(
    60,
    ...comparedBands.map((band) =>
      Math.max(band.existingAttenuationDb, band.nextAttenuationDb),
    ),
  );

  return (
    <section className="listen-section sound-eq-panel" aria-labelledby="sound-eq-title">
      <h3 id="sound-eq-title">Visual EQ</h3>
      <div className="sound-eq-legend" aria-label="Legenda transmissieverlies vergelijking">
        <span>
          <i
            className="sound-eq-swatch"
            style={{ backgroundColor: colors.oldColor }}
            aria-hidden="true"
          />
          Huidige muur
        </span>
        <span>
          <i
            className="sound-eq-swatch"
            style={{ backgroundColor: colors.newColor }}
            aria-hidden="true"
          />
          Nieuwe muur
        </span>
      </div>
      <div className="sound-eq-scroll">
        <div className="sound-eq-chart" role="img" aria-label="Transmissieverlies per frequentie">
          {comparedBands.map((band) => {
            const existingHeight = `${(Math.max(4, band.existingAttenuationDb) / maxDb) * 100}%`;
            const nextHeight = `${(Math.max(4, band.nextAttenuationDb) / maxDb) * 100}%`;
            const isImproved = band.extraAttenuationDb >= 0;

            return (
              <div className="sound-eq-band" key={band.frequencyHz}>
                <div className="sound-eq-value">
                  <strong>-{band.existingAttenuationDb.toFixed(1)}</strong>
                  <span className={isImproved ? 'positive' : 'negative'}>
                    {isImproved ? '+' : ''}
                    {band.extraAttenuationDb.toFixed(1)}
                  </span>
                </div>
                  <div className="sound-eq-track">
                  <div
                    className="sound-eq-fill sound-eq-fill--new"
                    style={{ backgroundColor: colors.newColor, height: nextHeight }}
                  />
                  <div
                    className="sound-eq-fill sound-eq-fill--existing"
                    style={{ backgroundColor: colors.oldColor, height: existingHeight }}
                  />
                </div>
                <div className="sound-eq-label">{formatFrequency(band.frequencyHz)}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="sound-playback-summary">
        <span>Raw breedband: {playbackMapping.rawBroadbandLossDb.toFixed(1)} dB</span>
        <span>Playback: -{playbackMapping.playbackBroadbandLossDb.toFixed(1)} dB</span>
        <span>Gain: {playbackMapping.outputGainLinear.toFixed(3)}</span>
      </div>
    </section>
  );
}

export const SoundEqDisplay = memo(SoundEqDisplayComponent);
