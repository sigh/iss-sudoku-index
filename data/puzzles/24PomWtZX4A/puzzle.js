// Title: unknown
// Author: Clover
// Video: https://www.youtube.com/watch?v=24PomWtZX4A
// Source: https://app.crackingthecryptic.com/sudoku/T6BLmj2GQ9

// Normal sudoku rules apply. Digits in cages, which include no repeats,
// add up to the sum given (video description). Cage cell lists and totals
// are transcribed from the payload's `cages` array.

return [
  new Shape('9x9'),

  new Cage(28, 'R1C2', 'R1C3', 'R1C4', 'R1C5'),
  new Cage(14, 'R1C1', 'R2C1'),
  new Cage(14, 'R3C1', 'R4C1'),
  new Cage(33, 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3'),
  new Cage(17, 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5'),
  new Cage(23, 'R3C7', 'R4C6', 'R4C7'),
  new Cage(12, 'R2C9', 'R3C9', 'R4C9', 'R5C9'),
  new Cage(6, 'R6C6', 'R6C7'),
  new Cage(6, 'R6C8', 'R6C9'),
  new Cage(15, 'R7C4', 'R8C4'),
  new Cage(8, 'R9C4', 'R9C5', 'R9C6'),
  new Cage(6, 'R8C7', 'R9C7'),
  new Cage(15, 'R9C8', 'R9C9'),
];
