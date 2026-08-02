// Title: Diagonal stretch
// Author: Lithium-Ion
// Video: https://www.youtube.com/watch?v=fF0ypWf2HiQ
// Source: https://sudokupad.app/b2lc8walej

// Normal Sudoku rules apply. Each arrow's arm digits may repeat and sum to its
// attached white-circle digit. The lists below follow the ten drawn arrows from
// their circles to their arrowheads.
return [
  new Shape('9x9'),
  // Arrow paths transcribed from the ten white circles and diagonal arrows.
  new Arrow('R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8'),
  new Arrow('R9C8', 'R8C7', 'R7C6', 'R6C5'),
  new Arrow('R6C9', 'R5C8', 'R4C7', 'R3C6', 'R2C5', 'R1C4'),
  new Arrow('R9C6', 'R8C5', 'R7C4', 'R6C3', 'R5C2'),
  new Arrow('R3C7', 'R4C8', 'R5C9'),
  new Arrow('R5C3', 'R6C4'),
  new Arrow('R4C9', 'R3C8'),
  new Arrow('R9C7', 'R8C6'),
  new Arrow('R7C3', 'R6C2', 'R5C1'),
  new Arrow('R4C3', 'R5C4'),
];
