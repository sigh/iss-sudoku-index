// Title: Super Nova
// Author: Ahmadoku
// Video: https://www.youtube.com/watch?v=TrSwZ9PQ6k8
// Source: https://sudokupad.app/08yynh57ts

// Normal Sudoku rules apply. Every grey arrow runs from the circle at R4C6 to
// a leaf of the branching drawing; its arm digits sum to R4C6. Each X marks an
// adjacent pair summing to 10.
return [
  new Shape('9x9'),

  // Arrow paths transcribed from the grey branching drawing, with each branch expanded from the circle to its leaf.
  new Arrow('R4C6', 'R3C5', 'R2C4', 'R1C3', 'R2C2', 'R1C1'),
  new Arrow('R4C6', 'R3C5', 'R2C4', 'R3C3', 'R4C2'),
  new Arrow('R4C6', 'R3C6', 'R2C5'),
  new Arrow('R4C6', 'R3C6', 'R3C7', 'R2C8', 'R1C9'),
  new Arrow('R4C6', 'R4C7', 'R5C8'),
  new Arrow('R4C6', 'R5C7', 'R6C8', 'R7C8', 'R8C9', 'R9C9'),
  new Arrow('R4C6', 'R5C7', 'R6C8', 'R6C9'),
  new Arrow('R4C6', 'R5C7', 'R6C8', 'R7C8', 'R7C9'),
  new Arrow('R4C6', 'R5C7', 'R6C8', 'R7C7'),
  new Arrow('R4C6', 'R5C7', 'R6C7', 'R6C6'),
  new Arrow('R4C6', 'R5C5', 'R6C4', 'R7C4', 'R8C3', 'R9C3'),
  new Arrow('R4C6', 'R5C5', 'R6C4', 'R7C5', 'R7C6'),
  new Arrow('R4C6', 'R5C5', 'R6C5'),
  new Arrow('R4C6', 'R4C5', 'R5C4'),

  // X markers transcribed from the four labelled shared edges.
  new X('R1C2', 'R2C2'),
  new X('R5C1', 'R5C2'),
  new X('R8C1', 'R8C2'),
  new X('R8C8', 'R8C9'),
];
