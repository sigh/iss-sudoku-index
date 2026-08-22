// Title: Five Cells
// Author: Rangsk
// Video: https://www.youtube.com/watch?v=kQsj_QFTG_k
// Source: https://app.crackingthecryptic.com/sudoku/Fm9HLrhJ69

// Normal sudoku rules apply (default row/column/box all-different). Each
// drawn line is split into segments at box boundaries; EqualSum enforces
// that every segment of a given line sums to the same total.
// Segment cell lists below come from the drawn line paths (source lines
// array), split wherever the box membership changes.

return [
  new Shape('9x9'),
  new Given('R9C5', 3),

  new EqualSum(['R1C1', 'R2C1', 'R3C1'], ['R4C1']),
  new EqualSum(['R1C2', 'R1C3'], ['R1C4']),
  new EqualSum(
    ['R5C1', 'R4C2'], ['R3C3'], ['R4C4', 'R5C5', 'R6C6'], ['R7C7'],
    ['R6C8', 'R5C9']),
  new EqualSum(
    ['R5C6'], ['R6C7', 'R5C7', 'R4C7'], ['R3C7'], ['R3C6', 'R3C5', 'R3C4']),
  new EqualSum(['R4C9', 'R4C8'], ['R3C8', 'R2C8', 'R1C8', 'R1C9', 'R2C9']),
  new EqualSum(['R9C6', 'R8C6'], ['R8C7', 'R8C8', 'R8C9', 'R9C9', 'R9C8']),
  new EqualSum(['R6C1', 'R6C2'], ['R7C2', 'R8C2', 'R8C3']),
  new EqualSum(
    ['R7C6', 'R7C5', 'R7C4'], ['R7C3'], ['R6C3', 'R5C3', 'R4C3'], ['R5C4']),
];
