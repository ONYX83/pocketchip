# PocketChip v0.1

A playful mobile-first 8-bit loop synthesizer with an arcade-inspired interface.

## Features

- Two editable 16-step tracks (Lead and Bass)
- Square and pulse oscillator sounds generated with the Web Audio API
- Play/Stop, tempo control (60–200 BPM), Clear and Mix It!
- Responsive touch interface
- GitHub Pages deployment workflow

## Run locally

Node.js 22 or later:

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

## Deploy

In GitHub Settings → Pages, choose **GitHub Actions** as the build and deployment source. A push to `main` triggers the workflow.

After successful deployment: https://onyx83.github.io/pocketchip/

## Current limitations

v0.1 is an initial playable prototype, not cycle-accurate 8-bit hardware emulation. Audio starts on a user gesture. Step audio scheduling uses the audio clock; visual updates use JavaScript timers. Saving, note editing and offline support are planned for later milestones.

## Roadmap

v0.2: More tracks, note editor, noise drums, scales.

v0.3: Visualizer, effects, mutation and undo.

v0.4: Save, import/export and WAV export.

v1.0: Installable PWA, offline support and mobile compatibility testing.
