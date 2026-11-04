# PocketChip v0.3 — Project Vault

A playful four-track mobile-first 8-bit loop synthesizer.

## Features
- Lead, Bass, Arp and Drums 16-step tracks
- Note editor, scale lock, root note, waveforms, tempo and randomization
- Browser-local autosave with a last-valid-project fallback
- **Export JSON**: download a portable backup of your current loop
- **Import JSON**: validate the backup, preview its name and confirm before replacing the current loop
- Imported loops retain their notes, beats, tempo, scale, root and waveform choices

## Safety and storage

Exports use a versioned `pocketchip-project` envelope containing the v0.2 music schema. Import only accepts this format, validates project structure and limits files to 256 KB. Import does not overwrite the current project until you explicitly confirm. Autosave uses the existing `pocketchip-v02-project` key to preserve v0.2 work. A fallback backup is kept locally, but **downloaded JSON is the durable backup**: clearing browser data can remove all local copies. Browser downloads on mobile may ask for permission or appear in Downloads.

## Run locally

Node.js 22 or later:

```sh
npm install
npm run build
npm run dev
```

## Deploy

GitHub Pages: https://onyx83.github.io/pocketchip/ — Settings → Pages → Source: GitHub Actions.

## v0.3 acceptance tests

1. Existing v0.2 loop is still present after upgrade.
2. Project Vault displays project name, Export JSON and Import JSON.
3. Export downloads a valid `.json` file.
4. Change notes, beats and tempo, then import the exported file; confirm original settings return.
5. Cancel import: current loop remains unchanged.
6. Invalid JSON and non-PocketChip JSON are rejected without replacing the loop.
7. Reload the page: edited or imported project persists.
8. All four tracks play and controls remain mobile-friendly.
9. Verify exported file is visible in Downloads or your browser's download manager.

