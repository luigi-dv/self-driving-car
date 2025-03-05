---
type: card
status: todo
priority: 5
effort: M
depends_on: ["01 Deterministic simulation"]
tags: [card, performance]
---

# 07 Performance and Web Worker

## Why

A hundred cars, each casting rays against every border and vehicle, run on the same thread that draws the page. At 16× speed the interface will stutter.

## The principle

**Measure before you optimise.** The slow part is rarely where you expect. Profile, fix the largest cost, measure again. Moving work off the main thread is the last step, not the first.

## Tasks

- [ ] Add a frame-time readout (simulation ms and draw ms) behind a debug flag
- [ ] Record a profile in the browser at 1× and 16× and write down the top five costs in this card
- [ ] Likely wins, to confirm with the profile:
    - [ ] Stop simulating damaged cars entirely
    - [ ] Only test rays against vehicles within sensor range
    - [ ] Stop resizing the canvases every frame; resize on a `ResizeObserver`
    - [ ] Reuse arrays in `Sensor` and `Car.#createPolygon` instead of allocating each frame
- [ ] Move `Simulation.step()` into a Web Worker; the page receives a snapshot to draw
- [ ] At 16×, cap the steps per frame by time budget (8 ms) and show the real speed reached

## Done when

- 100 cars at 16× hold 60 frames per second on your machine
- The interface stays responsive while a generation runs at full speed
- The card holds before and after numbers

## Files

`src/js/main.js`, `src/js/simulation.js`, `src/js/sensor.js`, `src/js/car.js`, new `src/js/worker.js`

## Risks

- A worker can only receive plain data. Class instances with `#private` members do not cross the boundary; the snapshot needs its own shape.
- Workers do not load from `file://`. This is the point where the page needs a server, see [[06 Modules and TypeScript]].

## Related

Needs [[01 Deterministic simulation]]. Speed control from [[04 Product controls and explanations]].
