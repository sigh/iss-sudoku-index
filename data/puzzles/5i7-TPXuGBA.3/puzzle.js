// Title: Nov. 16, 2022: Diag. Sum to 9
// Author: clover!
// Video: https://www.youtube.com/watch?v=5i7-TPXuGBA
// Source: https://tinyurl.com/mwdppatm

// Normal sudoku rules apply. Each marked diagonal pair of cells sums to 9.
// Not all pairs that sum to 9 are necessarily marked, so only the 12 drawn
// pairs below are constrained (unmarked diagonal pairs are unrestricted).
return [
  new Shape('9x9'),

  new Given('R2C5', 8),
  new Given('R3C4', 1),
  new Given('R3C5', 2),
  new Given('R3C6', 3),
  new Given('R4C3', 5),
  new Given('R4C7', 9),
  new Given('R5C2', 6),
  new Given('R5C3', 4),
  new Given('R5C7', 2),
  new Given('R5C8', 3),
  new Given('R6C3', 9),
  new Given('R6C7', 7),
  new Given('R7C4', 3),
  new Given('R7C5', 4),
  new Given('R7C6', 5),
  new Given('R8C5', 9),

  new Sum(9, 'R3C3', 'R4C4'),
  new Sum(9, 'R4C6', 'R3C7'),
  new Sum(9, 'R6C6', 'R7C7'),
  new Sum(9, 'R7C3', 'R6C4'),
  new Sum(9, 'R7C1', 'R8C2'),
  new Sum(9, 'R7C2', 'R8C3'),
  new Sum(9, 'R2C7', 'R3C8'),
  new Sum(9, 'R2C8', 'R3C9'),
  new Sum(9, 'R3C1', 'R2C2'),
  new Sum(9, 'R7C9', 'R8C8'),
  new Sum(9, 'R2C4', 'R1C5'),
  new Sum(9, 'R9C5', 'R8C6'),
];
