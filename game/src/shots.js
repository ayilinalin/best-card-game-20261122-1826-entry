// shots.js — deterministic staging states for reproducible screenshots.
// ?shot=title | table | win | loss. Each builds a fixed, readable state
// from the game's own renderers; no mock images, everything is live DOM.
import { makeCard } from './cards.js';
import { renderHand, renderPlayed } from './render.js';
import { updateHud, showEnd, hideTitle, setBanner, logLine } from './hud.js';

function fixedHand(suits) {
  return suits.map(([s, p, c, fx], i) => {
    const card = makeCard(s, p, c, fx || null);
    card.id = 1000 + i;
    return card;
  });
}

export function stageShot(mode, game) {
  const state = game.state;
  hideTitle();
  if (mode === 'title') {
    document.getElementById('title-screen').classList.remove('hidden');
    return;
  }
  if (mode === 'table') {
    state.phase = 'pick';
    state.round = 4;
    state.score = 340;
    state.roundsWon = 2;
    state.roundsLost = 1;
    state.you.life = 14;
    state.foe.life = 17;
    state.mana = 5;
    state.you.hand = fixedHand([
      ['ember', 9, 3, 'double'], ['tide', 5, 1, 'shield'], ['thorn', 7, 2, 'draw'],
      ['stone', 4, 1, null], ['ember', 3, 0, null],
    ]);
    state.foe.hand = fixedHand([
      ['stone', 2, 0, null], ['stone', 3, 0, null], ['stone', 4, 1, null],
      ['stone', 5, 1, 'shield'], ['stone', 6, 2, null],
    ]);
    state.deck = fixedHand([['tide', 2, 0, null], ['thorn', 3, 0, null]]);
    state.discard = fixedHand([['ember', 2, 0, null], ['tide', 4, 1, null], ['thorn', 6, 2, null]]);
    state.selectedId = state.you.hand[0].id;
    renderHand(document.getElementById('you-hand'), state.you.hand,
      { showKeys: true, mana: state.mana, selectedId: state.selectedId, onPick: (c) => game.pickCard(c) });
    renderHand(document.getElementById('foe-hand'), state.foe.hand, { back: true });
    renderPlayed(document.getElementById('slot-you'), state.you.hand[2], false);
    renderPlayed(document.getElementById('slot-foe'), state.foe.hand[1], false);
    setBanner('Ronde 3: <b>Ember Nova 9</b> mengalahkan Thorn 6 — <span class="dmg">-6 life Rook</span>');
    logLine('<b>R3</b> Kamu: Ember Nova 9 vs Rook: Thorn 6 — kamu menang, -6');
    logLine('<b>R2</b> Kamu: Tide 5 vs Rook: Stone 7 — Rook menang, -2');
    logLine('<b>R1</b> Kamu: Stone 4 vs Rook: Ember 3 — kamu menang, -4');
    updateHud(state);
    return;
  }
  if (mode === 'win' || mode === 'loss') {
    const won = mode === 'win';
    state.phase = 'over';
    state.round = won ? 7 : 6;
    state.score = won ? 1250 : 410;
    state.roundsWon = won ? 4 : 2;
    state.roundsLost = won ? 2 : 4;
    state.you.life = won ? 9 : 0;
    state.foe.life = won ? 0 : 11;
    state.mana = 6;
    state.you.hand = fixedHand([
      ['ember', 9, 3, 'double'], ['tide', 5, 1, 'shield'], ['thorn', 7, 2, 'draw'],
      ['stone', 4, 1, null], ['ember', 3, 0, null],
    ]);
    state.foe.hand = fixedHand([
      ['stone', 2, 0, null], ['stone', 3, 0, null], ['stone', 4, 1, null],
      ['stone', 5, 1, 'shield'], ['stone', 6, 2, null],
    ]);
    state.deck = [];
    state.discard = fixedHand([['ember', 2, 0, null], ['tide', 4, 1, null]]);
    renderHand(document.getElementById('you-hand'), state.you.hand, { showKeys: true, mana: state.mana });
    renderHand(document.getElementById('foe-hand'), state.foe.hand, { back: true });
    updateHud(state);
    showEnd(won, state);
  }
}
