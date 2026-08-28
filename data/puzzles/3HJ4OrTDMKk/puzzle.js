// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=3HJ4OrTDMKk
// Source: https://cracking-the-cryptic.web.app/sudoku/gFgFnPtTR8

// Normal sudoku rules apply (default Shape('9x9') already gives the payload's
// nine 3x3 box regions, so no Jigsaw is needed).
// Sandwich sudoku: each outside number is the sum of the digits sandwiched
// between the 1 and the 9 in that row/column.
// Three of the nine 3x3 boxes are magic squares (every row, column, and both
// diagonals share one sum). Which three boxes is not stated -- it is left for
// the solver to determine -- so the encoding disjoins over every 3-of-9
// choice of boxes; a satisfied disjunct says nothing about the other six
// boxes, so it does not additionally assert they are non-magic.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Sandwich clues, transcribed from the drawn outside-clue totals.
const sandwiches = [
  Sandwich.fromCells(11, graph.row(1), geometry),
  Sandwich.fromCells(0, graph.row(4), geometry),
  Sandwich.fromCells(11, graph.row(6), geometry),
  Sandwich.fromCells(24, graph.row(9), geometry),
  Sandwich.fromCells(11, graph.column(4), geometry),
  Sandwich.fromCells(27, graph.column(6), geometry),
  Sandwich.fromCells(12, graph.column(9), geometry),
];

// Magic-square constraint for one box: EqualSum over its 3 rows, 3 columns,
// and 2 diagonals (8 segments). The box's own all-different then forces the
// common sum to 15 by itself -- no separate total needs stating.
function magicSquare(boxCells) {
  const rows = [
    boxCells.slice(0, 3),
    boxCells.slice(3, 6),
    boxCells.slice(6, 9),
  ];
  const cols = [0, 1, 2].map(c => [boxCells[c], boxCells[c + 3], boxCells[c + 6]]);
  const diag1 = [boxCells[0], boxCells[4], boxCells[8]];
  const diag2 = [boxCells[2], boxCells[4], boxCells[6]];
  return new EqualSum(...rows, ...cols, diag1, diag2);
}

function combinations(arr, k) {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [head, ...rest] = arr;
  const withHead = combinations(rest, k - 1).map(c => [head, ...c]);
  const withoutHead = combinations(rest, k);
  return [...withHead, ...withoutHead];
}

const boxes = graph.boxes();
const magicChoices = new Or(
  combinations(boxes, 3).map(triple => new And(triple.map(magicSquare)))
);

return [
  ...sandwiches,
  magicChoices,
];
