// Title: Reverse X-Sums
// Author: Kuraban
// Video: https://www.youtube.com/watch?v=IK8Dl5U1MKw
// Source: https://app.crackingthecryptic.com/sudoku/LRBmTpdnb8

// Normal sudoku rules (default row/column/box all-different from Shape('9x9');
// the payload's 9 regions are the ordinary boxes, so no explicit Region is
// needed). Outside clue rule: let X be the digit in the cell nearest the
// clue. Counting X cells inward from the OPPOSITE end of that row/column,
// their sum is the clue's total ("Numbers outside the grid show the total of
// the X number of cells, starting the OPPOSITE side of the grid, where X is
// the first cell next to the clue, so if r1 began with a 4, its last 4 cells
// would sum to 22.").

const graph = cellGraph('9x9');

// For a lane's cells listed near-to-far (index 0 = the cell adjacent to the
// clue), X = the near cell's digit and the rule fixes both the count and the
// position of the summed window at the far end: the last X cells of the
// near-to-far list, i.e. cells.slice(9 - X). Branch over every possible X
// (1..9): each branch pins the near cell to that X via Given and sums the
// resulting far-end window via Sum. At X = 9 the window is the whole lane,
// including the near cell itself.
function reverseXSum(total, cellsNearToFar) {
  return new Or(
    Array.from({ length: 9 }, (_, i) => i + 1).map(x => new And([
      new Given(cellsNearToFar[0], x),
      new Sum(total, ...cellsNearToFar.slice(9 - x)),
    ]))
  );
}

// [column, total], near cell = row 1 (top), reading down. Transcribed from
// the drawn outside-clue circles above the grid.
const topClues = [[4, 9], [5, 14], [6, 22], [7, 27], [8, 10]];

// [column, total], near cell = row 9 (bottom), reading up. Transcribed from
// the drawn outside-clue circles below the grid.
const bottomClues = [[2, 14], [3, 27], [5, 37], [7, 6], [8, 26]];

// [row, total], near cell = column 1 (left), reading right. Transcribed from
// the drawn outside-clue circles left of the grid.
const leftClues = [[1, 22], [2, 4], [3, 34], [4, 7], [7, 19], [8, 22]];

// [row, total], near cell = column 9 (right), reading left. Transcribed from
// the drawn outside-clue circles right of the grid.
const rightClues = [[2, 17], [3, 7], [4, 30], [5, 12], [8, 26], [9, 11]];

return [
  new Shape('9x9'),
  ...topClues.map(([col, total]) =>
    reverseXSum(total, graph.column(col))),
  ...bottomClues.map(([col, total]) =>
    reverseXSum(total, graph.column(col).slice().reverse())),
  ...leftClues.map(([row, total]) =>
    reverseXSum(total, graph.row(row))),
  ...rightClues.map(([row, total]) =>
    reverseXSum(total, graph.row(row).slice().reverse())),
];
