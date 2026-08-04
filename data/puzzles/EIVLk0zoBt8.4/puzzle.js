// Title: Dec. 25, 2022: Inverse Clones
// Author: clover!
// Video: https://www.youtube.com/watch?v=EIVLk0zoBt8
// Source: https://tinyurl.com/2s3cdr8v

// Standard Sudoku givens. Two 4x4 areas are shaded (pink: R1C1-R4C4, green:
// R6C6-R9C9). For every pair of cells sharing the same relative position
// within the two shaded areas, the digits sum to 10.
const givens = [
  ['R1C6', 5],
  ['R2C6', 8], ['R2C7', 9],
  ['R3C6', 6], ['R3C8', 7],
  ['R4C5', 1], ['R4C6', 2], ['R4C7', 3], ['R4C8', 4], ['R4C9', 5],
  ['R5C4', 4], ['R5C6', 9],
  ['R6C1', 4], ['R6C2', 5], ['R6C3', 6], ['R6C4', 7], ['R6C5', 8],
  ['R7C2', 1], ['R7C4', 8],
  ['R8C3', 4], ['R8C4', 2],
  ['R9C4', 5],
];

// The two shaded areas' top-left corners (row-major offset 0,0), from which
// each area's 16 cells are generated at matching relative offsets.
const pinkOrigin = [1, 1];
const greenOrigin = [6, 6];
const sumPairs = [];
for (let dr = 0; dr < 4; dr++) {
  for (let dc = 0; dc < 4; dc++) {
    const pinkCell = makeCellId(pinkOrigin[0] + dr, pinkOrigin[1] + dc);
    const greenCell = makeCellId(greenOrigin[0] + dr, greenOrigin[1] + dc);
    sumPairs.push(new Sum(10, pinkCell, greenCell));
  }
}

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...sumPairs,
];
