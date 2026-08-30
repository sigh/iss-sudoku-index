// Title: A Killer Sudoku To Test The Best
// Author: Andrew Reid
// Video: https://www.youtube.com/watch?v=hKlNNIJ2cvw
// Source: https://cracking-the-cryptic.web.app/sudoku/D93Mr6m2mJ

// Standard 9x9 sudoku (rows, columns, boxes each contain 1-9 once) with 24
// killer cages that exactly partition the grid (distinct digits per cage,
// summing to the printed total). The payload carries no rules text; the
// cages are the puzzle's only clue geometry.

// Cages: cells and totals from the payload's `cages` array.
const cages = [
  new Cage(21, 'R1C1', 'R1C2', 'R1C3', 'R1C4'),
  new Cage(8, 'R1C5', 'R1C6'),
  new Cage(19, 'R1C7', 'R1C8', 'R2C6', 'R2C7'),
  new Cage(8, 'R1C9', 'R2C9'),
  new Cage(17, 'R2C1', 'R3C1', 'R4C1'),
  new Cage(16, 'R2C2', 'R2C3', 'R3C2'),
  new Cage(16, 'R2C4', 'R2C5', 'R3C4', 'R3C5'),
  new Cage(26, 'R2C8', 'R3C7', 'R3C8', 'R3C9'),
  new Cage(20, 'R3C3', 'R4C3', 'R4C4', 'R4C5'),
  new Cage(10, 'R3C6', 'R4C6', 'R5C5', 'R5C6'),
  new Cage(20, 'R4C2', 'R5C1', 'R5C2', 'R6C1'),
  new Cage(12, 'R4C7', 'R4C8', 'R5C7'),
  new Cage(24, 'R4C9', 'R5C8', 'R5C9'),
  new Cage(9, 'R5C3', 'R5C4'),
  new Cage(25, 'R6C2', 'R7C1', 'R7C2', 'R7C3', 'R8C2'),
  new Cage(31, 'R6C3', 'R6C4', 'R7C4', 'R8C3', 'R8C4'),
  new Cage(13, 'R6C5', 'R6C6'),
  new Cage(11, 'R6C7', 'R7C7'),
  new Cage(12, 'R6C8', 'R6C9', 'R7C9'),
  new Cage(29, 'R7C5', 'R7C6', 'R8C5', 'R8C6', 'R8C7'),
  new Cage(6, 'R7C8', 'R8C8', 'R8C9'),
  new Cage(12, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(15, 'R9C3', 'R9C4', 'R9C5'),
  new Cage(25, 'R9C6', 'R9C7', 'R9C8', 'R9C9'),
];

return [
  new Shape('9x9'),

  ...cages,
];
