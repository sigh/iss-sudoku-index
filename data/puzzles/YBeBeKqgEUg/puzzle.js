// Title: Eight Squares
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=YBeBeKqgEUg
// Source: https://app.crackingthecryptic.com/sudoku/DrGBD39bD9

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9'), standard 3x3 boxes). One given: R1C5=6.
// Cage rule: digits in a cage sum to the total shown in its top-left
// corner and cannot repeat within the cage -- Cage(sum, ...cells).

return [
  new Shape('9x9'),
  new Given('R1C5', 6),

  // Cages transcribed from the puzzle's drawn cage geometry (8 real
  // cages, each a 2x2 block).
  new Cage(29, 'R1C8', 'R1C9', 'R2C8', 'R2C9'),
  new Cage(25, 'R3C6', 'R3C7', 'R4C6', 'R4C7'),
  new Cage(23, 'R4C8', 'R4C9', 'R5C8', 'R5C9'),
  new Cage(28, 'R2C2', 'R2C3', 'R3C2', 'R3C3'),
  new Cage(17, 'R5C1', 'R5C2', 'R6C1', 'R6C2'),
  new Cage(11, 'R6C3', 'R6C4', 'R7C3', 'R7C4'),
  new Cage(10, 'R8C1', 'R8C2', 'R9C1', 'R9C2'),
  new Cage(11, 'R7C7', 'R7C8', 'R8C7', 'R8C8'),
];
