---
type: card
status: todo
priority: 4
effort: L
depends_on: ["02 Tests and CI"]
tags: [card, architecture, tooling]
---

# 06 Modules and TypeScript

## Why

Forty-odd script tags share one global scope and only work in the order `index.html` lists them. A misspelt key in a policy profile is found when a car drives oddly, not when the file is saved.

## The principle

**Refactor behind tests, in steps that each leave the project working.** Types are not about catching typos; they are documentation the compiler checks. A typed `PolicyProfile` says exactly what a region may contain, and a typed `Directive` says what a rule may change.

## Tasks

Step 1, modules (plain JavaScript):

- [ ] Add Vite, move `index.html` to load one `src/main.js` as a module
- [ ] Turn every file into an ES module with explicit `import` and `export`
- [ ] Replace the self-registration of rules and scenarios with one explicit list each
- [ ] Replace the `onclick=""` attributes with listeners
- [ ] All tests green, behaviour unchanged

Step 2, types:

- [ ] Rename to `.ts` one folder at a time, starting from the leaves (`utils`, `settings`, `policy/profile`)
- [ ] Types for `PolicyProfile` (a union per `mode`), `Directive`, `Signals`, `BrainRecord`, `Scenario`
- [ ] `strict: true` once every file is converted
- [ ] Type check in CI

## Done when

- `npm run dev` starts the page, `npm run build` gives a static folder that can be deployed
- No file relies on a global
- A wrong value in `policies.ts` (for example `mode:"STRICT"`) fails the build

## Files

Everything under `src/`, `index.html`, new `package.json`, `vite.config.ts`, `tsconfig.json`

## Risks

- The page no longer opens from disk; it needs `npm run dev` or a build. Say so in the README.
- Doing modules and types in one step makes any breakage hard to find. Keep them as two separate pieces of work.

## Related

Needs [[02 Tests and CI]]. Required by [[09 CNN Transformer RL brain]].
