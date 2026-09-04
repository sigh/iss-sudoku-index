// Title: Sudoku ("Diagonals")
// Author: Thomas Snyder
// Video: https://www.youtube.com/watch?v=9tEK7k6jTmg
// Source: https://gmpuzzles.com/s/171112Diag

// Rules (posting page): "Standard Sudoku rules." Digits 1-9 in every row,
// column and 3x3 box; Shape('9x9') supplies all three groups, matching the
// nine box regions drawn as thick edges in the export. The theme name
// "Diagonals" describes the layout of the givens and is not a rule: no
// diagonal is drawn and the rules line names none. Nothing else is drawn.

// Givens: the 23 digits printed in the grid.
return [
  new Shape('9x9'),

  new Given('R1C2', 7),
  new Given('R1C5', 6),
  new Given('R1C9', 9),
  new Given('R2C1', 6),
  new Given('R2C4', 5),
  new Given('R2C8', 8),
  new Given('R3C3', 4),
  new Given('R3C7', 7),
  new Given('R4C2', 3),
  new Given('R4C6', 6),
  new Given('R5C1', 2),
  new Given('R5C5', 5),
  new Given('R5C9', 8),
  new Given('R6C4', 4),
  new Given('R6C8', 1),
  new Given('R7C3', 3),
  new Given('R7C7', 4),
  new Given('R8C2', 2),
  new Given('R8C6', 7),
  new Given('R8C9', 3),
  new Given('R9C1', 1),
  new Given('R9C5', 8),
  new Given('R9C8', 2),
];
