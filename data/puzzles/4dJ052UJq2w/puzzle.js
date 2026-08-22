// Title: Yes, The Clever Equation
// Author: SSG
// Video: https://www.youtube.com/watch?v=4dJ052UJq2w
// Source: https://app.crackingthecryptic.com/sudoku/FmD4JTL79p

// Normal sudoku rules apply. Digits cannot repeat within a cage (two 9-cell
// no-total cages, encoded as AllDifferent). Digits along an arrow sum to the
// digit in that arrow's circle.
//
// The R3C9-circled arrow is drawn as one stroke that forks at R4C8 into two
// tails (R4C8-R5C8-R6C8 and R4C8-R4C7): R4C8 is an interior cell of one
// arrow's payload path and the sole waypoint start of the other, i.e. a
// T-junction, not two independent bulbs. Both tails share R3C9 as their
// bulb and both include the stem cell R4C8 in their own sum, so it is
// encoded as two Arrow constraints on the same bulb.
const arrows = [
  ['R2C2', 'R3C3', 'R4C4'],
  ['R2C6', 'R2C7', 'R1C7'],
  ['R3C9', 'R4C8', 'R5C8', 'R6C8'],
  ['R3C9', 'R4C8', 'R4C7'],
  ['R9C9', 'R8C8', 'R7C8'],
  ['R8C5', 'R9C5', 'R9C6'],
  ['R9C3', 'R8C4', 'R7C4'],
  ['R7C2', 'R6C2', 'R6C3'],
  ['R9C2', 'R8C1', 'R7C1'],
  ['R6C6', 'R5C5', 'R4C5', 'R5C4'],
];
const cages = [
  ['R2C4', 'R3C4', 'R3C5', 'R2C5', 'R4C3', 'R5C3', 'R5C2', 'R4C2', 'R4C4'],
  ['R7C5', 'R8C5', 'R8C6', 'R7C6', 'R7C7', 'R6C7', 'R5C7', 'R5C8', 'R6C8'],
];
return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...cages.map(cells => new AllDifferent(...cells)),
];
