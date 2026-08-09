// Title: srelliK esreveR
// Author: Kuraban
// Video: https://www.youtube.com/watch?v=xzhNoG35X_s
// Source: https://app.crackingthecryptic.com/sudoku/DL9FNBNRRQ

// Normal sudoku rules apply (rows/columns/boxes all-different, via default
// Shape). Cages show their totals (Cage: sum + all-different within cage).
//
// Outside clues: "A clue outside the grid shows the total of the X number of
// cells, starting on the OPPOSITE side of the grid, where X is the first
// cell next to the clue." X is read off the cell of that row/column nearest
// the clue; the clue total is the sum of the X cells counted inward from the
// far edge of the grid (the edge opposite the clue). Each `lane` below lists
// a row or column's cells ordered from the clue-adjacent (near) cell to the
// far cell, so `lane.slice(-k)` is exactly "the X=k cells starting on the
// opposite side" for any k. This is encoded the same way the built-in XSum
// constraint is (branch on the near cell's value, Sum the selected cells),
// via Or/And/Given/Sum since the summed span here starts from the far edge
// instead of the near edge.

const outsideClues = [
  // [target, lane cells near -> far]
  [10, ['R1C3', 'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C3']], // top C3
  [15, ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5']], // top C5
  [12, ['R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R9C6']], // top C6
  [36, ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9']], // top C9
  [16, ['R9C4', 'R8C4', 'R7C4', 'R6C4', 'R5C4', 'R4C4', 'R3C4', 'R2C4', 'R1C4']], // bottom C4
  [21, ['R9C6', 'R8C6', 'R7C6', 'R6C6', 'R5C6', 'R4C6', 'R3C6', 'R2C6', 'R1C6']], // bottom C6
  [33, ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9']], // left R2
  [21, ['R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9']], // left R4
  [7, ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9']], // left R5
  [25, ['R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9']], // left R8
  [27, ['R5C9', 'R5C8', 'R5C7', 'R5C6', 'R5C5', 'R5C4', 'R5C3', 'R5C2', 'R5C1']], // right R5
  [12, ['R7C9', 'R7C8', 'R7C7', 'R7C6', 'R7C5', 'R7C4', 'R7C3', 'R7C2', 'R7C1']], // right R7
];

const reverseXSum = (target, lane) => new Or(
  lane.map((_, i) => i + 1).map(k => new And([
    new Given(lane[0], k),
    new Sum(target, ...lane.slice(lane.length - k)),
  ]))
);

// Cages (values, not digits; digits in a cage are distinct). Coordinates
// transcribed from the drawn cage cells.
const cages = [
  [10, ['R1C7', 'R2C7']],
  [11, ['R3C7', 'R3C8']],
  [10, ['R3C6', 'R4C6']],
  [10, ['R2C3', 'R3C3']],
  [10, ['R3C4', 'R4C4']],
  [10, ['R4C2', 'R4C3']],
  [11, ['R5C5', 'R5C6']],
  [10, ['R6C5', 'R7C5']],
  [11, ['R7C3', 'R7C4']],
  [10, ['R8C4', 'R9C4']],
  [10, ['R7C8', 'R7C9']],
  [10, ['R6C7', 'R6C8']],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, cells]) => new Cage(sum, ...cells)),
  ...outsideClues.map(([target, lane]) => reverseXSum(target, lane)),
];
