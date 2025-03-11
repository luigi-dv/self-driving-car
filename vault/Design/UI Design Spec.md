---
type: design
tags: [design, ui]
---

# UI Design Spec: landing interface

Card: [[08 Landing interface]]. The design is the page itself: `index.html` and `src/css/style.css`.

## Passes

1. Outlined tiles, three accents. Rejected as generic: [[UI Review of the first design]].
2. "The dark room" from the taste skill. Rejected: amber accent, devices borrowed from showcase sites.
3. Plain: green accent, one ground, system typeface, lists.
4. **Two views and a history line.** Pass 3 still explained everything. This one cuts the prose and splits the page.

## Two views

A toggle under the name, remembered between visits.

| | Overview (default) | Technical |
|---|---|---|
| For | Watching | Changing and inspecting |
| First screen | Road, regions, pause and speed, one sentence, the history line | The same, plus readouts, lane arrows, reasons, last broken rule |
| Below | Nothing | Network, Brain, Scenarios, Rules |
| History line | Generation, bar, best fitness; last 8 | Plus average, alive, broken; last 20 |

Anything with class `tech` is hidden unless `<html data-view="technical">`.

## Content rules

- A label names the thing. It does not describe it.
- No sentence explains a control, a chart or a section. The overview has one sentence: what the rules ask of the car.
- A consequence is stated only when it is about to happen (a pending network change).
- An empty state shows nothing.
- If two elements say the same thing, one goes.

## The history line

The data is a line of generations, newest on top.

```
■ 5  ▬▬▬▬▬▬▬           4,513      now: bar and number are live
│    ▪▪▫▫▫▫▫▫▫ Faster traffic behind      one mark per scenario of the drive
■ 4  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  11,580
■ 3  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  11,474
```

- The bar is best fitness, on one scale for all rows.
- The green square is the generation driving now; the green mark is the scenario it is in.
- A row carries the region's name only where the region changed.
- It replaces the fitness chart, the frame meter and, in the overview, the scenario list and the readouts.

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

Green only as a small mark. Red only as text. Surfaces step in tone: no borders, shadows, gradients or rounded corners. Three sizes; lead is used once, for the sentence. No web font.

## Layout

Seven columns, 14px margins and gaps, from 1100px. Four from 720px, two below.

```
┌ name ─┬ pitch ┬───────────┬ regions ┬ readouts* ┬─ time ┐
│ views │       │   road    │         │           │ Pause │
│                           │                             │
├ the sentence ─────────────┤         ├ history line ─────┤
│ arrows*, reasons*         │         │                   │
└───────────────┴───────────┴─────────────────────────────┘
section name* │ content*, from the road's left edge        * technical only
```

## DOM contract

| id | Written by | Content |
|---|---|---|
| `myCanvas`, `networkCanvas` | draw loop, `Sizing` | Road (buffer 340 wide); network, drawn only in the technical view |
| `viewGeneral`, `viewTechnical` | `setView` | `aria-checked` |
| `regionInput` | `setupRegions`, `setRegion` | One radio button per profile |
| `pauseButton`, `stepButton`, `speed1Button`, `speed4Button`, `speed16Button` | time controls | Label, `aria-pressed`, `disabled` |
| `status` | `setStatus` | Last message |
| `whyLane`, `whySpeed`, `whySpeedNow` | `Panels` | "middle lane", "96 km/h", "88 km/h" |
| `whyLaneMap`, `whyHere`, `whyReasons` | `Panels` | Lane arrows, where the car is, reasons |
| `violationLine`, `violation`, `violationRule`, `violationSeverity` | `Panels` | Last broken rule of the best car; hidden when none |
| `historyLine` | `HistoryLine` | First `li` is the generation driving now; the rest are built from `GenerationHistory` |
| `generationStat`, `fitnessBar`, `fitnessStat`, `aliveNow`, `brokenNow` | `updateStats`, `HistoryLine` | The "now" row |
| `scenarioStops`, `scenario` | `HistoryLine`, `updateStats` | One mark per scenario; the current one's name |
| `aliveStat`, `distanceStat`, `recordStat`, `violationStat`, `frameStat` | `updateStats`, `Panels` | Readouts |
| `modelParams`, `modelHidden` | `Panels` | From the running network |
| `neuronsInput`, `neuronsStat`, `activationInput`, `networkHint`, `networkApply` | `previewNetwork`, `applyNetwork` | Staged network change; the hint is empty unless one is pending |
| `savedStat`, `saveButton`, `discardButton`, `restoreButton`, `exportButton`, `importButton`, `importInput`, `nextButton` | `updateButtons`, markup | Brain |
| `mutationInput`, `mutationStat` | `setMutation` | Mutation |
| `scenarioList` | `Panels` | Name, what it tests, state |
| `policyName`, `policyHandedness`, `policyRules` | `Panels` | Rule, what it asks, kept or broken |

Words for rules and scenarios: `src/js/ui/copy.js`. Canvas colours: `src/js/ui/theme.js`.

## Checks

- Taste `lint.mjs`: 0 FAIL, 0 WARN.
- Taste `inspect.mjs` wants pictures and full screens. Not applicable to this page, by choice.
- The overview holds under 60 words.

## Out of scope

Manual driving, jumping to a scenario, following another car, experiments, a light theme.
