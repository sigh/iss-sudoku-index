// Title: Hidden keys
// Author: sujoyku
// Video: https://www.youtube.com/watch?v=NRFJZJiPaJg
// Source: https://app.crackingthecryptic.com/sudoku/7gd8qFNRdd

// Rules encoded: normal sudoku (default row/column/box all-different, the
// payload's regions are the ordinary 9-box partition); 12 killer cages, no
// repeats within a cage, summing to the value at the cage's top-left cell;
// both marked diagonals (main and anti) no-repeat.

// Cages, cited from the payload's `cages` array (each entry's first listed
// cell is its printed top-left total).
const cages = [
  new Cage(33, 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'),
  new Cage(17, 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'),
  new Cage(32, 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'),
  new Cage(15, 'R7C8', 'R8C8'),
  new Cage(14, 'R2C2', 'R3C2'),
  new Cage(25, 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'),
  new Cage(6, 'R2C4', 'R2C5'),
  new Cage(10, 'R2C6', 'R3C6'),
  new Cage(11, 'R8C5', 'R8C6'),
  new Cage(9, 'R7C4', 'R8C4'),
  new Cage(10, 'R4C2', 'R4C3'),
  new Cage(8, 'R4C7', 'R5C7'),
];

return [
  new Shape('9x9'),
  ...cages,
  new Diagonal(-1),
  new Diagonal(1),
];
