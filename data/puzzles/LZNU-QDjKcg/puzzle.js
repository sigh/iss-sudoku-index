// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=LZNU-QDjKcg
// Source: https://cracking-the-cryptic.web.app/sudoku/QtTFnMHh8L

// Rules as published with the puzzle: normal sudoku rules apply; for 1-8, each
// marked number N appears N cells away in either a horizontal or vertical
// direction (not both); 9s obey the king's move constraint, both as regards
// each other and marked 9s.
//
// The board carries no given digits. Its only clues are 32 grey badges, each
// printing one number 1-9 inside a single cell.
//
// Marks 1-8. The printed number N must appear as a digit exactly N cells from
// the marked cell, along that cell's own row or its own column. Nothing claims
// the marked cell holds N, and it cannot: it would share a row or a column
// with the cell N away.
//
// "(not both)" is read here as excluding a combined horizontal-and-vertical
// (diagonal) displacement, so only the four orthogonal targets are offered. The
// competing reading makes it exclusive - N at exactly one of those targets -
// which is strictly stronger, so the disjunction below is what both readings
// agree on.
//
// Marks 9 and the digit 9. "The king's move constraint" is the usual anti-king
// relation - two cells a king's move apart do not repeat a digit - applied to
// the digit 9 alone, and extended so that no 9 stands a king's move from a
// cell marked 9. The 1-8 rule cannot reach 9 on a 9x9 board: nine cells in any
// direction always leaves the grid, which is why the rules carve 9 out.

const SIZE = 9;
const NON_NINE = [1, 2, 3, 4, 5, 6, 7, 8];
const graph = cellGraph('9x9');

// The 32 badges as [row, col, printed number], transcribed from the grey
// rounded number markers drawn one to a cell.
const marks = [
  [1, 3, 5], [1, 7, 3],
  [2, 1, 8], [2, 4, 6], [2, 5, 7], [2, 9, 1],
  [3, 1, 7], [3, 2, 6], [3, 8, 9], [3, 9, 2],
  [4, 2, 5], [4, 3, 4], [4, 6, 3], [4, 9, 9],
  [5, 3, 3], [5, 4, 2], [5, 6, 4], [5, 7, 6],
  [6, 1, 6], [6, 4, 1], [6, 7, 4], [6, 8, 2],
  [7, 1, 3], [7, 2, 9], [7, 8, 1], [7, 9, 6],
  [8, 1, 1], [8, 5, 2], [8, 6, 7], [8, 9, 8],
  [9, 3, 8], [9, 7, 2],
];

// One mark, one disjunction: the digit N sits N steps left, right, up or down
// of the badge, over whichever of those four cells stay on the board.
function markConstraint(row, col, n) {
  const from = makeCellId(row, col);
  const branches = [[0, -n], [0, n], [-n, 0], [n, 0]]
    .map(([dr, dc]) => graph.step(from, dr, dc))
    .filter((cell) => cell !== null)
    .map((cell) => new Given(cell, n));
  return new Or(branches);
}

// Every diagonal run of the board, walked top to bottom; dc = +1 goes
// down-right, dc = -1 down-left. Runs of one cell carry no pair and are
// dropped.
function diagonalRuns(dc) {
  const starts = [];
  for (let c = 1; c <= SIZE; c++) starts.push(makeCellId(1, c));
  for (let r = 2; r <= SIZE; r++) starts.push(makeCellId(r, dc === 1 ? 1 : SIZE));
  return starts
    .map((start) => graph.ray(start, 1, dc))
    .filter((cells) => cells.length >= 2);
}

// Forbids the pair (9, 9); every other combination is left free.
const NOT_BOTH_NINE = Pair.fnToKey((a, b) => !(a === 9 && b === 9), SIZE);

// Two 9s a king's move apart are barred. Orthogonal king pairs already share a
// row or a column, so only the diagonal pairs need stating; Pair binds
// consecutive cells of its list, so one call per diagonal run covers every
// diagonally adjacent pair along it.
const nineAntiKing = [...diagonalRuns(1), ...diagonalRuns(-1)]
  .map((cells) => new Pair(NOT_BOTH_NINE, 'no two 9s diagonally adjacent', ...cells));

// A 9 may not stand a king's move from a badge printing 9.
const besideMarkedNine = [...new Set(
  marks.filter(([, , n]) => n === 9)
    .flatMap(([r, c]) => graph.kingNeighbours(makeCellId(r, c))))];

return [
  new Shape('9x9'),

  ...marks.filter(([, , n]) => n <= 8).map(([r, c, n]) => markConstraint(r, c, n)),

  ...besideMarkedNine.map((cell) => new Given(cell, ...NON_NINE)),

  ...nineAntiKing,
];
