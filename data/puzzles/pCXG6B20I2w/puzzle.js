// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=pCXG6B20I2w
// Source: https://app.crackingthecryptic.com/bH8FJtL3F3

// Normal sudoku rules apply. Killer cage digits sum to the clue and cannot repeat.

// The 29 drawn cage cell-groups partition all 81 grid cells exactly once, so
// their totals must sum to 405 (9 rows x (1+...+9)) for any valid completion.
// As printed they sum to 406, and this cage's printed total of 19 is the one
// that cannot hold for any valid grid: only its no-repeat requirement is
// encoded below, and its total is not enforced.

return [
  new Cage(34, 'R1C1', 'R1C2', 'R2C1', 'R2C2', 'R2C3', 'R3C2'),
  new Cage('', 'R1C3', 'R1C4', 'R2C4'),
  new Cage(13, 'R1C5', 'R1C6', 'R2C5'),
  new Cage(13, 'R1C7', 'R2C6', 'R2C7'),
  new Cage(4, 'R1C8', 'R1C9'),
  new Cage(17, 'R2C8', 'R2C9'),
  new Cage(3, 'R3C1', 'R4C1'),
  new Cage(16, 'R3C3', 'R3C4', 'R3C5'),
  new Cage(18, 'R3C6', 'R3C7', 'R4C7', 'R4C8'),
  new Cage(6, 'R3C8', 'R3C9'),
  new Cage(12, 'R4C2', 'R4C3'),
  new Cage(11, 'R4C4', 'R5C4'),
  new Cage(19, 'R4C5', 'R4C6', 'R5C5', 'R6C4', 'R6C5'),
  new Cage(15, 'R5C6', 'R6C6'),
  new Cage(9, 'R5C7', 'R5C8'),
  new Cage(14, 'R6C7', 'R6C8'),
  new Cage(14, 'R4C9', 'R5C9'),
  new Cage(10, 'R6C9', 'R7C9'),
  new Cage(12, 'R5C1', 'R6C1'),
  new Cage(10, 'R5C2', 'R5C3'),
  new Cage(17, 'R6C2', 'R6C3', 'R7C3', 'R7C4'),
  new Cage(16, 'R7C5', 'R7C6', 'R7C7'),
  new Cage(10, 'R7C1', 'R7C2'),
  new Cage(13, 'R8C1', 'R8C2'),
  new Cage(8, 'R9C1', 'R9C2'),
  new Cage(13, 'R8C3', 'R8C4', 'R9C3'),
  new Cage(20, 'R8C5', 'R9C4', 'R9C5'),
  new Cage(11, 'R8C6', 'R9C6', 'R9C7'),
  new Cage(29, 'R7C8', 'R8C7', 'R8C8', 'R8C9', 'R9C8', 'R9C9'),
];
