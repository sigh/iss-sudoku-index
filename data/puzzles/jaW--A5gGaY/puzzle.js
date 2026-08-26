// Title: Missing Shoes - Nala!?
// Author: Sandra & Nala
// Video: https://www.youtube.com/watch?v=jaW--A5gGaY
// Source: https://tinyurl.com/2mxpjrdx

// Rules:
// Normal sudoku rules apply.
// Double arrow: the sum of the digits along the line equals the sum of the
// digits in the circles at its two ends (DoubleArrow's first/last cell are
// the circles). Each drawn colour is used by only one double arrow here, so
// no cross-line merging is needed.
// Killer cages: digits sum to the given total (if any) and cannot repeat.
// Each colour is used by only one cage here, so no cross-cage merging is
// needed. A cage with no printed total is still all-different (Cage
// requires a sum, so those are encoded as AllDifferent).
// Fog and the shoe-emoji reveal are solving UI / flavour, not final-grid
// rules.

const doubleArrow1 = ['R3C3', 'R4C2', 'R4C1', 'R3C2', 'R2C2'];
const doubleArrow2 = ['R5C5', 'R5C6', 'R4C6', 'R3C7'];
const doubleArrow3 = ['R2C5', 'R3C6', 'R4C5', 'R5C4', 'R6C4', 'R7C4', 'R7C3', 'R8C4'];
const doubleArrow4 = ['R9C7', 'R8C7', 'R8C8', 'R7C9', 'R6C8', 'R5C9', 'R5C8'];
const doubleArrow5 = ['R5C3', 'R5C2', 'R6C2', 'R6C3', 'R7C2'];
const doubleArrow6 = ['R7C1', 'R8C1', 'R9C2', 'R9C3'];

const noTotalCage1 = ['R1C3', 'R1C4', 'R1C5', 'R2C5', 'R2C6', 'R3C6', 'R4C5', 'R4C6', 'R5C5'];
const noTotalCage2 = ['R1C7', 'R2C7', 'R3C7', 'R4C7', 'R5C7', 'R6C5', 'R6C6', 'R6C7', 'R7C5'];

return [
  new Shape('9x9'),

  new DoubleArrow(...doubleArrow1),
  new DoubleArrow(...doubleArrow2),
  new DoubleArrow(...doubleArrow3),
  new DoubleArrow(...doubleArrow4),
  new DoubleArrow(...doubleArrow5),
  new DoubleArrow(...doubleArrow6),

  new Cage(22, 'R5C2', 'R5C4', 'R6C2', 'R6C3', 'R6C4'),
  new AllDifferent(...noTotalCage1),
  new AllDifferent(...noTotalCage2),
  new Cage(6, 'R3C3', 'R3C4', 'R4C3'),
  new Cage(8, 'R1C2', 'R2C1', 'R2C2'),
  new Cage(13, 'R8C3', 'R9C2', 'R9C3'),
];
