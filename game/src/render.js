// render.js — DOM rendering of cards, hands and the arena.
import { SUITS, EFFECT_TEXT } from './cards.js';

export function cardElement(card, opts) {
  const o = opts || {};
  const el = document.createElement('div');
  el.className = 'card suit-' + card.suit;
  el.dataset.cardId = String(card.id);
  if (o.back) {
    el.classList.add('back');
    return el;
  }
  const suit = SUITS[card.suit];
  el.innerHTML =
    '<span class="cost">' + card.cost + '</span>' +
    (o.key != null ? '<span class="key">' + (o.key + 1) + '</span>' : '') +
    '<span class="power">' + card.power + '</span>' +
    '<span class="suit-shape shape suit-' + card.suit + '"></span>' +
    (card.effect ? '<span class="effect">' + card.effect.toUpperCase() + '</span>' : '') +
    '<span class="suit-name" style="color:' + suit.color + '">' + suit.name.toUpperCase() + '</span>';
  el.title = card.name + ' — power ' + card.power + ', cost ' + card.cost +
    (card.effect ? ', ' + EFFECT_TEXT[card.effect] : '');
  return el;
}

export function renderHand(container, hand, opts) {
  const o = opts || {};
  container.innerHTML = '';
  hand.forEach((card, i) => {
    const el = cardElement(card, { key: o.showKeys ? i : null, back: o.back });
    if (o.back) {
      el.classList.add('dealt');
      el.style.animationDelay = (i * 0.05) + 's';
    } else {
      if (o.selectedId === card.id) el.classList.add('selected');
      if (o.mana != null && card.cost > o.mana) el.classList.add('unaffordable');
      el.classList.add('dealt');
      el.style.animationDelay = (i * 0.05) + 's';
      if (o.onPick) el.addEventListener('click', () => o.onPick(card));
    }
    container.appendChild(el);
  });
}

export function renderPlayed(slot, card, animate) {
  slot.innerHTML = '';
  if (!card) return;
  const el = cardElement(card, {});
  if (animate) el.classList.add('flipped');
  slot.appendChild(el);
}

export function clearSlots(youSlot, foeSlot) {
  youSlot.innerHTML = '<span class="slot-hint">Kartumu</span>';
  foeSlot.innerHTML = '<span class="slot-hint">Kartu Rook</span>';
}

export function shakeElement(el) {
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}
