# SVG Studio

Three transparent-canvas studies that treat vector geometry as a programmable medium. Paper.js constructs the precise geometry; Rough.js supplies selective hand-drawn texture.

| Scene | Preview | Visual system |
|---|---|---|
| Botanical atlas | ![botanical](out/botanical-transparent.png) | Bézier petals, veins, translucent layering |
| Metro currents | ![metro](out/metro-transparent.png) | Routed ribbons, stations, sketch overlays |
| Orbital cartography | ![orbits](out/orbits-transparent.png) | Parametric ellipses, satellites, annotations |

```bash
npm install
npm test
```

`npm test` type-checks, builds, opens every scene in real headless Chrome with the network blocked, exercises pointer interaction, exports the stage with `omitBackground`, and validates real alpha plus visible/colorful pixel thresholds.
