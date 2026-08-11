// Title: July 30, 2022: Extra Regions
// Author: clover!
// Video: https://www.youtube.com/watch?v=R6NsSRivq2E
// Source: https://tinyurl.com/rdhjmp5j

// Normal sudoku rules apply. Also, each of the four shaded gray regions
// contains the digits 1 through 9 once each. Each region is a 9-cell set
// (drawn `extraregion` in the payload); AllDifferent over a 9-cell set on
// this 9x9 grid is equivalent to it holding each of 1-9 exactly once.
return [
  new Shape('9x9'),

  new Given('R2C2', 2), new Given('R2C4', 4), new Given('R2C6', 5),
  new Given('R2C8', 7), new Given('R3C3', 3), new Given('R3C7', 6),
  new Given('R4C2', 1), new Given('R4C5', 9), new Given('R4C8', 8),
  new Given('R5C4', 2), new Given('R5C6', 6), new Given('R6C2', 6),
  new Given('R6C5', 4), new Given('R6C8', 9), new Given('R7C3', 8),
  new Given('R7C7', 5), new Given('R8C2', 3), new Given('R8C4', 7),
  new Given('R8C6', 4), new Given('R8C8', 1),

  // Shaded extra regions, as drawn.
  new AllDifferent(
    'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R2C4', 'R3C1', 'R4C1', 'R4C2'),
  new AllDifferent(
    'R6C1', 'R6C2', 'R7C1', 'R8C1', 'R8C4', 'R9C1', 'R9C2', 'R9C3', 'R9C4'),
  new AllDifferent(
    'R6C8', 'R6C9', 'R7C9', 'R8C6', 'R8C9', 'R9C6', 'R9C7', 'R9C8', 'R9C9'),
  new AllDifferent(
    'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C6', 'R2C9', 'R3C9', 'R4C8', 'R4C9'),
];
