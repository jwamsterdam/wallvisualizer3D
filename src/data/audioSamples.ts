export type AudioSample = {
  id: string;
  title: string;
  description: string;
  category: 'Audio' | 'Muziek';
  src: string;
};

export const audioSamples: AudioSample[] = [
  {
    id: 'people-talking',
    title: 'Gesprekken op achtergrond',
    description: 'Stemmen en ruimtegeluid.',
    category: 'Audio',
    src: '/audiosamples/Audio%20-%20People%20Talking%20on%20Background.mp3',
  },
  {
    id: 'television',
    title: 'Televisie',
    description: 'Spraak, muziek en programma-audio.',
    category: 'Audio',
    src: '/audiosamples/Audio%20-%20Television.mp3',
  },
  {
    id: 'washing-dishes',
    title: 'Afwassen',
    description: 'Korte tikken, water en servies.',
    category: 'Audio',
    src: '/audiosamples/Audio%20-%20Washing%20dishes.mp3',
  },
  {
    id: 'organic-flow',
    title: 'Organic flow',
    description: 'Muziek met breed frequentiebeeld.',
    category: 'Muziek',
    src: '/audiosamples/Music%20-%20Aberrantrealities%20organic%20flow.mp3',
  },
  {
    id: 'hip-hop',
    title: 'Hip hop',
    description: 'Beat met laag en transiënten.',
    category: 'Muziek',
    src: '/audiosamples/Music%20-%20Hip%20hop.mp3',
  },
];
