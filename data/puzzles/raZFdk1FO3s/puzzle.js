// Title: Tunnel Vision
// Author: Dying Flutchman
// Video: https://www.youtube.com/watch?v=raZFdk1FO3s
// Source: https://app.crackingthecryptic.com/webapp/8mBqB7QLbP
//
// Standard sudoku rules apply (default 3x3 box regions). Killer cages: digits
// in a cage are distinct and sum to the printed total. Arrows: digits along
// the arrow (excluding the bulb) sum to the digit in the bulb cell -- every
// arrow here is a straight 3-cell arrow (bulb + 2 shaft cells).

const givens = [
  new Given('R2C9', 4),
  new Given('R3C3', 4),
  new Given('R7C3', 3),
  new Given('R7C7', 2),
  new Given('R9C1', 2),
  new Given('R9C8', 3),
];

// Killer cages, cells from the payload's `cages` array.
const cages = [
  new Cage(20, 'R3C4', 'R3C5', 'R3C6'),
  new Cage(8, 'R4C3', 'R5C3', 'R6C3'),
  new Cage(15, 'R4C7', 'R5C7', 'R6C7'),
  new Cage(10, 'R7C4', 'R7C5', 'R7C6'),
];

// Arrows: bulb cell first, then the shaft cells, per the drawn `wayPoints`
// (the payload's empty-circle overlay confirms each bulb cell).
const arrows = [
  ['R2C2', 'R3C3', 'R4C4'],
  ['R2C5', 'R3C5', 'R4C5'],
  ['R2C8', 'R3C7', 'R4C6'],
  ['R5C8', 'R5C7', 'R5C6'],
  ['R8C8', 'R7C7', 'R6C6'],
  ['R8C5', 'R7C5', 'R6C5'],
  ['R8C2', 'R7C3', 'R6C4'],
  ['R5C2', 'R5C3', 'R5C4'],
  ['R7C9', 'R8C9', 'R9C9'],
].map(cells => new Arrow(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
  ...arrows,
];
