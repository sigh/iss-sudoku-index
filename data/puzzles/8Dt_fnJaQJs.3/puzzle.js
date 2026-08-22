// Title: Nov 21, 2021: Irregular Frame
// Author: clover!
// Video: https://www.youtube.com/watch?v=8Dt_fnJaQJs
// Source: https://tinyurl.com/sp3s343d

// Rules encoded here:
//   Irregular sudoku - 1-9 once each in every row, column, and the nine
//     marked irregular regions (no default 3x3 boxes).
//   Outside-frame sums - a number outside the grid gives the sum of the
//     cells from that edge inward, up to (not including) the first cell
//     where the region changes. Every run below was measured from the
//     REGIONS layout itself (region membership is fixed, drawn geometry),
//     not derived by solving: for each clue, walk inward from the edge
//     cell and stop as soon as region membership changes.
// Nothing is omitted.

const GIVENS = [
  ['R1C4', 6], ['R3C5', 9], ['R3C8', 1], ['R4C6', 9], ['R4C7', 1],
  ['R5C4', 8], ['R5C6', 3], ['R6C3', 1], ['R6C4', 7], ['R7C2', 3],
  ['R7C5', 6], ['R9C6', 5],
];

// The nine irregular regions, transcribed from the `region` field on each
// grid cell in the source payload.
const REGIONS = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R4C1', 'R5C1'],
  ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C8', 'R2C9', 'R3C8', 'R3C9'],
  ['R5C9', 'R6C9', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
  ['R7C1', 'R7C2', 'R8C1', 'R8C2', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'],
  ['R1C4', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R3C4', 'R3C5', 'R3C6', 'R3C7'],
  ['R4C7', 'R4C8', 'R4C9', 'R5C7', 'R5C8', 'R6C7', 'R6C8', 'R7C7', 'R7C8'],
  ['R7C3', 'R7C4', 'R7C5', 'R7C6', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R9C6'],
  ['R3C2', 'R3C3', 'R4C2', 'R4C3', 'R5C2', 'R5C3', 'R6C1', 'R6C2', 'R6C3'],
  ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'],
];

// Each outside-frame clue's cells, walked inward from its edge to the first
// region border. These cells are plain grid cells (not extra Var cells) --
// the clue is a fixed number, not a digit read off the grid -- so a plain
// Sum over the exact run is a faithful encoding; the run's cells already
// live in one row or column, so no separate uniqueness is needed for the
// clue itself (row/column all-different already covers it, matching the
// rules, which say nothing about the frame cells repeating).
const FRAME_SUMS = [
  [7, ['R1C3', 'R2C3']],
  [9, ['R1C4', 'R2C4', 'R3C4']],
  [15, ['R1C8', 'R2C8', 'R3C8']],
  [9, ['R1C9', 'R2C9', 'R3C9']],
  [7, ['R9C1', 'R8C1', 'R7C1']],
  [15, ['R9C2', 'R8C2', 'R7C2']],
  [8, ['R9C6', 'R8C6', 'R7C6']],
  [9, ['R9C7', 'R8C7']],
  [6, ['R1C1', 'R1C2', 'R1C3']],
  [15, ['R6C1', 'R6C2', 'R6C3']],
  [14, ['R4C9', 'R4C8', 'R4C7']],
  [8, ['R9C9', 'R9C8', 'R9C7']],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...REGIONS.map(cells => new Jigsaw('9x9', ...cells)),
  ...FRAME_SUMS.map(([sum, cells]) => new Sum(sum, ...cells)),
];
