#Legend in the Mist — Tag & Status Color Override

This module overrides the tag and status colors in the Legend in the Mist Foundry system so that they are consistent with the colors used in the official books.

By default, the system colors both tags and statuses based on wether or not they are positive/negative.
This override instead follows the core game convention:
	•	Tags are always yellow
	•	Statuses are always green

The change is purely visual and does not alter mechanics or data.

⸻

What It Fixes

Different parts of the UI render Tags and Statuses inconsistently.
In several places, statuses are actually output as plain .tag elements with a tier suffix, which makes them impossible to style correctly using CSS alone.

This module:
	1.	Applies a consistent color palette via CSS.
	2.	Adds a small client-side script that identifies tiered entries (e.g. -2, +2, or a tier shown on a new line) and marks them as statuses so they can be styled correctly.
