// Title: Uncertainty
// Author: Sam
// Video: https://www.youtube.com/watch?v=VhC3CDrll_E
// Source: https://cracking-the-cryptic.web.app/sudoku/JpNr9JHbGN

// Normal sudoku rules apply; the payload's `regions` are the standard 3x3
// boxes, so no explicit region override is needed. Eight arrows share one
// circle at R5C5 and each run 3 cells outward in one compass/diagonal
// direction (payload `arrows`, one entry per direction). The payload carries
// no rules-panel text; the only available rule sentence is the video
// description: "You have to decide if the arrows show sums or averages."
// Encoded as: each arrow's circled digit independently equals either the
// sum of its 3 arm digits, or their average (mean) -- one choice per arrow.
// A single global choice covering all 8 arrows at once was tried first and
// found unsatisfiable (an exhausted search returned zero solutions), which
// refutes it since the puzzle has a solution; this per-arrow reading is the
// remaining candidate.

const BULB = 'R5C5';

// One arm per drawn arrow direction, ordered outward from the bulb; each
// entry's cell list is the 3 non-bulb arm cells, as drawn by the puzzle's
// arrows.
const ARMS = [
  ['R4C5', 'R3C5', 'R2C5'], // up
  ['R6C5', 'R7C5', 'R8C5'], // down
  ['R4C6', 'R3C7', 'R2C8'], // up-right
  ['R6C6', 'R7C7', 'R8C8'], // down-right
  ['R6C4', 'R7C3', 'R8C2'], // down-left
  ['R4C4', 'R3C3', 'R2C2'], // up-left
  ['R5C4', 'R5C3', 'R5C2'], // left
  ['R5C6', 'R5C7', 'R5C8'], // right
];

// Per arm: bulb = arm1+arm2+arm3 (built-in Arrow semantics) OR bulb is the
// mean of the arm, i.e. arm1+arm2+arm3 - 3*bulb = 0 (Sum's coefficient form;
// Arrow itself has no averaging mode).
const armReadings = ARMS.map(arm => new Or([
  new Arrow(BULB, ...arm),
  new Sum(0, [BULB, -3], ...arm),
]));

return [
  new Shape('9x9'),
  new Given('R1C3', 9),
  new Given('R2C4', 2),
  new Given('R3C4', 1),
  new Given('R3C9', 7),
  new Given('R4C7', 1),
  new Given('R4C8', 9),
  new Given('R6C2', 9),
  new Given('R6C3', 8),
  new Given('R7C1', 7),
  new Given('R7C6', 8),
  new Given('R8C6', 2),
  new Given('R9C7', 9),
  ...armReadings,
];
