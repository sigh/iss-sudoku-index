// Title: Killer Sudoku
// Author: Serkan Yurekli
// Video: https://www.youtube.com/watch?v=YEbrTN9zqYI
// Source: https://sudokupad.app/buebtmtd7w

// Normal sudoku rules apply. Digits may not repeat in a cage and must sum to
// the given total. Standard 3x3 box regions (no irregular regions drawn); 16
// killer cages covering 45 of the 81 cells, transcribed from the payload's
// `cages` array.

const cages = [
  new Cage(19, 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R3C1'),
  new Cage(7, 'R3C3', 'R4C2', 'R4C3'),
  new Cage(5, 'R6C2', 'R6C3'),
  new Cage(12, 'R7C1', 'R8C1'),
  new Cage(13, 'R8C2', 'R9C2', 'R9C3'),
  new Cage(22, 'R7C3', 'R7C4', 'R8C4'),
  new Cage(10, 'R2C4', 'R3C4'),
  new Cage(23, 'R2C6', 'R3C6', 'R3C7'),
  new Cage(11, 'R1C7', 'R1C8'),
  new Cage(15, 'R2C8', 'R2C9', 'R3C9'),
  new Cage(21, 'R4C4', 'R4C5', 'R5C4'),
  new Cage(15, 'R5C6', 'R6C5', 'R6C6'),
  new Cage(10, 'R4C7', 'R4C8'),
  new Cage(19, 'R6C7', 'R6C8', 'R7C7'),
  new Cage(16, 'R7C6', 'R8C6'),
  new Cage(18, 'R7C9', 'R8C8', 'R8C9', 'R9C7', 'R9C8'),
];

return [
  new Shape('9x9'),
  ...cages,
];
