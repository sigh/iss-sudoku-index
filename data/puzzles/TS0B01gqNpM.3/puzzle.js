// Title: May 15, 2022: Scattered
// Author: clover!
// Video: https://www.youtube.com/watch?v=TS0B01gqNpM
// Source: https://tinyurl.com/2z4fwwbb

// Rule: "1-9 appears in each row, column and marked region. The orange
// region isn't contiguous. When you solve, treat this region like any
// other region: it contains the digits 1 through 9 exactly once each."
// Rows and columns are the default 9x9 all-different groups. The nine
// regions replace the default 3x3 boxes (NoBoxes), so each is given
// explicitly as a Jigsaw. Jigsaw itself has no adjacency requirement, so
// the same constructor faithfully encodes the scattered orange region
// alongside the eight ordinary connected ones.

// Region cells, transcribed from the payload's per-cell `region` field;
// cells the payload leaves unmarked take the default box implied by their
// grid position (per the f-puzzles schema), which completes every region
// to 9 cells. `region8` is the orange, non-contiguous region.
const regions = [
  ['R4C4', 'R5C4', 'R6C4', 'R6C5', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9'],
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C1', 'R2C3', 'R2C5'],
  ['R8C5', 'R8C7', 'R8C9', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R6C2', 'R7C1', 'R7C2', 'R8C1', 'R8C3', 'R8C4', 'R9C1', 'R9C2', 'R9C3'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C6', 'R2C7', 'R2C9', 'R3C8', 'R3C9', 'R4C8'],
  ['R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C3', 'R6C1', 'R6C3', 'R7C3', 'R7C4'],
  ['R3C6', 'R3C7', 'R4C7', 'R4C9', 'R5C7', 'R5C9', 'R6C7', 'R6C8', 'R6C9'],
  ['R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R4C5', 'R4C6', 'R5C6', 'R6C6'],
  ['R2C2', 'R2C4', 'R2C8', 'R5C2', 'R5C5', 'R5C8', 'R8C2', 'R8C6', 'R8C8'],
];

// Givens, transcribed from the payload's `value`/`given` cells.
const givens = [
  ['R1C2', 2], ['R1C7', 6], ['R1C8', 7], ['R1C9', 8],
  ['R2C6', 4], ['R2C8', 2],
  ['R3C1', 4], ['R3C5', 3],
  ['R4C1', 9], ['R4C5', 6],
  ['R5C4', 2], ['R5C6', 1],
  ['R6C5', 4], ['R6C9', 3],
  ['R7C5', 7], ['R7C9', 9],
  ['R8C2', 1], ['R8C4', 6],
  ['R9C1', 3], ['R9C2', 4], ['R9C3', 5], ['R9C8', 1],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
