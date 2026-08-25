// Title: XV Arrow Sudoku
// Author: Jonny Kaufman
// Video: https://www.youtube.com/watch?v=NihN06HpZVo
// Source: https://app.crackingthecryptic.com/sudoku/nB9jfB74nq

// Normal sudoku rules apply on the 9x9 grid (standard 3x3 boxes, no
// givens).
//
// ARROWS (11): digits along the arm sum to the value shown in the arrow's
// bulb; a 2-cell bulb is read left-to-right or top-to-bottom (`PillArrow`
// pill cells given in that order, arm cells after).
//
// X/V MARKS (10): the two adjacent cells on a marked edge sum to 10 (X) or
// 5 (V). "There is no negative constraint" -- unmarked neighbours may also
// sum to 5 or 10, so no StrictXV/exhaustiveness constraint is added.

// Arrow bulb/arm cells, transcribed from the payload's arrow wayPoints and
// the rounded-rectangle (2-cell pill) / plain-circle (1-cell) bulb
// overlays.
const PILL_ARROWS = [
  [['R1C2', 'R1C3'], ['R1C4', 'R1C5', 'R2C5', 'R2C6']],
  [['R1C7', 'R1C8'], ['R2C8', 'R3C7', 'R3C6', 'R4C6', 'R5C6']],
  [['R6C6', 'R6C7'], ['R6C8', 'R6C9']],
  [['R4C2', 'R5C2'], ['R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1']],
  [['R9C3', 'R9C4'], ['R9C5', 'R8C4']],
  [['R7C8', 'R7C9'], ['R7C7', 'R7C6', 'R8C5', 'R7C4']],
  [['R8C7', 'R8C8'], ['R9C8', 'R9C9']],
  [['R2C4', 'R3C4'], ['R3C3', 'R2C3', 'R2C2']],
];

const SINGLE_ARROWS = [
  ['R4C9', ['R5C8', 'R5C7', 'R6C7']],
  ['R6C2', ['R6C3', 'R6C4']],
  ['R9C2', ['R8C2', 'R7C3']],
];

// X (sum-to-10) marker pairs, transcribed from the white "X" edge overlays.
const xPairs = [
  ['R1C2', 'R1C3'],
  ['R1C7', 'R1C8'],
  ['R2C8', 'R3C8'],
  ['R4C9', 'R5C9'],
  ['R8C7', 'R9C7'],
  ['R4C2', 'R5C2'],
];

// V (sum-to-5) marker pairs, transcribed from the white "V" edge overlays.
const vPairs = [
  ['R4C2', 'R4C3'],
  ['R9C3', 'R9C4'],
  ['R8C7', 'R8C8'],
  ['R7C8', 'R7C9'],
];

const pillArrows = PILL_ARROWS.map(
  ([pill, arm]) => new PillArrow(2, ...pill, ...arm));
const singleArrows = SINGLE_ARROWS.map(
  ([bulb, arm]) => new Arrow(bulb, ...arm));

return [
  new Shape('9x9'),
  ...pillArrows,
  ...singleArrows,
  ...xPairs.map(([a, b]) => new X(a, b)),
  ...vPairs.map(([a, b]) => new V(a, b)),
];
