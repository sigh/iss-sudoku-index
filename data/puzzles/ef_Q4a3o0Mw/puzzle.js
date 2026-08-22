// Title: Fairy Rings
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=ef_Q4a3o0Mw
// Source: https://app.crackingthecryptic.com/sudoku/Hg6jH2L9fb
//
// Standard sudoku (rows, columns, boxes). Both main diagonals are
// all-different. Cages sum to the corner total, with distinct digits.
// Each corner thermometer loops around the four cells of that corner's
// 2x2 box, bulb at the outer corner; digits strictly increase along the
// drawn order. The shaded circle under each bulb is decorative, matching
// the drawn bulb cell -- not encoded separately.

const cages = [
  [['R1C4', 'R1C5', 'R1C6'], 9],
  [['R4C1', 'R5C1', 'R6C1'], 13],
  [['R4C9', 'R5C9', 'R6C9'], 8],
  [['R9C4', 'R9C5', 'R9C6'], 11],
  [['R4C4', 'R5C4'], 8],
  [['R4C6', 'R5C6'], 12],
];

// Corner thermometers, drawn order = bulb first (increasing thereafter).
const thermos = [
  ['R1C1', 'R2C2', 'R2C1', 'R1C2'],
  ['R1C9', 'R2C8', 'R2C9', 'R1C8'],
  ['R9C1', 'R8C2', 'R8C1', 'R9C2'],
  ['R9C9', 'R9C8', 'R8C9', 'R8C8'],
];

return [
  new Shape('9x9'),

  // Digits may not repeat along either main diagonal (marked in blue).
  new Diagonal(-1),
  new Diagonal(1),

  ...cages.map(([cells, sum]) => new Cage(sum, ...cells)),

  ...thermos.map(cells => new Thermo(...cells)),
];
