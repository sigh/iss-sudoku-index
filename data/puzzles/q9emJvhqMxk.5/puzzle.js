// Title: 10/25/22: Lemon Sudoku
// Author: GAS Who?
// Video: https://www.youtube.com/watch?v=q9emJvhqMxk
// Source: https://tinyurl.com/2jtb23sy

// Normal 6x6 Sudoku rules apply. Each yellow lemon perimeter sums to the
// enclosed two-digit number, whose cells are read top-to-bottom. Lemon digits
// may repeat, so these are Sum constraints rather than distinct cages.
// Perimeter cells are transcribed from the yellow lines; each line's short
// second stroke closes the listed six-cell loop.
return [
  new Shape('6x6'),
  new Given('R1C1', 1),
  new Given('R2C4', 3),
  new Given('R3C6', 4),
  new Given('R4C5', 2),
  new Given('R5C2', 5),
  new Given('R6C3', 6),
  new Sum(0,
    'R1C3', 'R1C4', 'R2C5', 'R3C4', 'R3C3', 'R2C2',
    ['R2C3', -10], ['R2C4', -1]),
  new Sum(0,
    'R3C2', 'R4C1', 'R5C1', 'R6C2', 'R5C3', 'R4C3',
    ['R4C2', -10], ['R5C2', -1]),
  new Sum(0,
    'R3C5', 'R4C4', 'R5C4', 'R6C5', 'R5C6', 'R4C6',
    ['R4C5', -10], ['R5C5', -1]),
];
