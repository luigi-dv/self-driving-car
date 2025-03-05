---
type: card
status: todo
priority: 1
effort: M
depends_on: ["01 Deterministic simulation"]
tags: [card, testing, ci]
---

# 02 Tests and CI

## Why

The project has no tests. The policy rules were checked with a throwaway Node script that lives outside the repository, so nobody else can run it and nothing stops a later change from breaking a rule.

## The principle

**Test behaviour, not implementation.** A good test reads like the rule it protects: "under `EU_STRICT`, in slow traffic, the car passes on the left and returns to lane 0". It should survive a full rewrite of the rule's code. **Continuous integration** then runs those tests on every push, so the answer to "did I break it" costs nothing.

## Tasks

- [ ] `test/harness.js`: load the scripts in the order of `index.html` and run the simulation headlessly (after card 01 this needs no DOM stubs)
- [ ] One scenario test per rule, with a fixed seed:
    - [ ] strict discipline: returns to lane 0 after a pass
    - [ ] single side pass: never passes on the inside
    - [ ] congestion override: inside pass allowed below the queue speed
    - [ ] flexible cruise and omni pass under `NA_FLEXIBLE`
    - [ ] mainline priority, cooperative merge, zipper merge
    - [ ] emergency corridor, emergency move over
    - [ ] high-beam yield, sustained blinker, hazard deceleration, courtesy hazards
- [ ] Unit tests for the pure parts: `BrainStorage.parse`, `NeuralNetwork.matches`, `Units`, `PolicyProfile.speedKmh`, `Road.laneToX` for both handedness values
- [ ] A regression test: every profile drives 3,000 steps with no exception
- [ ] `package.json` with `npm test` using the built-in `node --test` runner, no dependencies
- [ ] `.github/workflows/test.yml` running `npm test` on push and pull request
- [ ] Status badge in the README

## Done when

- `npm test` passes locally and on GitHub
- Deleting the body of any rule's `plan` makes at least one test fail
- A test run takes under 30 seconds

## Files

New `test/`, `package.json`, `.github/workflows/test.yml`

## Risks

- Tests that assert exact fitness numbers break on every tuning change. Assert behaviour (lane, violations, order of events) and keep exact numbers for the determinism test only.

## Related

Needs [[01 Deterministic simulation]]. Protects [[05 Close the simulation gaps]] and [[06 Modules and TypeScript]].
