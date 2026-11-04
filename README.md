# PocketChip v0.4 — Arcade Performance

A mobile-first 8-bit loop synthesizer with four tracks, scale-locked notes and project backups.

## New in v0.4
- Animated arcade pixel-bar visualizer, with reduced-motion support and on/off toggle
- Per-track volume, note length and crunch controls
- Mutate: make 2–4 small edits to the selected track
- Undo: restore up to 20 recent edits during the current session
- Compatible with v0.3 JSON exports and local autosaves (optional controls default when missing)

## Existing features
- Lead, Bass, Arp and Drums; 16-step patterns
- Root notes, scales, waveforms, tempo, randomization
- Project Vault JSON export/import and browser-local autosave

## Build

```sh
npm install
npm run build
npm run dev
```

## v0.4 phone acceptance tests
1. App opens, existing saved v0.3 project survives and all four tracks play.
2. Pixel visualizer animates during playback and can be toggled off/on.
3. Volume slider changes only selected track and zero mutes it.
4. Note length changes audible duration of selected track.
5. Crunch changes selected track sound.
6. Mutate makes small changes to selected track, preserving other tracks.
7. Undo restores changes; button disables when history is empty.
8. Sound controls persist after refresh and survive JSON export/import.
9. Old v0.3 JSON imports successfully with default sound controls.
10. Mobile layout has no horizontal overflow; reduced-motion preference disables visualizer animation.

## Notes
Visualizer is a beat-synchronized decorative animation, not a frequency-spectrum analyzer. Undo history is session-only and not exported. Export a JSON backup before testing imports. Local storage is browser-specific.

Deployed through GitHub Actions to https://onyx83.github.io/pocketchip/.
