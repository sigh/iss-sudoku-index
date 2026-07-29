// Title: Ghost Cages
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=hRK7VVhO1eA
// Source: https://sudokupad.app/66g31006zr

// Normal Sudoku and the four printed givens. The hidden rectangular-cage rule
// is omitted: the displayed dashed corners identify each cage's upper-left
// cell, while the rectangular extents must be discovered.
return [
  new Shape('9x9'),
  // Printed givens from the source grid.
  new Given('R3C2', 9),
  new Given('R4C4', 8),
  new Given('R5C6', 6),
  new Given('R7C8', 9),
];
