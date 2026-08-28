// Title: Dec 6, 2021: True or Lie
// Author: clover!
// Video: https://www.youtube.com/watch?v=tK6z5BAkQ_M
// Source: https://tinyurl.com/yckswy3s

// Rules encoded below:
//   Normal sudoku rules apply.
//   The small digit in the top left corner of a cage is either the correct
//   digit that goes in that cell, or it is one higher or one lower than the
//   correct digit.
// Every cage in the payload is a single cell carrying one such corner digit
// (no cage sums to a total), so each is a candidate restriction on its own
// cell to {clue-1, clue, clue+1}, clamped to 1-9.

const shape = new Shape('9x9');

// Givens, transcribed from the grid's `value`/`given` cells.
const givens = [
  ['R2C3', 3], ['R2C7', 9], ['R3C2', 8], ['R3C8', 4], ['R4C9', 6],
  ['R5C5', 2], ['R6C1', 7], ['R7C2', 6], ['R7C8', 1], ['R8C3', 9],
  ['R8C7', 5],
];

// Corner-digit clues, transcribed from the payload's single-cell `cage`
// entries (cell -> printed clue digit).
const clues = [
  ['R2C1', 3], ['R2C2', 3], ['R1C5', 2], ['R1C6', 2], ['R1C8', 4],
  ['R2C8', 4], ['R5C9', 3], ['R5C7', 8], ['R4C6', 9], ['R6C4', 9],
  ['R5C3', 8], ['R5C1', 3], ['R8C2', 6], ['R9C2', 6], ['R9C4', 4],
  ['R9C5', 4], ['R7C6', 9], ['R8C8', 5], ['R8C9', 5], ['R3C4', 6],
];

const candidatesFor = (clue) => {
  const set = new Set();
  for (const v of [clue - 1, clue, clue + 1]) if (v >= 1 && v <= 9) set.add(v);
  return [...set].sort((a, b) => a - b);
};

return [
  shape,
  ...givens.map(([cell, v]) => new Given(cell, v)),
  ...clues.map(([cell, clue]) => new Given(cell, ...candidatesFor(clue))),
];
