// Title: In My Thirties
// Author: Ridhwan
// Video: https://www.youtube.com/watch?v=q3K76ZFz3mk
// Source: https://sudokupad.app/rbt6j8bpbn

// Normal sudoku rules apply.
return [
  new Shape('9x9'),

  new Given('R9C5', 4),

  // Digits in a dotted cage cannot repeat and sum to the total shown.
  // Cage() enforces both the sum and the no-repeat constraint.
  new Cage(30, 'R6C7', 'R6C8', 'R7C7', 'R7C8', 'R8C8', 'R8C9'),
  new Cage(30, 'R2C9', 'R3C7', 'R3C8', 'R3C9', 'R4C7'),
  new Cage(30, 'R5C8', 'R5C9', 'R6C9', 'R7C9'),
  new Cage(30, 'R1C6', 'R2C5', 'R2C6', 'R2C7'),
  new Cage(30, 'R2C4', 'R3C4', 'R3C5', 'R4C4', 'R4C5', 'R4C6'),
  new Cage(30, 'R1C3', 'R1C4', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R4C1'),
  new Cage(30, 'R5C2', 'R5C3', 'R5C4', 'R6C2', 'R6C3'),
  new Cage(30, 'R5C1', 'R6C1', 'R7C1', 'R7C2'),
  new Cage(30, 'R7C3', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3', 'R9C4'),
  new Cage(30, 'R6C4', 'R6C5', 'R6C6', 'R7C4', 'R7C5', 'R8C4'),
];
