// main.js — EMBER DUEL game state machine: deal, pick, resolve, win/lose.
// Original card duel: one card each per round, element cycle decides the bonus,
// damage is the power difference, life 20, first to zero loses.
import { buildDeck, shuffle, effectivePower, suitBeats, describeCard, MAX_LIFE } from './cards.js';
import { chooseCard, AI_NAME } from './ai.js';
import * as audio from './audio.js';
import { renderHand, renderPlayed, clearSlots, shakeElement } from './render.js';
import { updateHud, logLine, setBanner, clearBanner, setAiHint, showEnd, hideEnd, showTitle, hideTitle } from './hud.js';
import { bindInput } from './input.js';
import { stageShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const HAND_SIZE = 5;

export const state = {
  phase: 'title',
  round: 1,
  score: 0,
  mana: 3,
  you: { life: MAX_LIFE, hand: [] },
  foe: { life: MAX_LIFE, hand: [] },
  deck: [],
  discard: [],
  selectedId: null,
  roundsWon: 0,
  roundsLost: 0,
  muted: false,
  history: [],
  aiChoice: null,
};

function manaForRound(round) {
  return Math.min(2 + round, 8);
}

function drawCards(hand, n) {
  for (let i = 0; i < n; i++) {
    if (!state.deck.length) {
      if (!state.discard.length) return;
      state.deck = shuffle(state.discard, Math.random);
      state.discard = [];
      logLine('Deck habis — discard dikocok jadi deck baru.');
    }
    hand.push(state.deck.pop());
  }
}

function renderAll() {
  renderHand($('you-hand'), state.you.hand, {
    showKeys: true, mana: state.mana, selectedId: state.selectedId,
    onPick: (c) => pickCard(c),
  });
  renderHand($('foe-hand'), state.foe.hand, { back: true });
  updateHud(state);
}

export function startGame() {
  state.phase = 'pick';
  state.round = 1;
  state.score = 0;
  state.mana = manaForRound(1);
  state.you.life = MAX_LIFE;
  state.foe.life = MAX_LIFE;
  state.discard = [];
  state.selectedId = null;
  state.roundsWon = 0;
  state.roundsLost = 0;
  state.history = [];
  state.aiChoice = null;
  state.deck = shuffle(buildDeck(), Math.random);
  state.you.hand = [];
  state.foe.hand = [];
  drawCards(state.you.hand, HAND_SIZE);
  drawCards(state.foe.hand, HAND_SIZE);
  $('round-log').innerHTML = '';
  clearBanner();
  hideTitle();
  hideEnd();
  clearSlots($('slot-you'), $('slot-foe'));
  setAiHint(AI_NAME + ' membaca suit yang sering kau mainkan. Counter dia, jangan ditebak dia.');
  logLine('Duel dimulai! Life 20 vs 20. Mana ronde 1: ' + state.mana + '.');
  audio.playDeal();
  renderAll();
}

export function pickCard(card) {
  if (state.phase !== 'pick') return;
  if (card.cost > state.mana) {
    setBanner('Mana tidak cukup untuk <b>' + card.name + '</b> (cost ' + card.cost + ').');
    return;
  }
  state.selectedId = card.id;
  audio.playClick();
  renderAll();
}

function removeFromHand(hand, id) {
  const i = hand.findIndex((c) => c.id === id);
  if (i < 0) return null;
  return hand.splice(i, 1)[0];
}

export function playRound() {
  if (state.phase !== 'pick' || state.selectedId == null) return;
  const youCard = removeFromHand(state.you.hand, state.selectedId);
  if (!youCard) return;
  state.selectedId = null;
  const ai = chooseCard(state.foe.hand, manaForRound(state.round), state.foe, state.you, state.history, Math.random);
  const foeCard = removeFromHand(state.foe.hand, ai.card.id);
  state.aiChoice = ai;
  state.phase = 'resolve';
  state.mana -= youCard.cost;
  renderPlayed($('slot-you'), youCard, true);
  renderPlayed($('slot-foe'), foeCard, true);
  renderAll();
  audio.playCard();
  setBanner('Kartu dibuka…');
  window.setTimeout(() => resolveRound(youCard, foeCard), 750);
}

function resolveRound(youCard, foeCard) {
  const youPow = effectivePower(youCard, foeCard.suit);
  const foePow = effectivePower(foeCard, youCard.suit);
  state.history.push(youCard.suit);
  state.discard.push(youCard, foeCard);

  let text;
  if (youPow > foePow) {
    let dmg = Math.max(1, youPow - foePow);
    if (foeCard.effect === 'shield') {
      dmg = 0;
      text = '<b>R' + state.round + '</b> ' + describeCard(youCard) + ' vs ' + describeCard(foeCard) +
        ' — kamu menang, tapi <b>SHIELD Rook</b> menahan damage!';
      audio.playShield();
    } else {
      state.foe.life = Math.max(0, state.foe.life - dmg);
      state.score += 100 + dmg * 10;
      state.roundsWon++;
      text = '<b>R' + state.round + '</b> ' + describeCard(youCard) + ' vs ' + describeCard(foeCard) +
        ' — kamu menang, <span class="dmg">-' + dmg + ' life Rook</span>';
      audio.playHit();
      shakeElement($('life-foe-wrap'));
    }
  } else if (foePow > youPow) {
    let dmg = Math.max(1, foePow - youPow);
    if (youCard.effect === 'shield') {
      dmg = 0;
      text = '<b>R' + state.round + '</b> ' + describeCard(youCard) + ' vs ' + describeCard(foeCard) +
        ' — Rook menang, tapi <b>SHIELD-mu</b> menahan damage!';
      audio.playShield();
    } else {
      state.you.life = Math.max(0, state.you.life - dmg);
      state.roundsLost++;
      text = '<b>R' + state.round + '</b> ' + describeCard(youCard) + ' vs ' + describeCard(foeCard) +
        ' — Rook menang, <span class="dmg">-' + dmg + ' life kamu</span>';
      audio.playHit();
      shakeElement($('life-you-wrap'));
    }
  } else {
    text = '<b>R' + state.round + '</b> ' + describeCard(youCard) + ' vs ' + describeCard(foeCard) + ' — SERI, tanpa damage.';
    audio.playClick();
  }

  // Draw effects fire after the clash.
  for (const [card, who] of [[youCard, 'you'], [foeCard, 'foe']]) {
    if (card.effect === 'draw') {
      const hand = who === 'you' ? state.you.hand : state.foe.hand;
      const before = hand.length;
      drawCards(hand, 1);
      if (hand.length > before) text += ' ' + (who === 'you' ? 'Kamu' : 'Rook') + ' ambil 1 kartu (DRAW).';
    }
  }
  if (suitBeats(youCard.suit, foeCard.suit)) text += ' Bonus elemen +3 untukmu.';
  if (suitBeats(foeCard.suit, youCard.suit)) text += ' Bonus elemen +3 untuk Rook.';

  logLine(text);
  setBanner(text.replace(/<[^>]+>/g, ''));
  setAiHint(state.aiChoice ? state.aiChoice.reason : '');
  updateHud(state);

  if (state.foe.life <= 0 || state.you.life <= 0) {
    endGame(state.foe.life <= 0);
    return;
  }
  window.setTimeout(nextRound, 1400);
}

function nextRound() {
  state.round++;
  state.mana = manaForRound(state.round);
  state.phase = 'pick';
  drawCards(state.you.hand, HAND_SIZE - state.you.hand.length);
  drawCards(state.foe.hand, HAND_SIZE - state.foe.hand.length);
  clearSlots($('slot-you'), $('slot-foe'));
  clearBanner();
  audio.playDeal();
  renderAll();
}

function endGame(won) {
  state.phase = 'over';
  state.score += won ? state.you.life * 25 : 0;
  updateHud(state);
  if (won) audio.playWin(); else audio.playLose();
  showEnd(won, state);
  window.__EMBER_DONE__ = { winner: won ? 'you' : 'rook', rounds: state.round, score: state.score };
  document.title = 'EMBER_DONE winner=' + (won ? 'you' : 'rook') + ' rounds=' + state.round + ' score=' + state.score;
}

function restart() {
  if (state.phase === 'title') return;
  startGame();
}

function toggleMute() {
  state.muted = audio.toggleMute();
  updateHud(state);
}

export const game = { state, startGame, pickCard, playRound };

// Autopilot self-test: ?auto=1 plays random affordable cards until someone wins.
function runAutopilot() {
  const step = () => {
    if (state.phase === 'over') return;
    if (state.phase === 'title') { startGame(); }
    if (state.phase === 'pick') {
      const affordable = state.you.hand.filter((c) => c.cost <= state.mana);
      const pool = affordable.length ? affordable : state.you.hand;
      if (!pool.length) return;
      const card = pool[Math.floor(Math.random() * pool.length)];
      pickCard(card);
      playRound();
    }
    window.setTimeout(step, 300);
  };
  window.setTimeout(step, 400);
}

function init() {
  const params = new URLSearchParams(window.location.search);
  bindInput({
    play: () => playRound(),
    start: () => startGame(),
    restart: () => restart(),
    mute: () => toggleMute(),
    pickIndex: (i) => {
      const card = state.you.hand[i];
      if (card) pickCard(card);
    },
  });
  updateHud(state);
  const shot = params.get('shot');
  if (shot) {
    stageShot(shot, game);
    return;
  }
  if (params.get('auto') === '1') {
    runAutopilot();
    return;
  }
  showTitle();
}

window.__EMBER__ = game;
init();
