// ai.js — Rook, Sang Penjaga Batu. A readable opponent: it counters the suit
// you play most, saves its big cards while ahead, and goes all-in when behind.
import { SUITS, effectivePower } from './cards.js';

export const AI_NAME = 'Rook';
export const AI_TITLE = 'Sang Penjaga Batu';

function counterSuit(suitKey) {
  for (const k of Object.keys(SUITS)) {
    if (SUITS[k].beats === suitKey) return k;
  }
  return null;
}

function mostPlayedSuit(history) {
  if (!history.length) return null;
  const count = {};
  for (const s of history) count[s] = (count[s] || 0) + 1;
  let best = null; let bestN = 0;
  for (const k of Object.keys(count)) {
    if (count[k] > bestN) { best = k; bestN = count[k]; }
  }
  return best;
}

// Pick one card from hand. Returns { card, reason } — the reason is shown to
// the player after the reveal, so Rook's choices can be read and countered.
export function chooseCard(hand, mana, self, foe, history, rand) {
  const affordable = hand.filter((c) => c.cost <= mana);
  const pool = affordable.length ? affordable : hand.slice();
  const fav = mostPlayedSuit(history);
  const counter = fav ? counterSuit(fav) : null;

  // Behind on life: play the biggest gun available.
  if (self.life <= 8) {
    const big = pool.slice().sort((a, b) => b.power - a.power)[0];
    return { card: big, reason: 'Rook terdesak — ia memainkan kartu terbesarnya.' };
  }

  // Ahead on life: save the big cards, play small and safe.
  if (self.life - foe.life >= 6) {
    const small = pool.slice().sort((a, b) => a.power - b.power)[0];
    return { card: small, reason: 'Rook unggul — ia menyimpan kartu besarnya.' };
  }

  // Readable counter: if the player keeps playing one suit, answer with its counter.
  if (counter) {
    const counters = pool.filter((c) => c.suit === counter);
    if (counters.length && rand() < 0.7) {
      const pick = counters.slice().sort((a, b) => b.power - a.power)[0];
      return { card: pick, reason: 'Rook membaca suit favoritmu dan memainkan counter ' + SUITS[counter].name + '.' };
    }
  }

  // Otherwise play the strongest effective card it can afford, with a little noise.
  const scored = pool.map((c) => ({ c, s: effectivePower(c, fav || 'ember') + rand() * 2 }));
  scored.sort((a, b) => b.s - a.s);
  return { card: scored[0].c, reason: 'Rook memainkan kartu terkuat yang ia mampu.' };
}
