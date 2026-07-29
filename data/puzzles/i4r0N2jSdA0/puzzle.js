// Title: The Escherian Stairwell
// Author: Chris Savvides
// Video: https://www.youtube.com/watch?v=i4r0N2jSdA0
// Source: https://app.crackingthecryptic.com/99NBFBP8gb

// Normal Sudoku rules apply. Arrow arms sum to their circled cells. On each
// dashed-square staircase, clockwise successors increase, except 9 is followed by 1.
const outerStaircase = [
  'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8',
  'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8',
  'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R8C2',
  'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C2',
];
const innerStaircase = [
  'R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6', 'R6C5', 'R6C4', 'R5C4', 'R4C4',
];

// The ordered cells come from the two concentric dashed-square perimeters.
const stairKey = Pair.fnToKey((digit, next) =>
  digit === 9 ? next === 1 : next > digit, 9);
const staircases = [outerStaircase, innerStaircase]
  .map(cells => new Pair(stairKey, 'clockwise staircase', ...cells));

return [
  new Shape('9x9'),
  new Arrow('R1C5', 'R2C5', 'R2C6', 'R2C7', 'R3C7'),
  new Arrow('R1C7', 'R1C8', 'R1C9'),
  new Arrow('R4C7', 'R5C7', 'R5C8'),
  new Arrow('R5C5', 'R5C4', 'R6C4', 'R6C3', 'R5C3'),
  new Arrow('R4C1', 'R4C2', 'R3C2', 'R3C1'),
  new Arrow('R8C2', 'R9C2', 'R9C1', 'R8C1'),
  new Arrow('R8C7', 'R8C6', 'R8C5', 'R9C5'),
  ...staircases,
];
