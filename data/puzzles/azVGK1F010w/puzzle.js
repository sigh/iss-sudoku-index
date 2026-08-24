// Title: Lion-Fish
// Author: Abed Hawila
// Video: https://www.youtube.com/watch?v=azVGK1F010w
// Source: https://app.crackingthecryptic.com/sudoku/h3gMpBTFhJ

// Normal sudoku rules (rows, columns, boxes). Killer cages: digits in each
// cage sum to the printed total and cannot repeat within the cage. No givens.
// Cage cells transcribed from the payload's `cages` array.

const cages = [
  new Cage(11, 'R1C2', 'R1C3', 'R2C3'),
  new Cage(19, 'R2C1', 'R3C1', 'R3C2'),
  new Cage(15, 'R1C5', 'R1C6'),
  new Cage(15, 'R2C5', 'R3C5'),
  new Cage(12, 'R3C4', 'R3C3', 'R4C3'),
  new Cage(13, 'R5C2', 'R5C3'),
  new Cage(10, 'R5C1', 'R6C1'),
  new Cage(12, 'R7C1', 'R7C2'),
  new Cage(13, 'R8C3', 'R9C3'),
  new Cage(10, 'R9C4', 'R9C5'),
  new Cage(13, 'R8C5', 'R7C5'),
  new Cage(27, 'R8C6', 'R7C6', 'R7C7', 'R6C7', 'R6C8'),
  new Cage(19, 'R8C9', 'R9C9', 'R9C8'),
  new Cage(9, 'R5C4', 'R6C4', 'R6C5'),
  new Cage(7, 'R2C7', 'R2C8'),
  new Cage(10, 'R3C7', 'R3C8'),
  new Cage(15, 'R5C7', 'R5C8'),
  new Cage(15, 'R4C9', 'R5C9'),
];

return [
  new Shape('9x9'),
  ...cages,
];
