---
type: card
status: todo
priority: 2
effort: L
depends_on: []
tags: [card, product, ux]
---

# 04 Product controls and explanations

## Why

A visitor lands on a road with cars and a column of unlabeled icons. Nothing says what is happening, nothing can be slowed down, and the most interesting part (why the car just changed lane) is one line of small text.

## The principle

**A product is finished when someone can use it without you in the room.** That means the visitor controls time, can go straight to the part they care about, and gets an answer to "why did it do that" in their own words.

## Tasks

Interface part, shipped with [[08 Landing interface]]:

- [ ] Pause, single step, and speed 1×, 4×, 16×
- [ ] Scenario list showing which one is active
- [ ] "Why" panel: the directive's lane, speed and reasons, and the last violation with the rule that raised it
- [ ] Short intro that says what the page is in two sentences
- [ ] Layout that works on a phone

After that:

- [ ] Jump to a scenario: `ScenarioDirector.play(scenario)` clears the traffic and spawns the chosen one ahead of the best car
- [ ] Manual mode: the visitor drives with the keyboard (the `KEYS` control type already exists) and the same rules audit them, with a score at the end
- [ ] Follow any car, not only the best: click a car to see its network and directive
- [ ] Shareable link: region, seed and settings in the URL
- [ ] Keyboard shortcuts: space to pause, `.` to step, `1` `2` `3` for speed

## Done when

- Someone who has never seen the project can say what it does after 30 seconds on the page
- Every control has a visible label or a tooltip, and works with the keyboard
- Manual mode ends with "you broke 3 rules: ..." under each of the four profiles

## Files

`index.html`, `src/css/style.css`, `src/js/main.js`, `src/js/traffic/scenario.js`, `src/js/controls.js`

## Risks

- Speed 16× runs the simulation 16 times per frame. On a slow machine that drops frames; cap it by time spent per frame. See [[07 Performance and Web Worker]].
- Manual mode has no ghost cars to compare with unless the AI cars keep running. Decide which before building it.

## Related

[[03 Learning dashboard]], [[08 Landing interface]]
