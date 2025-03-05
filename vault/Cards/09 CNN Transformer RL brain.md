---
type: card
status: later
priority: 6
effort: XL
depends_on: ["01 Deterministic simulation", "02 Tests and CI", "06 Modules and TypeScript"]
tags: [card, research, machine-learning]
---

# 09 CNN Transformer RL brain

## Why

The current brain sees five ray distances and has no memory. Rules that depend on history (a vehicle that has kept its blinker on, one closing fast from behind) are invisible to it; the policy layer has to tell it what to do. A model that sees the road as a grid and remembers recent frames could learn those rules from the reward alone.

## The principle

**Keep a baseline and beat it.** A bigger model is only better if a curve says so. The small network stays as a selectable brain and every result is compared against it on the same seeds.

## The shape

- **Observation:** an ego-centred grid around the car, about 32×16 cells, with channels for vehicles, lane borders, relative speed and signals
- **CNN:** a few convolution layers turn one grid into one feature vector
- **Transformer:** attention over the last several frames plus one token carrying the directive
- **Reinforcement learning:** an action head and a value head trained with PPO; reward is progress minus compliance penalties, a hard violation ends the episode
- The policy rules, scenarios and traffic stay as they are: they become the reward and the curriculum, and the hundred cars become a hundred parallel environments

## Tasks

- [ ] Environment interface over the simulation: `reset()` and `step(action)` returning observation, reward, done
- [ ] Grid observation, with a debug view that draws what the car sees
- [ ] TensorFlow.js with the WebGPU or WebGL backend
- [ ] CNN and PPO first, no transformer; reach the baseline's fitness
- [ ] Add the transformer over frame history; compare with and without
- [ ] Brain selector in the interface: evolved network or learned policy
- [ ] Write up the comparison in this vault

## Done when

- The learned policy matches the evolved network's fitness under `EU_STRICT` with fewer violations, on five fixed seeds
- Training progress is visible on the dashboard from [[03 Learning dashboard]]

## What it costs

- The project stops being "no external libraries"
- Training takes minutes to hours in a browser tab and needs tuning
- For three lanes and a handful of vehicles this is more model than the problem needs; the value is in learning it

## Related

Needs [[01 Deterministic simulation]], [[02 Tests and CI]], [[06 Modules and TypeScript]], and benefits from [[07 Performance and Web Worker]].
