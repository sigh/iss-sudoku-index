// Title: Oopsy
// Author: ArchieG
// Video: https://www.youtube.com/watch?v=vWRpSi-X2-E
// Source: https://app.crackingthecryptic.com/Hgnj2QNJPj

// Rules, and how each is encoded below.
//
// "Normal sudoku rules apply HOWEVER there is a mistake in 1 and only 1 cell.
// This means it appears twice in its row, column and box; replacing a
// different digit." The finished grid therefore breaks row/column/box
// all-different at exactly one cell. A Sudoku grid's rows, columns and boxes
// are unconditionally all-different, so the grid is the `Raw` type -- cells
// with no implicit rules -- and every unit rule is stated explicitly.
//
// "Digits separated by an 'x' sum to 10, and all are given." The 22 drawn X's
// are sum-to-10 pairs; "all are given" makes the marking exhaustive, so every
// orthogonally adjacent pair with no X must NOT sum to 10. Only X is defined
// by this ruleset (no V's), so the negative covers sum 10 and nothing else --
// hence explicit per-edge Pairs rather than StrictXV, which would also forbid
// unmarked pairs summing to 5.
//
// "Digits in a cage sum to the number in the top left corner - digits in a
// cage MAY repeat." One cage, total 52, encoded as Sum (repeats allowed).
//
// "Digits within cages and given digits are error-free." The erroneous cell is
// neither a cage cell nor a given, which is how the candidate list below is
// built.
//
// Every rule above is read against the grid that is filled in, the one holding
// the mistake; the rules text describes no second, corrected grid.

const shape = new Shape('9x9', '1-9', 'Raw');
const graph = cellGraph(shape);
const boxes = [];
for (let r = 1; r <= 9; r += 3) {
  for (let c = 1; c <= 9; c += 3) boxes.push(graph.block(makeCellId(r, c), 3, 3));
}
const units = [...graph.rows(), ...graph.columns(), ...boxes];
const cellAt = (r, c) => makeCellId(r, c); // r, c: 1-indexed

// Givens, from the payload's filled cells.
const givens = [
  [1, 4, 8], [4, 2, 7], [7, 7, 5], [8, 9, 1], [9, 4, 3], [9, 5, 6],
];

// The single drawn cage; its total is printed in its top-left cell.
const cageCellCoords = [
  [1, 6], [2, 6], [3, 6], [3, 7], [3, 8], [3, 9], [4, 7], [4, 8],
];
const cageCells = cageCellCoords.map(([r, c]) => cellAt(r, c));

// The 22 drawn X marks, each as the pair of cells its edge separates.
const markedX = [
  [3, 2, 4, 2], [2, 6, 3, 6], [3, 6, 3, 7], [3, 7, 4, 7], [4, 7, 4, 8],
  [2, 8, 3, 8], [5, 8, 6, 8], [7, 8, 7, 9], [8, 8, 9, 8], [6, 6, 7, 6],
  [6, 6, 6, 7], [5, 6, 5, 7], [5, 4, 5, 5], [6, 4, 7, 4], [6, 3, 7, 3],
  [6, 1, 6, 2], [8, 1, 8, 2], [8, 3, 8, 4], [7, 5, 7, 6], [1, 5, 1, 6],
  [2, 4, 3, 4], [3, 3, 3, 4],
];
const markedEdges = new Set(markedX.map(
  ([r1, c1, r2, c2]) => [cellAt(r1, c1), cellAt(r2, c2)].sort().join('|')));
const isMarked = (a, b) => markedEdges.has([a, b].sort().join('|'));

// Unmarked edges = every orthogonal adjacency minus the drawn X list, split by
// direction so each direction replicates from one template. Every horizontal
// edge is named by its left cell and every vertical edge by its upper cell, so
// R1C1 is the earliest target in both groups and can serve as the origin.
// The negated X predicate: an unmarked adjacent pair must not total 10.
const notTen = Pair.fnToKey((a, b) => a + b !== 10, shape);
const origin = cellAt(1, 1);
const strictX = [[0, 1], [1, 0]].map(([dR, dC]) => {
  const targets = graph.cells().filter(cell => {
    const other = graph.step(cell, dR, dC);
    return other !== null && !isMarked(cell, other);
  });
  return new Replicate(
    [new Pair(notTen, 'not 10', origin, graph.step(origin, dR, dC))],
    Replicate.encodeTargetCells(targets, origin, graph),
    origin);
});

// For the chosen error cell, each unit containing it holds an all-different
// remainder plus one cell the error cell duplicates; every other unit is
// all-different outright. Only the error cell's own row, column and box may
// repeat a digit, and each repeats exactly one, exactly twice.
const errorCase = error => new And(units.flatMap(unit => {
  if (!unit.includes(error)) return [new AllDifferent(...unit)];
  const rest = unit.filter(c => c !== error);
  return [new AllDifferent(...rest), new Or(rest.map(c => new SameValues(2, error, c)))];
}));

const errorFree = new Set(
  [...givens.map(([r, c]) => cellAt(r, c)), ...cageCells]);
const candidates = graph.cells().filter(cell => !errorFree.has(cell));

return [
  shape,
  ...givens.map(([r, c, v]) => new Given(cellAt(r, c), v)),
  new Sum(52, ...cageCells),
  ...markedX.map(([r1, c1, r2, c2]) => new X(cellAt(r1, c1), cellAt(r2, c2))),
  ...strictX,
  new Or(candidates.map(errorCase)),
];
