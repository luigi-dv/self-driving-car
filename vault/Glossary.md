---
type: note
tags: [self-driving-car]
---

# Glossary

**Brain** — the neural network of one car. A small fully connected network: 5 ray readings plus 3 guidance values in, 4 controls out (forward, left, right, reverse).

**Neuroevolution** — how the brains are trained. The best car of a generation is copied to every car of the next one and each copy is changed a little at random. There is no backpropagation.

**Generation** — one run of all the cars from the start line until they crash, stall or run out of frames.

**Fitness** — the score that picks the best car: distance driven minus the penalties for breaking rules.

**Mutation amount** — how far a copied brain is moved towards random weights. Low values refine, high values explore.

**Baseline brain** — a hand-built network that follows the directive. New cars start from it, because from random weights they never learned to change lane.

**Policy profile** — the highway rules of one region (`EU_STRICT`, `UK_STRICT`, `NA_FLEXIBLE`, `JP_STRICT`), defined in `src/config/policies.js`.

**Rule** — one entry of the policy matrix as a class in `src/js/policy/rules`. A rule plans (changes the directive) and audits (checks what the car did).

**Directive** — what the rules want from a car this frame: target lane, target speed, lateral offset, signals, and the reasons.

**Guidance** — the directive as three numbers fed to the brain: lane error, speed error, heading.

**Violation** — a broken rule. A soft one costs fitness, a hard one takes the car out.

**Orchestrator** — runs the rules for every car in stage order: lane selection, passing, merge, exceptions, signals.

**Scenario** — a scripted traffic situation placed ahead of the best car so a rule has something to react to (slow traffic, ramp merge, lane closure, gridlock and so on).

**Technique** — the scripted behaviour of one traffic vehicle (cruise, crawl, ramp merge, zipper, emergency run).

**Handedness** — which side traffic drives on: `RHT` right-hand, `LHT` left-hand. Lane 0 is always the slow lane.
