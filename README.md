# SVG Studio

Twelve transparent-canvas studies that treat vector geometry as a programmable medium. Paper.js constructs precise geometry; Rough.js supplies selective hand-drawn texture.

`catalog.json` records the design use, motivating question, family, complexity, and tags for every scene.

| Botanical | Metro | Orbits | Topology |
|---|---|---|---|
| ![botanical](out/botanical-transparent.png) | ![metro](out/metro-transparent.png) | ![orbits](out/orbits-transparent.png) | ![topology](out/topology-transparent.png) |
| Isometric city | Wave lab | Contour map | Circuit |
| ![isometric city](out/isometric-city-transparent.png) | ![wave lab](out/wave-lab-transparent.png) | ![contour map](out/contour-map-transparent.png) | ![circuit](out/circuit-transparent.png) |
| Timeline | Molecule | Loom | Type system |
| ![timeline](out/timeline-transparent.png) | ![molecule](out/molecule-transparent.png) | ![loom](out/loom-transparent.png) | ![type system](out/type-system-transparent.png) |

```bash
npm install
npm test
```

`npm test` type-checks, builds, opens every scene in real headless Chrome with the network blocked, exercises pointer interaction, exports the stage with `omitBackground`, and validates real alpha plus visible/colorful pixel thresholds.
