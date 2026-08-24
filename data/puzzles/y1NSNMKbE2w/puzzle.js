// Title: Rainbow Horse
// Author: Peter Veenis
// Video: https://www.youtube.com/watch?v=y1NSNMKbE2w
// Source: https://app.crackingthecryptic.com/sudoku/BPBmFL4nfq

// Normal sudoku rules apply (standard 3x3 boxes, per the payload's `regions`).
// No givens are present in the payload.
// "There are no negative constraints": the rules disclaim any global negative
// dot/thermo/arrow/palindrome constraint, so only the drawn marks below are
// encoded -- unmarked cell pairs carry no relation.

// Killer cages: digits sum to the top-left total; no repeated digit in a cage
// (Cage enforces both), per `cages[]`.
const cages = [
  [11, 'R2C2', 'R2C1', 'R3C1'],
  [28, 'R1C1', 'R1C2', 'R1C3', 'R2C3'],
  [18, 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R2C8'],
];

// Thermometers: 5 short 2-cell thermos, bulb cell first, strictly increasing
// from the bulb, per `lines[0..4]` (grey, bulb = first waypoint's cell).
const thermos = [
  ['R6C1', 'R7C1'],
  ['R5C2', 'R6C2'],
  ['R4C3', 'R5C3'],
  ['R3C4', 'R4C4'],
  ['R6C8', 'R5C7'],
];

// Palindrome (green line, `lines[5]`), 17 cells: reads the same forwards and
// backwards, AND (per rules text) each different digit 1-9 must appear at
// least once along it.
const palindromeCells = [
  'R6C1', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C5', 'R2C6', 'R3C7', 'R4C8',
  'R5C9', 'R6C8', 'R6C7', 'R5C6', 'R5C5', 'R6C5', 'R7C6', 'R8C6',
];

// Arrows: two circles, each with 3 independent 2-cell arms (`arrows[]`
// entries sharing a bulb cell). Each arm's digits sum to its own circle.
const arrows = [
  ['R9C2', 'R9C1', 'R8C1'],
  ['R9C2', 'R8C2', 'R7C2'],
  ['R9C2', 'R9C3', 'R8C3'],
  ['R9C8', 'R9C7', 'R8C7'],
  ['R9C8', 'R9C9', 'R8C9'],
  ['R9C8', 'R8C8', 'R7C8'],
];

// White Kropki dots (difference 1), from `overlays[]` white rounded edge marks.
const whiteDots = [
  ['R1C1', 'R1C2'], ['R2C1', 'R2C2'], ['R1C7', 'R1C8'], ['R1C9', 'R2C9'],
  ['R2C8', 'R2C9'], ['R2C7', 'R3C7'], ['R3C8', 'R4C8'], ['R3C9', 'R4C9'],
  ['R7C9', 'R8C9'], ['R8C7', 'R9C7'], ['R8C1', 'R9C1'],
];

// Black Kropki dot (ratio 2), from the single black rounded edge overlay.
const blackDots = [
  ['R3C5', 'R3C6'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...thermos.map(cells => new Thermo(...cells)),
  new Palindrome(...palindromeCells),
  new ContainAtLeast('1,2,3,4,5,6,7,8,9', ...palindromeCells),
  ...arrows.map(cells => new Arrow(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
