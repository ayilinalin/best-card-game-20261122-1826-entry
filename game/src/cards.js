// cards.js — the deck of EMBER DUEL: suits, powers, costs, effects.
export const SUITS = {
  ember: { key: 'ember', name: 'Ember', label: 'API', color: '#ff5a2a', beats: 'thorn', glyph: 'flame' },
  tide: { key: 'tide', name: 'Tide', label: 'AIR', color: '#2aa8ff', beats: 'stone', glyph: 'droplet' },
  thorn: { key: 'thorn', name: 'Thorn', label: 'DAUN', color: '#3ecf5a', beats: 'tide', glyph: 'leaf' },
  stone: { key: 'stone', name: 'Stone', label: 'BATU', color: '#9a8f80', beats: 'ember', glyph: 'diamond' },
};

export const SUIT_CYCLE = 'Ember > Thorn > Tide > Stone > Ember';
export const SUIT_BONUS = 3;
export const MAX_LIFE = 20;

// Power tiers: name per power so every card reads as its own card.
const TIER_NAMES = {
  2: 'Spark', 3: 'Flicker', 4: 'Surge', 5: 'Guard', 6: 'Crash', 7: 'Harvest', 9: 'Nova',
};

// One suit's seven cards: power -> [cost, effect]. Effect on the card that plays it.
const SUIT_LADDER = [
  [2, 0, null],
  [3, 0, null],
  [4, 1, null],
  [5, 1, 'shield'],
  [6, 2, null],
  [7, 2, 'draw'],
  [9, 3, 'double'],
];

export const EFFECT_TEXT = {
  shield: 'SHIELD: tahan damage ronde ini',
  draw: 'DRAW: ambil 1 kartu',
  double: 'DOUBLE: power x2',
};

let nextId = 1;

export function makeCard(suitKey, power, cost, effect) {
  const suit = SUITS[suitKey];
  return {
    id: nextId++,
    suit: suitKey,
    suitName: suit.name,
    power,
    cost,
    effect,
    name: suit.name + ' ' + (TIER_NAMES[power] || power),
  };
}

export function buildDeck() {
  const deck = [];
  for (const suitKey of Object.keys(SUITS)) {
    for (const [power, cost, effect] of SUIT_LADDER) {
      deck.push(makeCard(suitKey, power, cost, effect));
    }
  }
  return deck;
}

export function shuffle(deck, rand) {
  const d = deck.slice();
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = d[i]; d[i] = d[j]; d[j] = t;
  }
  return d;
}

export function suitBeats(a, b) {
  return SUITS[a].beats === b;
}

export function suitBonus(a, b) {
  if (suitBeats(a, b)) return SUIT_BONUS;
  return 0;
}

// Effective power of a card against the opposing card's suit.
export function effectivePower(card, foeSuit) {
  let p = card.power;
  if (card.effect === 'double') p *= 2;
  p += suitBonus(card.suit, foeSuit);
  return p;
}

export function describeCard(card) {
  const fx = card.effect ? ' · ' + card.effect.toUpperCase() : '';
  return card.name + ' P' + card.power + ' C' + card.cost + fx;
}
