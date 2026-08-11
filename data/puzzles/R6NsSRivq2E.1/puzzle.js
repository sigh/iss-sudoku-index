// Title: Jul 31, 2022: Extra Region
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=R6NsSRivq2E
// Source: https://tinyurl.com/yhuz5ycw

// Normal sudoku rules (rows, columns, boxes all-different) plus one extra
// region of 9 cells, each digit 1-9 exactly once. AllDifferent over 9 cells
// on a 1-9 grid is equivalent to "each number appears exactly once".
return [
  new Shape('9x9'),

  // Givens, transcribed from the source puzzle's given digits.
  new Given('R1C1', 3), new Given('R1C2', 4), new Given('R1C4', 1),
  new Given('R1C6', 2), new Given('R1C8', 6),
  new Given('R2C1', 1), new Given('R2C3', 2), new Given('R2C7', 3), new Given('R2C9', 4),
  new Given('R3C2', 5), new Given('R3C8', 7),
  new Given('R4C1', 6), new Given('R4C6', 1), new Given('R4C9', 8),
  new Given('R5C5', 2),
  new Given('R6C1', 5), new Given('R6C4', 3), new Given('R6C9', 7),
  new Given('R7C2', 6), new Given('R7C8', 8),
  new Given('R8C1', 2), new Given('R8C3', 3), new Given('R8C7', 4), new Given('R8C9', 5),
  new Given('R9C2', 7), new Given('R9C4', 2), new Given('R9C6', 5), new Given('R9C8', 9), new Given('R9C9', 3),

  // Extra region (the source's shaded/grey cells): each number once among these 9 cells.
  new AllDifferent('R2C2', 'R2C5', 'R2C8', 'R5C2', 'R5C5', 'R5C8', 'R8C2', 'R8C5', 'R8C8'),
];
