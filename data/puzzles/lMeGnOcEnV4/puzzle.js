// Title: Colorful Killers
// Author: Justalilguy
// Video: https://www.youtube.com/watch?v=lMeGnOcEnV4
// Source: https://sudokupad.app/1pjtxralwu
//
// Normal sudoku rules apply. AntiKnight forbids identical digits a chess
// knight's move apart. "All lines sum to the same number" is 13 separate
// lines (12 open, 1 closed 4-cell loop) that must all share one unknown
// total -- EqualSum enforces that directly, one segment per drawn line.

// Lines, one array of cells per drawn line, transcribed from the puzzle's
// drawn line geometry. The 4-cell loop is listed once around, not with its
// closing cell repeated, since EqualSum sums a segment's cells rather than
// walking sequential pairs.
const lines = [
  ['R1C3', 'R2C2'],                     // a
  ['R2C3', 'R3C2'],                     // b
  ['R3C4', 'R4C3'],                     // c
  ['R1C5', 'R2C5', 'R3C5'],             // d
  ['R1C7', 'R2C8'],                     // e
  ['R2C7', 'R3C8'],                     // f
  ['R4C6', 'R5C7'],                     // g
  ['R5C8', 'R6C7'],                     // h
  ['R5C9', 'R6C8'],                     // i
  ['R5C3', 'R6C3', 'R7C2'],             // j
  ['R7C3', 'R8C4'],                     // k
  ['R7C8', 'R8C9', 'R9C8'],             // l
  ['R4C5', 'R5C4', 'R6C5', 'R5C6'],     // m (closed loop)
];

return [
  new Shape('9x9'),
  new Given('R5C5', 1),
  new AntiKnight(),
  new EqualSum(...lines),
];
