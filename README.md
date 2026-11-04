# PocketChip v0.2 — Melody Maker

Mobile-first 8-bit loop synthesizer, hosted with GitHub Pages.

## Features
- Four 16-step tracks: Lead, Bass, Arp, Drums
- Beat editor and scale-locked note editor (tap a step, then choose pitch)
- Root note and major, minor, pentatonic scales
- Square, pulse and triangle melodic waveforms, synthesized noise percussion (kick/snare/hat)
- Track randomization, tempo 60–200 BPM, Play/Stop
- Automatic local browser saving (no account required)

## Development

Requires Node.js 22 or later.

```sh
npm install
npm run build
npm run dev
```

## Deployment

Settings → Pages → Source: GitHub Actions. Pushes to main deploy through `.github/workflows/deploy.yml`.

Live site after successful workflow: https://onyx83.github.io/pocketchip/

## v0.2 phone acceptance tests

1. App opens and four tracks are visible.
2. Lead and Bass retain independent 16-step patterns.
3. Arp plays notes and Drums produces percussive sounds.
4. Notes mode selects a step and edits pitch; note changes are audible.
5. Root and scale changes alter melodic pitch while preserving scale lock.
6. Square/Pulse/Triangle sound choices work.
7. Mix It! changes only the selected track.
8. BPM changes playback speed and Stop silences playback.
9. Refresh restores edited patterns, BPM, root, scale and waveforms.
10. Controls fit a narrow mobile screen without horizontal scrolling.

**Note:** Browser-local storage is device/browser specific. Clearing site data will remove saved patterns. Existing v0.1 patterns are not migrated.
