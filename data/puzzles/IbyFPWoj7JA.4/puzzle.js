// Title: Sept. 26, 2022: Disjoint
// Author: clover!
// Video: https://www.youtube.com/watch?v=IbyFPWoj7JA
// Source: https://tinyurl.com/5xfkzj2f

// Normal sudoku plus disjoint groups: the same digit may never appear in the
// same relative position in two different boxes. No other clues are drawn.
return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R1C4', 2), new Given('R1C7', 3),
  new Given('R2C2', 8), new Given('R2C5', 9), new Given('R2C8', 1),
  new Given('R3C3', 9), new Given('R3C6', 1), new Given('R3C9', 2),
  new Given('R4C2', 4), new Given('R4C5', 5), new Given('R4C8', 6),
  new Given('R5C1', 8), new Given('R5C4', 9), new Given('R5C7', 1),
  new Given('R6C2', 9), new Given('R6C5', 1), new Given('R6C8', 2),
  new Given('R7C3', 7), new Given('R7C6', 8), new Given('R7C9', 9),
  new Given('R8C2', 2), new Given('R8C5', 3), new Given('R8C8', 4),
  new Given('R9C3', 3), new Given('R9C6', 4), new Given('R9C9', 5),
  new DisjointSets(),
];
