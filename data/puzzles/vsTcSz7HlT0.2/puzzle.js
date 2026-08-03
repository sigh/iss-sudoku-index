// Title: 7/30/2023: The Prime of Life
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=vsTcSz7HlT0
// Source: https://tinyurl.com/2vvw7njv

// Normal sudoku rules apply. Killer: digits in a cage cannot repeat and must
// sum to the cage's total. All 12 cages are two cells, drawn with no overlap
// and no uncaged single-cell totals.

const givens = [
  new Given('R1C6', 4),
  new Given('R3C4', 6),
  new Given('R4C4', 3),
  new Given('R4C6', 1),
  new Given('R6C4', 9),
  new Given('R6C6', 7),
  new Given('R7C6', 2),
  new Given('R9C4', 8),
];

const cages = [
  new Cage(3, 'R2C3', 'R2C4'),
  new Cage(7, 'R2C6', 'R2C7'),
  new Cage(17, 'R3C2', 'R4C2'),
  new Cage(13, 'R6C2', 'R7C2'),
  new Cage(4, 'R8C3', 'R8C4'),
  new Cage(8, 'R8C6', 'R8C7'),
  new Cage(12, 'R6C8', 'R7C8'),
  new Cage(16, 'R3C8', 'R4C8'),
  new Cage(14, 'R3C5', 'R4C5'),
  new Cage(6, 'R6C5', 'R7C5'),
  new Cage(6, 'R5C3', 'R5C4'),
  new Cage(14, 'R5C6', 'R5C7'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
];
