// Title: The Observer Killer Sudoku: A Guide
// Author: Unknown
// Video: https://www.youtube.com/watch?v=eBDVDdC4LKI

// Classic Killer Sudoku: normal sudoku rules apply (default row/column/box
// all-different from Shape), plus dashed cages whose digits sum to the
// printed total and never repeat within the cage (Cage). No given digits.
//
// No online payload exists for this newspaper puzzle; cage geometry was
// hand-transcribed from the archived video frames (external-video-frame-35s
// and -90s.jpg, both showing the same custom solving-tool window). Every
// cell falls in exactly one cage below and the totals sum to 405 (9x45),
// the two checks that the traced partition is complete.
const cages = [
  [20, 'R1C1', 'R1C2', 'R2C1', 'R3C1'],
  [14, 'R1C3', 'R1C4', 'R1C5'],
  [16, 'R1C6', 'R2C5', 'R2C6'],
  [26, 'R1C7', 'R1C8', 'R1C9', 'R2C7'],
  [12, 'R2C2', 'R3C2'],
  [17, 'R2C3', 'R2C4', 'R3C3', 'R3C4'],
  [21, 'R2C8', 'R3C8', 'R4C8', 'R4C9'],
  [9, 'R2C9', 'R3C9'],
  [18, 'R3C5', 'R4C5', 'R4C6', 'R5C5'],
  // Corroborated by the "1"/"3" candidate pencil marks visible in both
  // cells in the 35s frame.
  [4, 'R3C6', 'R3C7'],
  [8, 'R4C1', 'R4C2'],
  [19, 'R4C3', 'R4C4', 'R5C3', 'R5C4'],
  [21, 'R4C7', 'R5C7', 'R6C7', 'R6C8'],
  [21, 'R5C1', 'R5C2', 'R6C1'],
  [10, 'R5C6', 'R6C6'],
  [11, 'R5C8', 'R5C9'],
  [21, 'R6C2', 'R6C3', 'R6C4', 'R7C2'],
  [28, 'R6C5', 'R7C4', 'R7C5', 'R7C6'],
  [10, 'R6C9', 'R7C9', 'R8C9'],
  [12, 'R7C1', 'R8C1', 'R9C1'],
  [21, 'R7C3', 'R8C2', 'R8C3'],
  [20, 'R7C7', 'R7C8', 'R8C7', 'R8C8'],
  [15, 'R8C4', 'R9C2', 'R9C3', 'R9C4'],
  [6, 'R8C5', 'R9C5'],
  [9, 'R8C6', 'R9C6'],
  [16, 'R9C7', 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
