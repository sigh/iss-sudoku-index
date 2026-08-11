// Title: 315 XV Killers
// Author: Piksil
// Video: https://www.youtube.com/watch?v=h_B9RiCDtKg
// Source: https://app.crackingthecryptic.com/sudoku/D3hQMTtf2G

// Normal sudoku rules, standard 3x3 boxes.
//
// Killer cages: digits in a cage do not repeat and sum to the given total.
// Each cage here has 9 cells and totals 45, matching what 9 distinct 1-9
// digits must sum to; 18 of the 81 cells belong to no cage.
//
// XV: digits joined by X sum to 10; digits joined by V sum to 5. Not all
// X/V pairs are necessarily marked, so no negative inference is encoded for
// unmarked adjacent cells.

const cages = [
  [45, 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C2', 'R2C3', 'R3C2', 'R3C3', 'R4C2'],
  [45, 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R6C2', 'R7C2', 'R8C2', 'R8C3'],
  [45, 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R6C5', 'R7C5', 'R8C5', 'R9C5', 'R7C6'],
  [45, 'R1C5', 'R2C5', 'R3C4', 'R3C5', 'R2C6', 'R3C6', 'R4C5', 'R4C6', 'R5C5'],
  [45, 'R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C8', 'R3C9', 'R4C9'],
  [45, 'R4C7', 'R4C8', 'R5C6', 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R6C8', 'R6C9'],
  [45, 'R7C7', 'R8C6', 'R8C7', 'R8C8', 'R8C9', 'R7C9', 'R9C7', 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),

  new Given('R2C1', 3),
  new Given('R4C2', 1),
  new Given('R7C4', 5),

  // Killer cages (7 nine-cell cages, each a 1-9 permutation).
  ...cages.map((cells) => new Cage(...cells)),

  // XV pairs.
  new X('R1C1', 'R2C1'),
  new X('R1C2', 'R1C3'),
  new X('R4C1', 'R5C1'),
  new X('R2C5', 'R2C6'),
  new X('R5C5', 'R5C6'),
  new X('R4C8', 'R5C8'),
  new X('R1C8', 'R1C9'),
  new X('R7C8', 'R7C9'),
  new X('R9C5', 'R9C6'),

  new V('R7C2', 'R8C2'),
  new V('R8C3', 'R8C4'),
  new V('R8C4', 'R9C4'),
  new V('R6C6', 'R6C7'),
  new V('R6C7', 'R7C7'),
];
