// Title: The Tulip
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=xPnTCV5L6-k
// Source: https://sudokupad.app/q3ik3a630w

// Normal Sudoku rules apply. Each gray circle is an arrow bulb; its shaft digits sum to the bulb digit.

return [
  new Shape('9x9'),
  new Given('R2C1', 2),

  // Arrow shafts transcribed from the gray circles and arrow lines.
  new Arrow('R9C1', 'R8C1', 'R7C1'),
  new Arrow('R9C1', 'R9C2', 'R9C3'),
  new Arrow('R9C1', 'R8C2', 'R7C3'),
  new Arrow('R7C1', 'R6C1', 'R5C1'),
  new Arrow('R7C1', 'R6C2'),
  new Arrow('R9C3', 'R8C4'),
  new Arrow('R9C3', 'R9C4', 'R9C5'),
  new Arrow('R7C3', 'R6C4', 'R5C5'),
  new Arrow('R7C3', 'R6C3', 'R5C3'),
  new Arrow('R7C3', 'R7C4', 'R7C5'),
  new Arrow('R5C5', 'R4C6', 'R3C7'),
  new Arrow('R5C5', 'R4C5', 'R3C5'),
  new Arrow('R5C5', 'R5C6', 'R5C7'),
  new Arrow('R3C7', 'R2C7', 'R1C7'),
  new Arrow('R3C7', 'R3C8', 'R3C9'),
  new Arrow('R5C7', 'R4C8', 'R3C9'),
  new Arrow('R3C5', 'R2C6', 'R1C7'),
];
