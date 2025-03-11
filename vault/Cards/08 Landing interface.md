---
type: card
status: doing
priority: 2
effort: L
depends_on: []
tags: [card, design, ui]
---

# 08 Landing interface

## Why

The page is a grey background, two canvases and a column of small icons. The work underneath (regional policies, rules, scenarios, a learning network) is invisible. The interface should make a visitor want to touch it.

## The principle

**Show the thing working, do not describe it.** The simulation is the hero. Around it, each section answers one question in its own composition, and the visual language is the road's own: paint, signs and lamps, not science fiction.

## The pattern

- **Interactive sandbox in the hero.** The live simulation with the controls that change it next to it: region, pause, step, speed.
- **Dark, with one quiet accent.** A neutral dark ground. Green only as a small mark on what is selected or live.
- **One grid, no cards.** Groups are made by position, never by an outlined box.
- **No AI clichés, and no borrowed showcase devices.** No glowing brains, no departure boards, no giant sentences. Plain lists, the real simulation and the real network graph.

## How it was designed

Four passes, each one a correction. See [[UI Design Spec]].

1. Outlined tiles and three accents: generic.
2. The taste skill's dealt direction: distinctive, but an amber accent and borrowed devices.
3. Plain lists and a green accent: clean, but it explained everything.
4. Two views and a history line: the overview is the road, one sentence and the generations; the technical view holds the rest.

## Tasks

- [x] First design by the designer agent (rejected)
- [x] Review of the first design
- [x] Second design with the taste skill: direction, mockup, spec (rejected: amber accent, showcase devices)
- [x] Third pass: green accent, minimal
- [x] Fourth pass: overview and technical views, history line, prose cut
- [x] Canvas theme: road, cars, sensors, network graph
- [x] Speed, pause and step
- [x] Generation history
- [x] Page rebuilt
- [x] Scenario list, rules table, lane arrows (technical view)
- [x] Works from 360 px wide to a large desktop
- [x] Checked in a real browser (headless Chrome, 45 acceptance checks)
- [ ] Looked at by a person in a normal browser window, and in Safari and Firefox

## Done when

- Every control that existed before still works: save, discard, restore, next generation, export, import, region, mutation
- The page opens straight from `index.html` with no build step
- The first screen shows the simulation running and at least three controls
- Text contrast meets WCAG AA
- The taste lint passes; the inspector's remaining FAILs are explained in the spec

## Files

`index.html`, `src/css/style.css`, `src/js/main.js`, new `src/js/ui/`, colours in `src/js/road.js`, `src/js/car.js`, `src/js/sensor.js`, `src/js/visualizer.js`

## Risks

- The canvases were sized to the window height every frame. In a grid they must follow their tile, or the page scrolls and stretches.
- The system typeface differs per platform. Check the first screen on Windows and Android as well as macOS.

## Related

Ships the interface part of [[03 Learning dashboard]] and [[04 Product controls and explanations]].
