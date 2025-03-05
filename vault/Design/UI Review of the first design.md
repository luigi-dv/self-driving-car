---
type: review
tags: [design, ui, review]
---

# UI review of the first design

Review of the first interface (dark slate, nine outlined tiles, cyan, purple and amber), done with the `ui-ux-review` skill before it was replaced. The replacement is in [[UI Design Spec]].

**The job of this screen:** let a visitor watch the cars learn, change one thing, and see why the car did what it did.

## What was working

- The simulation was on the first screen with pause, step and speed directly under it.
- Changing the network was staged: the consequence was stated before anything restarted.
- Every empty state had a sentence that said when it would fill.
- All of the behaviour. The second design keeps the scripts and replaces only the look.

## Problems, by impact

**Major: nothing was dominant.**
What: the road, the product itself, was a 340px strip with the same border, radius and tone as eight other tiles.
Why it costs: the eye landed on the "Controls" heading and the row of big coloured numbers, not on the cars.
Fix: the road runs edge to edge through the first screen and is the only lit surface on it.

**Major: every group was a bordered card.**
What: nine tiles, each with a 1px outline, a 12px radius and a heading.
Why it costs: when everything is boxed, the boxes stop saying what belongs together, and the page reads as a template.
Fix: no boxes. Groups are made by position on one grid and by a step in tone. Each section has its own composition.

**Major: three accents on twenty elements.**
What: cyan for "now", purple for "learning", amber for "broken", applied to eight readouts, chips, sliders, bars and lines.
Why it costs: the colour code needed a legend the page never gave, and nothing stood out because everything did.
Fix: one accent, amber, meaning lit. Red only for a broken rule.

**Major: controls in three places.**
What: region and brain buttons in a left tile, time under the road, network controls at the bottom of the page inside the model tile.
Why it costs: a visitor who wants to change something has to learn where each kind of change lives.
Fix: what changes the drive (region, time) hangs from the top of the first screen. What changes the learning sits in the learning section, each control next to what it returns.

**Minor: small type.**
What: labels at 12 and 13px throughout, the explanation of what the car is doing in a tile below the fold on a laptop.
Fix: nothing under 13px, running text at 17px or more, and the instruction to the car is a sentence at the second-largest size.
