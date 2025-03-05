---
type: design
tags: [design, ui]
---

# UI Design Spec: landing interface

Card: [[08 Landing interface]]. The design is the page itself: `index.html` and `src/css/style.css`.

This is the third pass.

1. **Outlined tiles, three accents.** Rejected as generic. See [[UI Review of the first design]].
2. **"The dark room"**, dealt by the taste skill: sign-coloured grounds, an amber accent, a departure board, a display-size sentence. Rejected: the amber read as an assistant's brand colour, and the devices were borrowed from showcase sites.
3. **This one: plain.** Green accent, one neutral ground, the system typeface, three sizes, lists instead of devices.

## The idea

The road is the page. It runs through the first screen from edge to edge and everything else is text on the same grid: what you can change hangs from the top, what the car is told sits beside the road, and the sections below are a name on the left with their content starting on the road's left edge.

Nothing is decorated. A thing is either text, a quiet button, or one of three canvases.

## Tokens

```css
:root{
  --bg:#121413; --surface:#1b1e1c; --surface-2:#262a27;
  --ink:#eceeeb; --muted:#a4a9a5;
  --accent:#62c370;     /* selected or live */
  --stop:#f0776b;       /* a broken rule */
  --font:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  --step-small:0.875rem;
  --step-body:clamp(1rem,0.96rem + 0.2vw,1.0625rem);
  --step-lead:clamp(1.25rem,1.1rem + 0.6vw,1.5rem);
  --edge:14px;
}
```

- **Green marks what is selected or live:** the small square before the chosen region, speed and current scenario, the arrow on the lane the rules ask for, the slider thumbs, the sensor rays and a neuron that fired. Nothing is filled with it.
- **Red is a broken rule,** as text.
- **Three sizes.** Small for the chart key and the footer, body for everything, lead for the two sentences that carry a section (what the rules ask, what the model is).
- **Surfaces step in tone.** No borders, shadows, gradients or rounded corners. Buttons are a tone step; Pause is the one solid light element.
- **No web font.** The page makes no external request.

## Layout

Seven columns, 14px margins and gaps, from 1100px. Four columns from 720px, two below.

```
┌ name ─┬ pitch ┬───────────┬ regions ┬ readouts ┬── time ┐
│       │       │   road    │         │          │  Pause │
│                           │                             │
├ what the rules ask ───────┤           ├ network ────────┤
│ lane arrows, reasons      │           │ caption         │
└───────────────┴───────────┴─────────────────────────────┘
name of section │ content, from the road's left edge
                │ scenarios: name, what it tests, state; the current one explained
                │ learning: three sentences, each with its control; then the chart
                │ model: one sentence, the network controls
                │ rules: one sentence, then name, what it asks, kept or broken
footer: one line
```

On a phone: name and pitch, time controls, road at 56svh, regions beside readouts, the rest stacked.

## DOM contract

Ids the scripts write. Everything else is static markup.

| id | Element | Written by | Content |
|---|---|---|---|
| `myCanvas` | canvas | draw loop, `Sizing` | Road. Buffer 340 wide, height follows the well |
| `networkCanvas` | canvas | `Visualizer`, `Sizing` | Best car's network |
| `regionInput` | div radiogroup | `setupRegions`, `setRegion` | One `button.plain.lamp[role=radio]` per profile |
| `generationStat` `aliveStat` `distanceStat` `recordStat` `fitnessStat` `violationStat` | dd | `updateStats` | Readouts |
| `scenario` | dd | `updateStats` | Current scenario title |
| `pauseButton` `stepButton` `speed1Button` `speed4Button` `speed16Button` | button | time controls | Label, `aria-pressed`, `disabled` |
| `status` | p status | `setStatus` | Last message |
| `whyLane` `whySpeed` `whySpeedNow` | span | `Panels` | "middle lane", "96 km/h", "88 km/h" |
| `whyLaneMap` | div | `Panels` | One `span.head` per lane in screen order, `is-target` on the directive's lane |
| `whyHere` | div | `Panels` | One span per lane, `is-here` where the best car is |
| `whyReasons` | ul | `Panels` | One sentence per reason |
| `violationLine` `violation` `violationRule` `violationSeverity` `violationEmpty` | p, span | `Panels` | Last violation of the best car, or the empty line |
| `directive` | p, visually hidden | `updateStats` | The directive as one sentence |
| `scenarioList` | ol | `Panels` | One row per scenario: `span.what`, `span.tests`, `span.state`, `span.detail`; `is-done`, `is-now` |
| `nextButton` `saveButton` `discardButton` `restoreButton` `exportButton` `importButton` `importInput` | button, input | markup, `updateButtons` | Brain actions |
| `frameStat` `frameBar` | span | `Panels` | "1,240 of 7,200" and its meter |
| `savedStat` | span | `updateButtons` | "gen 12" or "none" |
| `mutationInput` `mutationStat` | range, output | `setMutation` | Mutation amount |
| `fitnessChart` `fitnessEmpty` | canvas, p | `FitnessChart` | Best and average fitness per generation |
| `modelParams` `modelHidden` | span | `Panels` | 82 and 6, from the running network |
| `neuronsInput` `neuronsStat` `activationInput` `networkHint` `networkApply` | controls | `previewNetwork`, `applyNetwork` | Staged network change |
| `policyName` `policyHandedness` `policyRegions` | span | `Panels` | The sentence above the rules table |
| `policyRules` | tbody | `Panels` | One row per enabled rule: name, what it asks, "kept" or "14 broken, 2 out" |

The words for rules and scenarios live in `src/js/ui/copy.js`.

## Canvas palette

In `src/js/ui/theme.js`. The canvases are transparent, so the ground shows around the road and the network.

| What | Colour |
|---|---|
| Road surface, ramp | white at 7% (a tone step of the ground) |
| Lane marks, edges | `#ECEEEB`, marks at 55% |
| Best car | white |
| Other learning cars | grey at 25% |
| Traffic | four desaturated body colours |
| Sensor rays, directive marker | green `#62C370` |
| Lane closure | red `#F0776B` |
| Vehicle lamps | their real colours |
| Network: positive weight, fired neuron | green |
| Network: negative weight | white |
| Chart: best, average | white, white at 45%. No grid, no fill |

## What the taste inspector says

`lint.mjs`: 0 FAIL, 0 WARN.

`inspect.mjs` measures a marketing page and asks for more of everything. On this pass it fails two checks and they are left failing on purpose:

- **few pictures, no footage:** the page has three canvases and no imagery. That is the brief.
- **empty screens:** the sections are short lists with space around them. That is also the brief.

The house rules it shares with a plain page still hold and still pass: no outlined boxes, no gradients, no shadows, no uppercase labels, no monospace, nothing under 13px, one typeface, three sizes.

## Out of scope

Manual driving mode, jumping to a scenario from the list, clicking a car to follow it, experiment mode, a light theme.
