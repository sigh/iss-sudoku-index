// Title: Oopsy
// Author: ArchieG
// Video: https://www.youtube.com/watch?v=vWRpSi-X2-E
// Source: https://app.crackingthecryptic.com/Hgnj2QNJPj

// Normal sudoku rules apply, except exactly one cell holds an erroneous digit
// that duplicates a digit already in its row, column and box, replacing the
// correct digit there. Every other row, column and box stays all-different.
// A main grid's rows/columns/boxes are unconditionally all-different, which
// cannot express the one-duplicate exception, so the grid is Raw and every
// rule is stated explicitly below. Digits within the marked cage and the
// given cells are error-free. Marked X's join orthogonally adjacent cells
// summing to 10; the cage totals 52 at its top-left cell, and cage digits
// may repeat.
//
// "Digits separated by an 'x' sum to 10, and all are given" is ambiguous
// about what "all are given" qualifies: read as a negative (every unmarked
// adjacent pair does NOT sum to 10) or as marking X-endpoint cells
// error-free, both reject the source solution; only the direct reading
// (marked X's sum to 10, nothing said about unmarked pairs) accepts it. The
// sentence's own intent is still not decidable from the text, so it is left
// omitted rather than encoded either way.

const shape = new Shape('9x9', '1-9', 'Raw');
const graph = cellGraph(shape);
const boxes = [];
for (let r = 1; r <= 9; r += 3) {
  for (let c = 1; c <= 9; c += 3) boxes.push(graph.block(makeCellId(r, c), 3, 3));
}
const units = [...graph.rows(), ...graph.columns(), ...boxes];
const cellAt = (r, c) => makeCellId(r, c); // r, c: 1-indexed

// Givens, from the puzzle's stored givens.
const givens = [
  [1, 4, 8], [4, 2, 7], [7, 7, 5], [8, 9, 1], [9, 4, 3], [9, 5, 6],
];
const givenCells = givens.map(([r, c]) => cellAt(r, c));

// The marked cage, from the drawn cage's cell list; total is its top-left cell.
const cageCellCoords = [
  [1, 6], [2, 6], [3, 6], [3, 7], [3, 8], [3, 9], [4, 7], [4, 8],
];
const cageCells = cageCellCoords.map(([r, c]) => cellAt(r, c));

// For a selected error cell, each unit containing it has an otherwise
// all-different remainder plus one equal partner (the duplicate); every unit
// not containing it stays fully all-different.
const errorCase = error => new And(units.flatMap(unit => {
  if (!unit.includes(error)) return [new AllDifferent(...unit)];
  const rest = unit.filter(c => c !== error);
  return [new AllDifferent(...rest), new Or(rest.map(c => new SameValues(2, error, c)))];
}));

// The error cell cannot be a given or a cage cell (both stated error-free).
const protectedCoords = new Set(
  [...givens.map(([r, c]) => [r, c]), ...cageCellCoords].map(([r, c]) => `${r},${c}`));
const candidates = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    if (!protectedCoords.has(`${r},${c}`)) candidates.push(cellAt(r, c));
  }
}

// Marked X pairs, from the drawn overlay edges; native X enforces sum-to-10
// over adjacent cells and validates the pair is actually adjacent.
const markedX = [
  [3, 2, 4, 2], [2, 6, 3, 6], [3, 6, 3, 7], [3, 7, 4, 7], [4, 7, 4, 8],
  [2, 8, 3, 8], [5, 8, 6, 8], [7, 8, 7, 9], [8, 8, 9, 8], [6, 6, 7, 6],
  [6, 6, 6, 7], [5, 6, 5, 7], [5, 4, 5, 5], [6, 4, 7, 4], [6, 3, 7, 3],
  [6, 1, 6, 2], [8, 1, 8, 2], [8, 3, 8, 4], [7, 5, 7, 6], [1, 5, 1, 6],
  [2, 4, 3, 4], [3, 3, 3, 4],
];
const xPairs = markedX.map(([r1, c1, r2, c2]) =>
  new X(cellAt(r1, c1), cellAt(r2, c2)));

return [
  shape,
  ...givenCells.map((cell, i) => new Given(cell, givens[i][2])),
  new Sum(52, ...cageCells),
  ...xPairs,
  new Or(candidates.map(errorCase)),
];
