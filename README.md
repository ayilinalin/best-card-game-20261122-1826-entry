# EMBER DUEL

[![Competition](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![Rank](https://make.fun/badge/best-card-game-20261122-1826/ayilinalin/best-card-game-20261122-1826-entry/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![Reward](https://make.fun/badge/best-card-game-20261122-1826/ayilinalin/best-card-game-20261122-1826-entry/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

**EMBER DUEL** — an original elemental card duel for the make.fun best-card-game bounty.
You face **Rook, Sang Penjaga Batu**, in a duel of element cards. Each round you both play
one card from a hand of five. Power, element advantage and card effects decide the damage.

## How to play

- **Cards**: power 1–9, mana cost 0–3, one of four elements — **Ember** (Api), **Tide** (Air),
  **Thorn** (Daun), **Stone** (Batu). Suits are told apart by colour *and* shape, never text alone.
- **Element cycle**: Ember > Thorn > Tide > Stone > Ember. Winning the element gives +3 power.
- **Effects**: **Shield** blocks the round's damage, **Draw** takes an extra card,
  **Double** doubles the card's power.
- **Mana**: grows every round (max 8). You can only play a card you can afford.
- **Damage**: the round winner deals damage equal to the power difference. Life is 20 each.
  First to 0 loses.
- **Rook reads you**: he counters the suit you play most, saves his big cards while ahead,
  and goes all-in when behind. His reasoning is shown in the log — read him, then counter him.

## Controls

- Mouse: click a card, then **MAIN** (or press Enter).
- Keyboard: **1–5** pick a card, **Enter** play, **M** mute, **N** new duel.
- Sounds are procedural WebAudio — no audio files, no network.

## Run it

```sh
node serve.ts            # serves game/ at http://localhost:8080
# or any static server rooted at game/
```

Open `game/index.html` in desktop Chrome. It plays fully offline from its own files.

## Screenshots

Deterministic staging states for reproducible screenshots live behind query params:
`?shot=title`, `?shot=table`, `?shot=win`, `?shot=loss`. `?auto=1` runs an autopilot
self-test that plays random cards until someone wins.

## Entry

Built for make.fun competition
[best-card-game-20261122-1826](https://make.fun/bounty/best-card-game-20261122-1826).
`main.ts` (Node 22, standard library only) copies `game/` + `screenshots/` to the output
directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-game.ts`.

## License

MIT — see [LICENSE](LICENSE).
