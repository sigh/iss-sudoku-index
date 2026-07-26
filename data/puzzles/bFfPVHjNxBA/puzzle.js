// Title: Love Triangle
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=bFfPVHjNxBA
// Source: https://sudokupad.app/zbpjp31ogi

// Normal sudoku rules apply (default row/column/box all-different; the
// payload's regions are the standard 3x3 boxes, so no explicit Regions
// needed). One given clue. Three closed coloured loops each require a
// minimum adjacent difference (a Whisper with a non-default threshold);
// each loop is drawn closed, so the first cell is repeated at the end to
// bind the wrap-around edge. Three arrows each sum their 3-cell diagonal
// shaft to the digit in their circled control cell.

return [
  new Shape('9x9'),

  new Given('R5C3', 3),

  // Blue loop, diff >= 6, drawn closed (interpolated diagonal jumps included).
  new Whisper(6, 'R4C1', 'R5C1', 'R6C2', 'R7C3', 'R6C4', 'R5C5', 'R4C5',
    'R3C4', 'R4C3', 'R3C2', 'R4C1'),

  // Orange loop, diff >= 4, drawn closed.
  new Whisper(4, 'R1C6', 'R2C7', 'R1C8', 'R2C9', 'R3C9', 'R4C8', 'R5C7',
    'R4C6', 'R3C5', 'R2C5', 'R1C6'),

  // Green loop, diff >= 5, drawn closed.
  new Whisper(5, 'R8C8', 'R9C7', 'R8C6', 'R7C5', 'R6C5', 'R5C6', 'R6C7',
    'R5C8', 'R6C9', 'R7C9', 'R8C8'),

  // Arrows: control (circled) cell first, then the 3-cell diagonal shaft.
  new Arrow('R2C4', 'R3C3', 'R4C2', 'R5C1'),
  new Arrow('R5C9', 'R4C8', 'R3C7', 'R2C6'),
  new Arrow('R6C8', 'R7C7', 'R8C6', 'R9C5'),
];
