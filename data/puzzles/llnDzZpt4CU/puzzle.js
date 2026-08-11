// Title: X Gon' Give It 2 Ya
// Author: DadJokes
// Video: https://www.youtube.com/watch?v=llnDzZpt4CU
// Source: https://app.crackingthecryptic.com/sudoku/Mt2dQDL2BQ

// Standard Sudoku is implicit (default 3x3 boxes). Both long diagonals are
// all-different, per the rules text and the two drawn diagonal strokes.
// Every cage sums to its printed total with no repeated digit inside it.
const cages = [
  new Cage(6, 'R1C2', 'R2C2', 'R2C1'),
  new Cage(19, 'R2C3', 'R3C3', 'R3C2'),
  new Cage(9, 'R3C4', 'R4C4', 'R4C3'),
  new Cage(17, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(16, 'R2C7', 'R2C8', 'R3C8'),
  new Cage(15, 'R3C6', 'R3C7', 'R4C7'),
  new Cage(14, 'R4C5', 'R4C6', 'R5C6'),
  new Cage(13, 'R5C4', 'R5C5', 'R6C5'),
  new Cage(12, 'R6C3', 'R6C4', 'R7C4'),
  new Cage(11, 'R7C2', 'R7C3', 'R8C3'),
  new Cage(10, 'R8C1', 'R8C2', 'R9C2'),
  new Cage(7, 'R7C6', 'R6C6', 'R6C7'),
  new Cage(22, 'R8C7', 'R7C7', 'R7C8'),
  new Cage(8, 'R8C9', 'R8C8', 'R9C8'),
];

return [
  new Shape('9x9'),
  new Given('R5C8', 2),
  new Diagonal(1),
  new Diagonal(-1),
  ...cages,
];
