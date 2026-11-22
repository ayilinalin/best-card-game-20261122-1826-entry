// hud.js — life bars, score, mana, deck counts, round log, banners.
import { MAX_LIFE } from './cards.js';

const $ = (id) => document.getElementById(id);

export function updateHud(state) {
  $('life-you-num').textContent = String(Math.max(0, state.you.life));
  $('life-foe-num').textContent = String(Math.max(0, state.foe.life));
  $('life-you-fill').style.width = Math.max(0, state.you.life / MAX_LIFE * 100) + '%';
  $('life-foe-fill').style.width = Math.max(0, state.foe.life / MAX_LIFE * 100) + '%';
  $('round-badge').textContent = 'RONDE ' + state.round;
  $('score-num').textContent = String(state.score);
  $('mana-num').textContent = String(state.mana);
  $('deck-num').textContent = String(state.deck.length);
  $('discard-num').textContent = String(state.discard.length);
  $('wins-num').textContent = state.roundsWon + ' – ' + state.roundsLost;
  $('you-hand-count').textContent = state.you.hand.length + ' kartu';
  $('foe-hand-count').textContent = state.foe.hand.length + ' kartu';
  $('mute-btn').textContent = state.muted ? 'SUARA: OFF' : 'SUARA: ON';
  const playBtn = $('play-btn');
  playBtn.disabled = !state.selectedId || state.phase !== 'pick';
}

export function logLine(html) {
  const log = $('round-log');
  const li = document.createElement('li');
  li.innerHTML = html;
  log.prepend(li);
  while (log.children.length > 8) log.removeChild(log.lastChild);
}

export function setBanner(html) {
  $('round-banner').innerHTML = html;
}

export function clearBanner() {
  $('round-banner').innerHTML = '';
}

export function setAiHint(text) {
  $('ai-hint').textContent = text;
}

export function showEnd(won, state) {
  const screen = $('end-screen');
  const inner = screen.querySelector('.end-inner');
  inner.classList.remove('win', 'loss');
  inner.classList.add(won ? 'win' : 'loss');
  $('end-title').textContent = won ? 'MENANG!' : 'KALAH';
  $('end-sub').textContent = won
    ? 'Rook tumbang! Api Ember-mu membakar Sang Penjaga Batu. Ronde ' + state.round + ' · ' + state.roundsWon + ' ronde menang.'
    : 'Rook menang. Lifemu habis di ronde ' + state.round + ' — susun ulang taktikmu dan coba lagi.';
  $('end-score').textContent = String(state.score);
  screen.classList.remove('hidden');
}

export function hideEnd() {
  $('end-screen').classList.add('hidden');
}

export function showTitle() {
  $('title-screen').classList.remove('hidden');
}

export function hideTitle() {
  $('title-screen').classList.add('hidden');
}
