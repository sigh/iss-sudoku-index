// Title: 6/29/22: The Quick and the Egg
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=INdI4Su2-Ko
// Source: https://tinyurl.com/2f8faf3n

// Plain sudoku: the rules state "Normal sudoku rules apply. And that's it!"
// Standard row/column/box all-different is enforced by the default Shape;
// no additional constraint is present. Givens below are transcribed from
// the payload's grid givens.
return [
  new Shape('9x9'),
  new Given('R1C3', 4), new Given('R1C8', 6),
  new Given('R2C3', 3), new Given('R2C4', 1), new Given('R2C6', 8), new Given('R2C8', 2),
  new Given('R3C2', 2), new Given('R3C3', 7), new Given('R3C6', 3), new Given('R3C7', 1), new Given('R3C8', 9),
  new Given('R4C2', 6), new Given('R4C3', 1), new Given('R4C4', 4), new Given('R4C6', 2), new Given('R4C8', 3),
  new Given('R5C5', 5),
  new Given('R6C2', 7), new Given('R6C4', 8), new Given('R6C6', 6), new Given('R6C7', 9), new Given('R6C8', 4),
  new Given('R7C2', 1), new Given('R7C3', 9), new Given('R7C4', 7), new Given('R7C7', 3), new Given('R7C8', 8),
  new Given('R8C2', 8), new Given('R8C4', 2), new Given('R8C6', 9), new Given('R8C7', 7),
  new Given('R9C2', 4), new Given('R9C7', 6),
];
