---
type: index
tags: [self-driving-car]
---

# Self-driving car notebook

Working notes for the project. One card per implementation, a board that shows where each one stands, and the design work for the new interface.

- [[Board]] — the cards by status
- [[Roadmap]] — the order to build them in, and why
- [[Glossary]] — the words the cards use

## Cards

| # | Card | What it teaches |
|---|------|-----------------|
| 01 | [[01 Deterministic simulation]] | Separation of concerns, reproducibility |
| 02 | [[02 Tests and CI]] | Testing behaviour, continuous integration |
| 03 | [[03 Learning dashboard]] | Measuring, running controlled experiments |
| 04 | [[04 Product controls and explanations]] | Building for a visitor who is not you |
| 05 | [[05 Close the simulation gaps]] | Changing a system without breaking it |
| 06 | [[06 Modules and TypeScript]] | Safe refactoring, types as documentation |
| 07 | [[07 Performance and Web Worker]] | Measure first, then optimise |
| 08 | [[08 Landing interface]] | Visual design, layout systems |
| 09 | [[09 CNN Transformer RL brain]] | Deep reinforcement learning (research) |

## Design

- [[UI Design Spec]] — the direction, tokens, layout and DOM contract of the interface
- [[UI Review of the first design]] — why the first design was replaced

## How to use a card

Each card has the same parts: why it matters, the principle behind it, the tasks as checkboxes, and how to tell it is done. Change `status` in the properties at the top (`todo`, `doing`, `done`, `later`) and move the link on the [[Board]].

New cards start from `Templates/Card`.
