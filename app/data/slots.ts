export type SlotRelease = {
  id: string;
  name: string;
  provider: string;
  rtp: number | null;
  volatility: string | null;
  maxWin: number | null;
  releaseDate: string | null;
};

// Sélection de secours relevée sur la page « Nouveaux jeux » de Celsius.
export const fallbackSlots: SlotRelease[] = [
  { id: 'le-prechaun', name: 'Le Prechaun', provider: 'Hacksaw Gaming', rtp: null, volatility: null, maxWin: null, releaseDate: null },
  { id: 'reactoonz-100', name: 'Reactoonz 100', provider: "Play'n GO", rtp: null, volatility: null, maxWin: null, releaseDate: null },
  { id: 'crownlings-clusters', name: 'Crownlings Clusters', provider: 'Hacksaw Gaming', rtp: null, volatility: null, maxWin: null, releaseDate: null },
  { id: 'starlight-princess-super-scatter', name: 'Starlight Princess Super Scatter', provider: 'Pragmatic Play', rtp: null, volatility: null, maxWin: null, releaseDate: null },
  { id: 'le-celsius', name: 'Le Celsius', provider: 'Hacksaw Gaming', rtp: null, volatility: null, maxWin: null, releaseDate: null },
  { id: 'big-bass-bonanza-1000', name: 'Big Bass Bonanza 1000', provider: 'Pragmatic Play', rtp: null, volatility: null, maxWin: null, releaseDate: null },
  { id: 'gates-of-olympus-super-scatter', name: 'Gates of Olympus Super Scatter', provider: 'Pragmatic Play', rtp: null, volatility: null, maxWin: null, releaseDate: null },
  { id: 'mental-2', name: 'Mental 2', provider: 'Nolimit City', rtp: null, volatility: null, maxWin: null, releaseDate: null },
  { id: 'hounds-of-hell', name: 'Hounds of Hell', provider: 'Hacksaw Gaming', rtp: null, volatility: null, maxWin: null, releaseDate: null },
];
