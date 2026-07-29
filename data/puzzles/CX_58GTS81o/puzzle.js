// Title: Pi
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=CX_58GTS81o
// Source: https://sudokupad.app/q7nxdos135

// Normal Sudoku rules apply. Within each 3x3 box, knight-move pairs cannot
// contain consecutive digits. The red-and-blue pi-shaped underlays are not
// assigned rule semantics.
const givens = [
  ['R2C4', 1], ['R2C5', 5], ['R2C6', 9], ['R3C3', 4], ['R3C7', 2],
  ['R4C2', 1], ['R4C8', 6], ['R5C2', 3], ['R5C8', 5], ['R6C8', 3],
  ['R7C3', 9], ['R7C7', 5], ['R8C4', 7], ['R8C5', 9], ['R8C6', 8],
  ['R9C3', 8], ['R9C7', 7],
];

// The four forward knight offsets enumerate each undirected pair once; the
// same-box test implements the rule's explicit 3x3-box scope.
const knightOffsets = [[1, 2], [1, -2], [2, 1], [2, -1]];
const gridIndexes = Array.from({length: 9}, (_, index) => index + 1);
const knightPairs = gridIndexes.flatMap(row =>
  gridIndexes.flatMap(col => knightOffsets
    .map(([dRow, dCol]) => [row + dRow, col + dCol])
    .filter(([otherRow, otherCol]) =>
      otherRow >= 1 && otherRow <= 9 && otherCol >= 1 && otherCol <= 9 &&
      Math.floor((row - 1) / 3) === Math.floor((otherRow - 1) / 3) &&
      Math.floor((col - 1) / 3) === Math.floor((otherCol - 1) / 3))
    .map(([otherRow, otherCol]) => [
      makeCellId(row, col), makeCellId(otherRow, otherCol),
    ])));
const nonConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...knightPairs.map(([a, b]) => new Pair(nonConsecutive, '', a, b)),
];
