// Title: March 27, 2023: 129 Crane Fly
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=0Zieiss9eo0
// Source: https://tinyurl.com/2ks8na9h

// Plain sudoku: the rules state "Normal sudoku rules apply. And that's it!"
// Standard row/column/box all-different is enforced by the default Shape;
// no additional constraint is present. Givens below are transcribed from
// the payload's grid givens.
return [
  new Shape('9x9'),
  new Given('R1C2', 1),
  new Given('R1C3', 2),
  new Given('R1C7', 3),
  new Given('R2C4', 4),
  new Given('R2C6', 5),
  new Given('R2C8', 6),
  new Given('R3C1', 7),
  new Given('R3C5', 8),
  new Given('R3C9', 9),
  new Given('R4C3', 1),
  new Given('R4C4', 2),
  new Given('R4C5', 3),
  new Given('R5C3', 4),
  new Given('R5C5', 5),
  new Given('R5C7', 6),
  new Given('R6C5', 7),
  new Given('R6C6', 8),
  new Given('R6C7', 9),
  new Given('R7C1', 1),
  new Given('R7C5', 2),
  new Given('R7C9', 3),
  new Given('R8C2', 4),
  new Given('R8C4', 5),
  new Given('R8C6', 6),
  new Given('R9C3', 7),
  new Given('R9C7', 8),
  new Given('R9C8', 9),
];
