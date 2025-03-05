---
type: card
status: todo
priority: 1
effort: M
depends_on: []
tags: [card, architecture, simulation]
---

# 01 Deterministic simulation

## Why

The physics runs once per animation frame and every random choice comes from `Math.random`. No two runs are alike, the cars drive faster on a 120 Hz screen than on a 60 Hz one, and a bug seen once cannot be seen again.

## The principle

**Separate what the world does from how it is shown.** A simulation is a function: state plus inputs gives the next state. Drawing only reads that state. Once that holds, the same seed gives the same run, and everything else (fast-forward, replay, tests, a worker thread) is a small step.

## Tasks

- [ ] Add a seeded random generator (`Random` class, mulberry32 is enough) in `src/js/utils.js`
- [ ] Replace every `Math.random` in the simulation with it: `network.js`, `traffic.js`, `traffic/vehicle.js`, the scenarios, `utils.js` (`shuffle`, `getRandomColor`)
- [ ] Add `Settings.seed` and reseed at the start of every generation with `seed + generation`
- [ ] Move the world into a `Simulation` class with `reset(parentBrain)` and `step()`; `main.js` keeps only drawing and the panel
- [ ] Fixed timestep: accumulate real time in `animate` and call `step()` in whole ticks of 1/60 s
- [ ] `step()` must not touch `document`, `window` or a canvas
- [ ] Record the seed in the saved brain so a run can be replayed

## Done when

- Two runs with the same seed and brain give the same fitness after 3,000 steps, to the last digit
- The simulation runs in Node with no DOM stubs
- Driving speed is the same on a 60 Hz and a 120 Hz display

## Files

`src/js/main.js`, new `src/js/simulation.js`, `src/js/utils.js`, `src/js/network.js`, `src/js/traffic.js`, `src/js/traffic/`, `src/js/settings.js`

## Risks

- `Car` builds an off-screen canvas for its coloured image in the constructor. That has to move into the drawing code or the simulation still needs a DOM.
- Colours picked with the seeded generator change the order of random numbers. Use a second generator for anything cosmetic.

## Related

Unlocks [[02 Tests and CI]], [[03 Learning dashboard]], [[07 Performance and Web Worker]]. See [[Roadmap]].
