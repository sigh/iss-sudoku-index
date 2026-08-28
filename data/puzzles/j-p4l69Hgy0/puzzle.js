// Title: Sudoku Pride
// Author: Unknown
// Video: https://www.youtube.com/watch?v=j-p4l69Hgy0
// Source: https://cracking-the-cryptic.web.app/sudoku/DJ9G8Dpmqq

// Normal sudoku on a 9x9 grid with the standard 3x3 boxes.
// Digits along each thermometer strictly increase from the bulb to the tip
// (Thermo lists cells bulb-first, so the two lines drawn tip-first in the
// payload -- the R1C1 and R1C5 verticals/horizontals -- are reversed below).
// Digits in a cage sum to an unstated total x, common to all six cages; cage
// digits may repeat (the rules explicitly allow this), so cages are encoded
// as an equal-sum constraint only, not as Cage (which would also force
// all-different).
// The six horizontal coloured stripes (row 2 through row 7, columns 2-8) sum
// to a second unstated total, common to all six stripes and stated in the
// rules to differ from the cage total x. That inequality needs no separate
// constraint: with cages sized 3-4 cells and repeats allowed, x is bounded to
// [3, 27]; each 7-cell stripe is a subset of an all-different row, so its
// total is bounded to [28, 42] (7 distinct digits from 1-9). The ranges are
// disjoint, so the stripe total can never equal x -- the "(not x)" in the
// rules is automatically satisfied by the sizes of the two groups and is not
// encoded as an extra constraint.

const cages = [
  ['R1C5', 'R1C6', 'R1C7', 'R1C8'],
  ['R8C2', 'R8C3', 'R8C4', 'R8C5'],
  ['R8C6', 'R8C7', 'R8C8'],
  ['R3C9', 'R4C9', 'R4C8', 'R5C8'],
  ['R4C7', 'R4C6', 'R4C5', 'R4C4'],
  ['R1C2', 'R2C2', 'R2C1'],
];

// Each stripe is one full row's columns 2-8 (row 2 through row 7).
const stripes = [2, 3, 4, 5, 6, 7].map(
  r => [2, 3, 4, 5, 6, 7, 8].map(c => makeCellId(r, c)));

return [
  new Shape('9x9'),

  new Given('R1C8', 5),
  new Given('R2C5', 1),
  new Given('R3C5', 4),
  new Given('R4C4', 2),
  new Given('R5C3', 8),
  new Given('R5C5', 7),
  new Given('R6C6', 5),
  new Given('R8C8', 4),

  new Thermo('R9C4', 'R9C3', 'R9C2', 'R9C1'),
  new Thermo('R9C6', 'R9C7', 'R9C8', 'R9C9'),
  new Thermo('R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1'),
  new Thermo('R1C5', 'R1C6', 'R1C7'),

  new EqualSum(...cages),
  new EqualSum(...stripes),
];
