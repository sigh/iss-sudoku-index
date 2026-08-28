// Title: 2022 Sudoku
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=yXLX4Q1k2Qw
// Source: https://tinyurl.com/2p8a6bwz

// Normal sudoku rules apply. No given digits. Eight thermometers (digits
// strictly increase from the bulb) are drawn as four bulb-sharing pairs;
// three of the pairs trace an identical diamond-loop-plus-bar shape reading
// as the digit "2", and the rules name those three as exact clones of each
// other -- the same digit at each corresponding
// position (including the shared bulb) in all three. White dots mark some
// (not all) consecutive-digit adjacent pairs; an unmarked adjacent pair is
// unconstrained.

// Pair A: bulb R9C4, diamond arm R8C5-R7C6-R6C5-R7C4, bar arm R9C5-R9C6.
// Pair C: bulb R4C1, diamond arm R3C2-R2C3-R1C2-R2C1, bar arm R4C2-R4C3.
// Pair D: bulb R8C7, diamond arm R7C8-R6C9-R5C8-R6C7, bar arm R8C8-R8C9.
// All three share the same walk-order relative geometry -- this is what
// makes them the "2" shape and lets the clone rule pin them position-by-
// position. Pair B (bulb R2C5, thermos R2C5-R1C5-R1C6-R1C7-R2C7-R3C7-R4C7
// and R2C5-R3C5-R4C5-R4C6) traces a different, rectangle-outline shape (the
// "0") and is not named as a clone.
const thermos = [
  ['R9C4', 'R8C5', 'R7C6', 'R6C5', 'R7C4'],
  ['R9C4', 'R9C5', 'R9C6'],
  ['R2C5', 'R1C5', 'R1C6', 'R1C7', 'R2C7', 'R3C7', 'R4C7'],
  ['R2C5', 'R3C5', 'R4C5', 'R4C6'],
  ['R4C1', 'R3C2', 'R2C3', 'R1C2', 'R2C1'],
  ['R8C7', 'R7C8', 'R6C9', 'R5C8', 'R6C7'],
  ['R8C7', 'R8C8', 'R8C9'],
  ['R4C1', 'R4C2', 'R4C3'],
];

// Dots: R4C5-R4C6, R4C6-R4C7, R8C3-R9C3, R8C6-R8C7.
const whiteDots = [
  ['R4C5', 'R4C6'],
  ['R4C6', 'R4C7'],
  ['R8C3', 'R9C3'],
  ['R8C6', 'R8C7'],
];

// The clone set: for each pair, position 0 is the shared bulb, 1-4 the
// diamond arm (bulb to tip), 5-6 the bar arm (bulb to tip); all three pairs
// walk the same shared relative-offset geometry, so index i is the same
// relative position in each.
const cloneA = ['R9C4', 'R8C5', 'R7C6', 'R6C5', 'R7C4', 'R9C5', 'R9C6'];
const cloneC = ['R4C1', 'R3C2', 'R2C3', 'R1C2', 'R2C1', 'R4C2', 'R4C3'];
const cloneD = ['R8C7', 'R7C8', 'R6C9', 'R5C8', 'R6C7', 'R8C8', 'R8C9'];

// Cell-wise clone: SameValues(2, a, b) per corresponding pair, chained
// A-C and C-D at each position (transitively forces A=C=D).
const cloneConstraints = cloneA.flatMap((_, i) => [
  new SameValues(2, cloneA[i], cloneC[i]),
  new SameValues(2, cloneC[i], cloneD[i]),
]);

return [
  new Shape('9x9'),
  ...thermos.map((cells) => new Thermo(...cells)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...cloneConstraints,
];
