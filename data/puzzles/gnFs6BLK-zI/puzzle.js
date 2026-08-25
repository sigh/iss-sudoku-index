// Title: Silent Night
// Author: Titus; Ronicus
// Video: https://www.youtube.com/watch?v=gnFs6BLK-zI
// Source: https://app.crackingthecryptic.com/sudoku/2f6DMd6tDL

// Normal sudoku rules (default 3x3 boxes). No given digits.
//
// Cages: digits in a cage sum to the printed total and do not repeat.
//
// Grey lines: any two digits joined by a line differ by at least 5
// (German-whisper difference). Two of the ten drawn strokes meet at R3C1,
// branching there; since the rule is pairwise per adjacent pair on a stroke,
// each drawn stroke is encoded as its own Whisper over its own cell list.

return [
  new Shape('9x9'),

  // Killer cages (cells from the puzzle's drawn cage geometry).
  new Cage(11, 'R1C1', 'R1C2'),
  new Cage(18, 'R5C1', 'R6C1', 'R7C1'),
  new Cage(16, 'R9C1', 'R9C2', 'R9C3'),
  new Cage(18, 'R7C5', 'R8C5', 'R9C5', 'R9C4', 'R8C4'),
  new Cage(18, 'R9C6', 'R8C6', 'R8C7'),
  new Cage(18, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(10, 'R9C7', 'R9C8'),

  // Grey difference lines, one per drawn stroke (default difference 5).
  new Whisper('R4C1', 'R3C1', 'R2C1', 'R3C2'),
  new Whisper('R3C1', 'R4C2'),
  new Whisper('R6C2', 'R5C3', 'R4C4', 'R5C5', 'R6C6'),
  new Whisper('R5C2', 'R4C3', 'R3C4', 'R4C5', 'R5C6'),
  new Whisper('R3C3', 'R2C4', 'R3C5'),
  new Whisper('R2C3', 'R1C4', 'R2C5'),
  new Whisper('R5C4', 'R6C4', 'R7C4'),
  new Whisper('R7C8', 'R8C8'),
  new Whisper('R7C7', 'R6C8', 'R7C9'),
  new Whisper('R6C7', 'R5C8', 'R6C9'),
];
