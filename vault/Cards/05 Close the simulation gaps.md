---
type: card
status: todo
priority: 3
effort: L
depends_on: ["02 Tests and CI"]
tags: [card, simulation, policy]
---

# 05 Close the simulation gaps

## Why

The simulation takes shortcuts that a careful visitor will notice, and some rules are only half enforced.

## The principle

**Change one thing, with a test written first.** Each gap below is small on its own. The skill is closing them one at a time without disturbing the rules that already work, which is only possible once [[02 Tests and CI]] exists.

## The gaps

- [ ] **The learning cars do not see each other.** They overlap freely. Feed the other AI cars near the best one into perception, or run each car in its own copy of the world.
- [ ] **Passing on the inside still happens a lot.** Roughly 120 to 210 soft violations per generation of 100 cars under the strict profiles. Find out whether the penalty is too low or the baseline brain cannot hold back.
- [ ] **Emergency corridor violations**, a few dozen per generation.
- [ ] **The learning car is never the ramp car.** "Ramp agent must yield" is only played by scripted traffic. Start some generations on the ramp.
- [ ] **The ramp is drawn outside a solid border.** Open the border along the merge zone.
- [ ] **The lane closure is always in lane 0.** Pick the lane from the scenario.
- [ ] **Undertaking has no severity in the policy file.** It is audited as soft. Add `undertaking_penalty` to the profiles and read it.
- [ ] **Traffic ignores the learning cars** except for gap checks. Let scripted vehicles brake for a car ahead of them.
- [ ] **The unit scale is arbitrary** (3 px per frame is 120 km/h, 4 px per metre). Derive both from one car length and a frame rate, and check that the 150 m trigger distance looks right on screen.
- [ ] **Restoring a brain that does not fit** still reports "Brain restored".

## Done when

- Each closed gap has a test that failed before the fix and passes after
- Inside-pass violations under `EU_STRICT` are below 10 per generation
- No existing rule test changed to make room for a fix

## Files

`src/js/policy/perception.js`, `src/js/policy/rules/`, `src/js/traffic/`, `src/config/policies.js`, `src/js/settings.js`

## Risks

- Cars that see each other change everything the brains have learned. Saved brains will drive worse for a while.

## Related

[[02 Tests and CI]], [[Glossary]]
