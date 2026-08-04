// Title: Turning 40 This Year
// Author: Cracking the Cryptic
// Video: https://www.youtube.com/watch?v=Y_BqmfMRF_k
// Source: https://app.crackingthecryptic.com/sudoku/QNrbfMdbNb

// Normal sudoku rules apply: default row, column and 3x3 box all-different
// (Shape('9x9') below already provides these).
// Each outside clue is a standard X-Sum: it equals the sum of the first X
// digits counted from that direction, where X is the first digit encountered
// from that direction. XSum.fromCells(value, cells, geometry) takes the lane
// as a cell list ordered nearest-clue-first, which fixes both the lane and
// the reading direction.
// The green line enforces a minimum difference of 5 between adjacent cells
// (Whisper's difference argument), matching "must have a difference of at
// least 5".

const geometry = cellGeometry('9x9');

const xsumLanes = [
  // top C1 -> 40
  [40, ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1']],
  // top C3 -> 40
  [40, ['R1C3', 'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C3']],
  // top C6 -> 20
  [20, ['R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R9C6']],
  // top C7 -> 22
  [22, ['R1C7', 'R2C7', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7', 'R8C7', 'R9C7']],
  // left R1 -> 40
  [40, ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9']],
  // left R6 -> 40
  [40, ['R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9']],
  // right R7 -> 40
  [40, ['R7C9', 'R7C8', 'R7C7', 'R7C6', 'R7C5', 'R7C4', 'R7C3', 'R7C2', 'R7C1']],
  // right R9 -> 40
  [40, ['R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1']],
  // bottom C5 -> 40
  [40, ['R9C5', 'R8C5', 'R7C5', 'R6C5', 'R5C5', 'R4C5', 'R3C5', 'R2C5', 'R1C5']],
  // bottom C9 -> 40
  [40, ['R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R3C9', 'R2C9', 'R1C9']],
];

const xsums = xsumLanes.map(
  ([value, cells]) => XSum.fromCells(value, cells, geometry));

// Green line path, drawn R1C1 through R9C9 (17 cells).
const greenLine = [
  'R1C1', 'R1C2', 'R2C2', 'R3C2', 'R4C2', 'R4C3', 'R5C3', 'R5C4', 'R6C4',
  'R6C5', 'R7C5', 'R8C5', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9',
];

return [
  new Shape('9x9'),
  ...xsums,
  new Whisper(5, ...greenLine),
];
