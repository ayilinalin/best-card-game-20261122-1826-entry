// main.ts — EMBER DUEL entrypoint: copies game/ + screenshots/ into the output
// directory and writes /output/dossier.json with buildDossier from the kit.
// Node 22 standard library only. Never removes the output directory itself:
// the grader mounts /output, so only its contents are emptied, per item.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const DOSSIER_MAX_BYTES = 1536 * 1024; // 1.5 MiB gate cap on dossier.json
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 256 * 1024 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000,
};

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// Empty a directory's contents per item — never rmSync the directory itself.
function emptyDirPerItem(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    return;
  }
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

function copyTree(src, dest) {
  if (!existsSync(src)) throw new Error('main.ts: missing source directory: ' + src);
  cpSync(src, dest, { recursive: true });
}

function main() {
  const gameSrc = join(repoRoot, 'game');
  const shotsSrc = join(repoRoot, 'screenshots');
  if (!existsSync(gameSrc) || !statSync(gameSrc).isDirectory()) {
    throw new Error('main.ts: game/ not found in repository root');
  }
  if (!existsSync(shotsSrc) || !statSync(shotsSrc).isDirectory()) {
    throw new Error('main.ts: screenshots/ not found in repository root');
  }
  emptyDirPerItem(outDir);
  copyTree(gameSrc, join(outDir, 'game'));
  copyTree(shotsSrc, join(outDir, 'screenshots'));
  if (!existsSync(join(outDir, 'game', 'index.html'))) {
    throw new Error('main.ts: game/index.html missing after copy');
  }
  const dossier = buildDossier(outDir, CAPS);
  if (dossier.length > DOSSIER_MAX_BYTES) {
    throw new Error('main.ts: dossier ' + dossier.length + ' bytes exceeds 1.5 MiB cap');
  }
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  // Self-check: rebuilding the dossier from the written output must match byte for byte.
  const rebuilt = buildDossier(outDir, CAPS);
  if (rebuilt.length !== dossier.length || !rebuilt.every((b, i) => b === dossier[i])) {
    throw new Error('main.ts: dossier self-check mismatch after write');
  }
  console.log('EMBER DUEL entry written to ' + outDir + ' (dossier ' + dossier.length + ' bytes)');
}

main();
