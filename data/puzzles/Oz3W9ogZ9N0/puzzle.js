// Title: Grid Dancing
// Author: BremSter
// Video: https://www.youtube.com/watch?v=Oz3W9ogZ9N0
// Source: https://app.crackingthecryptic.com/sudoku/3qJpQddmDd

// Normal sudoku rules apply (rows, columns, and 3x3 boxes all-different --
// the payload's regions are the standard boxes, matched by ISS's default).
// Cage rules: digits in a cage sum to the cage's total, and cannot repeat
// within the cage -- Cage bakes in that no-repeat requirement.
// Cell lists below are transcribed from the puzzle's drawn cages (17 in
// total). 30 of the 81 cells are not covered by any cage.

const cages = [
  new Cage(12, 'R1C2', 'R2C2', 'R2C1'),
  new Cage(12, 'R3C1', 'R3C2'),
  new Cage(23, 'R1C3', 'R2C3', 'R2C4', 'R1C4'),
  new Cage(16, 'R1C6', 'R2C6', 'R2C7', 'R1C7'),
  new Cage(17, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(9, 'R3C9', 'R3C8'),
  new Cage(28, 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R5C4', 'R5C6'),
  new Cage(7, 'R4C4', 'R4C3'),
  new Cage(10, 'R4C6', 'R4C7'),
  new Cage(11, 'R5C1', 'R5C2'),
  new Cage(7, 'R5C8', 'R5C9'),
  new Cage(11, 'R7C1', 'R7C2'),
  new Cage(8, 'R7C8', 'R7C9'),
  new Cage(25, 'R8C3', 'R9C3', 'R9C4', 'R8C4'),
  new Cage(23, 'R8C6', 'R9C6', 'R9C7', 'R8C7'),
  new Cage(15, 'R8C9', 'R8C8', 'R9C8'),
  new Cage(12, 'R8C1', 'R9C1', 'R9C2'),
];

return [
  new Shape('9x9'),
  ...cages,
];
