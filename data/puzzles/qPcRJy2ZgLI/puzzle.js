// Title: Big Waves (Are Coming)
// Author: Mr.Menace
// Video: https://www.youtube.com/watch?v=qPcRJy2ZgLI
// Source: https://sudokupad.app/fsq3l4xjbi
//
// Rules encoded:
// - Normal sudoku rules; the payload's `regions` array is the standard box
//   tiling.
// - Six region sum lines (deepskyblue): box borders divide each line into
//   segments, and every segment of a line sums to that line's total. Lines
//   #3 and #4 each revisit a box; each visit is its own segment.
// - "digits on such line may not repeat": a whole-line AllDifferent on top
//   of the region sums, which alone would not forbid a repeat across
//   different-box segments.
//
// Line cell lists below are transcribed from the payload's `lines` array
// (drawn waypoints interpolated to the cells the stroke passes through).
const lines = [
  ['R2C5', 'R1C6', 'R2C7', 'R1C8', 'R1C9'],
  ['R2C3', 'R3C3', 'R4C4', 'R4C5', 'R3C6', 'R2C6'],
  ['R5C2', 'R4C2', 'R3C1', 'R3C2', 'R4C3', 'R5C3', 'R6C4', 'R6C5'],
  ['R5C8', 'R4C7', 'R3C7', 'R3C8', 'R4C9', 'R5C9'],
  ['R6C3', 'R7C2', 'R8C3', 'R9C4', 'R9C5', 'R9C6'],
  ['R7C6', 'R8C6', 'R9C7', 'R9C8'],
];

return [
  new Shape('9x9'),

  new Given('R1C4', 8),
  new Given('R6C9', 2),
  new Given('R9C1', 4),

  ...lines.map(cells => new RegionSumLine(...cells)),
  ...lines.map(cells => new AllDifferent(...cells)),
];
