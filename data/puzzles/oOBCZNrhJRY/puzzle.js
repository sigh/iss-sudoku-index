// Title: Sums Plus
// Author: Cane_Puzzles
// Video: https://www.youtube.com/watch?v=oOBCZNrhJRY
// Source: https://sudokupad.app/7sf4felfun

// Normal sudoku rules apply.
// The grey region must contain each digit 1-9 exactly once.
// Arrow: digits along the arrow sum to the digit in the attached circle
//   (the circled cell is the first arrow cell).

return [
  new Shape('9x9'),

  new Given('R1C1', 8),
  new Given('R2C2', 9),
  new Given('R2C7', 7),
  new Given('R8C3', 8),
  new Given('R8C8', 7),
  new Given('R9C9', 5),

  // Grey extra region: each digit 1-9 once (a plus/cross shape on R5C5).
  new AllDifferent(
    'R3C5', 'R4C5', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R7C5'),

  // Arrows (circle cell first, then the arm).
  new Arrow('R8C5', 'R8C6', 'R8C7'),
  new Arrow('R2C5', 'R2C6', 'R3C6', 'R3C7', 'R3C8'),
  new Arrow('R5C1', 'R6C1', 'R7C1'),
  new Arrow('R1C5', 'R2C4', 'R3C3'),
  new Arrow('R5C8', 'R4C8', 'R4C7'),
  new Arrow('R5C9', 'R6C8', 'R7C9'),
  new Arrow('R9C5', 'R9C4', 'R9C3'),
  new Arrow('R5C2', 'R6C2', 'R7C2'),
];
