// Title: Frolic
// Author: Nordy
// Video: https://www.youtube.com/watch?v=9mUsQH09Sgw
// Source: https://sudokupad.app/o0ypyh2f0y

// Normal Sudoku, Region Sum Lines, and German Whispers. Regions are the
// standard 3x3 boxes (the drawn region list matches the default boxes
// exactly, so the solver's default box all-different groups apply).

return [
  new Shape('9x9'),

  // German Whispers (green): adjacent cells differ by at least 5.
  // Whisper's default difference is 5, matching German Whisper semantics.
  new Whisper('R9C1', 'R8C1', 'R8C2', 'R7C1'),
  new Whisper(
    'R8C4', 'R9C4', 'R9C5', 'R9C6', 'R8C7', 'R9C7', 'R9C8', 'R9C9', 'R8C8'),
  new Whisper('R7C8', 'R8C9'),

  // Region Sum Lines (blue): equal sum per box segment, independently per
  // line. RegionSumLine already sums each box-crossing segment separately.
  new RegionSumLine('R2C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6'),
  new RegionSumLine(
    'R2C4', 'R3C3', 'R3C2', 'R4C2', 'R5C3', 'R5C4', 'R4C5', 'R3C5', 'R2C6',
    'R2C7', 'R3C8', 'R4C8', 'R5C7', 'R5C6', 'R6C7', 'R6C8', 'R7C7', 'R8C6',
    'R7C5', 'R6C5', 'R6C4', 'R6C3', 'R7C2', 'R8C3'),
];
