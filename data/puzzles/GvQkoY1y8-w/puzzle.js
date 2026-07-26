// Title: Nucular Power
// Author: Blashyrkh
// Video: https://www.youtube.com/watch?v=GvQkoY1y8-w
// Source: https://sudokupad.app/n6xrjvt168

// Normal sudoku rules apply (default row/col/box all-different, no givens).
// Digits along an arrow sum to the number in the attached circle. Three
// circles anchor more than one arrow arm; each arm is its own separate
// Arrow constraint against the same shared bulb cell.
// Arrow(bulb, ...arm) sums the arm cells into the bulb cell's own value.

return [
  new Shape('9x9'),

  // Circle R2C2 (3 arms)
  new Arrow('R2C2', 'R2C1', 'R1C1'),
  new Arrow('R2C2', 'R1C2', 'R1C3'),
  new Arrow('R2C2', 'R2C3', 'R3C4'),

  // Circle R2C8 (1 arm)
  new Arrow('R2C8', 'R3C7', 'R4C6'),

  // Circle R1C9 (2 arms)
  new Arrow('R1C9', 'R1C8', 'R1C7'),
  new Arrow('R1C9', 'R2C9', 'R3C9'),

  // Circle R8C8 (3 arms)
  new Arrow('R8C8', 'R7C8', 'R6C7'),
  new Arrow('R8C8', 'R8C9', 'R7C9'),
  new Arrow('R8C8', 'R9C8', 'R9C9'),

  // Circle R8C4 (1 arm)
  new Arrow('R8C4', 'R9C4', 'R9C3', 'R9C2'),

  // Circle R6C2 (1 arm)
  new Arrow('R6C2', 'R5C1', 'R6C1', 'R7C1'),

  // Circle R8C2 (1 arm)
  new Arrow('R8C2', 'R7C3', 'R6C4', 'R5C5'),

  // Circle R5C7 (1 arm)
  new Arrow('R5C7', 'R5C6', 'R4C5'),
];
