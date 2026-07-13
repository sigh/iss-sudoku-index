// Title: Keep being you
// Author: Chip Sounder
// Video: https://www.youtube.com/watch?v=7_JVTn-UZQs
// Source: https://sudokupad.app/kqyga6lqbv

// Normal 6x6 sudoku rules apply. Shape('6x6') already gives 2x3 boxes
// (boxDimsForSize(6,6,6) picks [2,3]), matching the rules text.

return [
  new Shape('6x6'),

  // Adjacent digits along a green line must differ by at least 3.
  // Whisper's default difference is 5; the rules text overrides it to 3.
  // Five separate drawn lines (two touch at R5C5; two others revisit a
  // cell to close a loop, which is fine since Whisper only constrains
  // consecutive pairs in the given cell order).
  new Whisper(3, 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R3C2'),
  new Whisper(3, 'R4C4', 'R5C5', 'R6C5'),
  new Whisper(3, 'R5C5', 'R4C6'),
  new Whisper(3, 'R4C3', 'R5C3', 'R6C3', 'R6C2', 'R5C2', 'R5C3'),
  new Whisper(3, 'R2C4', 'R2C5', 'R3C5', 'R3C4', 'R2C4'),

  // Digits on an arrow sum to the connected circle. Circle cell is R3C6;
  // the arrow line runs through R2C6 and R1C6.
  new Arrow('R3C6', 'R2C6', 'R1C6'),

  // Cells separated by a black dot have one digit double the other.
  new BlackDot('R3C6', 'R4C6'),

  // Cells separated by a V sum to 5.
  new V('R6C1', 'R6C2'),
];
