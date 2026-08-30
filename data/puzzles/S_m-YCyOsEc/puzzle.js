// Title: Picnic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=S_m-YCyOsEc
// Source: https://cracking-the-cryptic.web.app/sudoku/RJFTLHTgDP

// Normal sudoku (9x9, standard boxes). Lines contain ascending digits with
// the lowest digit in the "bulb". Numbers outside the grid give the sum of
// the digits strictly between the 1 and the 9 in that row/column.
//
// The board draws four bulb-and-strokes clusters ("flowers"): a circled
// bulb cell with several straight strokes passing through it. In every
// case the bulb sits at an interior waypoint of the drawn stroke, never at
// an end, so each stroke is read as two independent ascending arms
// radiating out from the shared bulb -- the only reading consistent with
// "lowest in the bulb" when the low point sits mid-stroke. Cell lists are
// transcribed from the payload's `lines` array.

const flowers = [
  // Flower 1, bulb R2C2.
  {
    bulb: 'R2C2',
    arms: [
      ['R1C2'],
      ['R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R9C2'],
      ['R2C1'],
      ['R2C3'],
      ['R1C1'],
      ['R3C3'],
      ['R1C3'],
      ['R3C1'],
    ],
  },
  // Flower 2, bulb R3C8.
  {
    bulb: 'R3C8',
    arms: [
      ['R2C8'],
      ['R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8'],
      ['R3C7'],
      ['R3C9'],
      ['R2C7'],
      ['R4C9'],
      ['R2C9'],
      ['R4C7'],
    ],
  },
  // Flower 3, bulb R5C4.
  {
    bulb: 'R5C4',
    arms: [
      ['R4C4'],
      ['R6C4', 'R7C4', 'R8C4', 'R9C4'],
      ['R5C3'],
      ['R5C5'],
      ['R4C3'],
      ['R6C5'],
      ['R4C5'],
      ['R6C3'],
    ],
  },
  // Flower 4, bulb R8C6.
  {
    bulb: 'R8C6',
    arms: [
      ['R7C6'],
      ['R9C6'],
      ['R8C5'],
      ['R8C7'],
      ['R7C5'],
      ['R9C7'],
      ['R7C7'],
      ['R9C5'],
    ],
  },
];

const thermos = flowers.flatMap(
  ({ bulb, arms }) => arms.map(arm => new Thermo(bulb, ...arm)));

// Sandwich sums: only these five columns and five rows carry a printed
// clue; every other row/column has none drawn.
const geometry = cellGeometry('9x9');
const col = c => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => makeCellId(r, c));
const row = r => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => makeCellId(r, c));
const sandwiches = [
  Sandwich.fromCells(5, col(1), geometry),
  Sandwich.fromCells(13, col(3), geometry),
  Sandwich.fromCells(21, col(5), geometry),
  Sandwich.fromCells(2, col(7), geometry),
  Sandwich.fromCells(7, col(9), geometry),
  Sandwich.fromCells(0, row(2), geometry),
  Sandwich.fromCells(8, row(3), geometry),
  Sandwich.fromCells(21, row(5), geometry),
  Sandwich.fromCells(14, row(7), geometry),
  Sandwich.fromCells(0, row(8), geometry),
];

return [
  new Shape('9x9'),
  ...thermos,
  ...sandwiches,
];
