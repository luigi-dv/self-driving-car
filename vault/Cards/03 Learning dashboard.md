---
type: card
status: todo
priority: 2
effort: M
depends_on: ["01 Deterministic simulation"]
tags: [card, product, measurement]
---

# 03 Learning dashboard

## Why

The page shows cars, not learning. There is no way to see whether generation 40 is better than generation 5, or whether a change to the mutation amount helped or hurt.

## The principle

**You cannot improve what you do not measure, and you cannot trust a comparison that changes two things at once.** A controlled experiment keeps the seed fixed, changes one parameter, and compares the curves. This habit matters more than any network architecture.

## Tasks

Interface part, shipped with [[08 Landing interface]]:

- [ ] Keep a history of every generation: best fitness, average fitness, cars alive at the end, violations per rule
- [ ] Line chart of best and average fitness per generation
- [ ] Violations broken down by rule for the current generation

Experiment part, after [[01 Deterministic simulation]]:

- [ ] Persist the history with the saved brain
- [ ] "Experiment" mode: pick a parameter (mutation amount, hidden neurons, activation, soft penalty), two values, a seed and a number of generations; run both and overlay the curves
- [ ] Export the history as CSV
- [ ] Write the first three experiments up as notes in this vault, with the question, the setup and what the curves showed

## Done when

- The chart updates at the end of every generation and survives a region change
- An experiment with the same seed and the same value twice gives two identical curves
- There is at least one written experiment whose result surprised you

## Files

New `src/js/ui/history.js`, `src/js/ui/chart.js`; `src/js/main.js`

## Risks

- Averages hide what matters. Plot the best car too, and the count of hard violations.
- Without card 01, differences between two runs are mostly noise. Do not draw conclusions before the seed is fixed.

## Related

[[04 Product controls and explanations]], [[08 Landing interface]], [[Glossary]]
