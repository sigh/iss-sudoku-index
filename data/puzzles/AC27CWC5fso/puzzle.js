// Title: unknown
// Author: Alden Martin
// Video: https://www.youtube.com/watch?v=AC27CWC5fso
// Source: https://cracking-the-cryptic.web.app/sudoku/Q9DP6q2Qhd

// Normal sudoku rules (standard 9x9, default row/column/box groups). Three
// givens. Thermometers: digits increase from the bulb to the tip(s).
// Sandwich: the clue outside a row/column is the sum of digits strictly
// between the 1 and the 9 in that lane.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

const givens = [
  new Given('R5C9', 3),
  new Given('R7C6', 3),
  new Given('R8C2', 4),
];

// Thermo A: bulb R5C5 (grey circle underlay), single stroke to R3C8.
const thermoA = new Thermo(
  'R5C5', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R3C8');

// Thermo B: bulb R9C9, single stroke to R8C9.
const thermoB = new Thermo('R9C9', 'R8C9');

// Thermo C: a single bulb at R6C2 (the only other grey circle underlay)
// feeding a branching figure. The raw payload draws it as three strokes --
// R6C2-R6C3-R6C4, R7C4-R6C4-R5C4, and R5C3-R5C4 -- where R6C4 is a T-junction
// (lines[2]'s end meets the interior of the R7C4-R6C4-R5C4 stroke) and R5C4
// is an end-to-end bend into R5C3, not a further junction. So the tree is
// rooted at R6C2 with a fork at R6C4 into two tips (R7C4, and R5C4-R5C3).
// One Thermo per bulb-to-tip arm enforces "increase from the bulb" along
// every branch.
const thermoC = [
  new Thermo('R6C2', 'R6C3', 'R6C4', 'R7C4'),
  new Thermo('R6C2', 'R6C3', 'R6C4', 'R5C4', 'R5C3'),
];

// Sandwich clues, printed lane totals from the outside-clue overlays.
const rowSandwiches = [
  Sandwich.fromCells(10, graph.row(2), geometry),
  Sandwich.fromCells(29, graph.row(3), geometry),
  Sandwich.fromCells(13, graph.row(5), geometry),
  Sandwich.fromCells(24, graph.row(6), geometry),
  Sandwich.fromCells(17, graph.row(7), geometry),
];

const colSandwiches = [
  Sandwich.fromCells(2, graph.column(5), geometry),
  Sandwich.fromCells(0, graph.column(6), geometry),
  Sandwich.fromCells(33, graph.column(7), geometry),
  Sandwich.fromCells(4, graph.column(8), geometry),
];

return [
  new Shape('9x9'),
  ...givens,
  thermoA,
  thermoB,
  ...thermoC,
  ...rowSandwiches,
  ...colSandwiches,
];
