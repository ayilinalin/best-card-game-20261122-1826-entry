// input.js — keyboard and mouse input. 1-5 pick a card, Enter plays, M mutes, N restarts.
export function bindInput(handlers) {
  document.getElementById('play-btn').addEventListener('click', () => handlers.play());
  document.getElementById('start-btn').addEventListener('click', () => handlers.start());
  document.getElementById('again-btn').addEventListener('click', () => handlers.restart());
  document.getElementById('mute-btn').addEventListener('click', () => handlers.mute());

  document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '5') {
      handlers.pickIndex(Number(e.key) - 1);
    } else if (e.key === 'Enter') {
      handlers.play();
    } else if (e.key === 'm' || e.key === 'M') {
      handlers.mute();
    } else if (e.key === 'n' || e.key === 'N') {
      handlers.restart();
    }
  });
}
