// Title: Taking Positives from the Negatives
// Author: Unknown
// Video: https://www.youtube.com/watch?v=NTAVE31wD5U
// Source: https://cracking-the-cryptic.web.app/sudoku/QTg2jd4FNH

// Normal sudoku rules apply. Any instance of orthogonally neighbouring cells
// summing to 5, 10 or 15 is marked with V (5), X (10) or XV (15) between the
// cells; an unmarked neighbouring pair does not sum to 5, 10 or 15. That is
// an exhaustive-marking negative over all three sums, so every unmarked
// adjacent pair in the grid gets the negated predicate below. No built-in
// class covers a three-way (5/10/15) exhaustive negative -- the closest
// native class negates only 5 and 10 -- so it is built directly as a
// negated-predicate Pair over every unmarked edge.

const shape = new Shape('9x9');

const givens = [
  new Given('R2C1', 3),
  new Given('R2C7', 2),
  new Given('R3C9', 8),
  new Given('R4C3', 7),
  new Given('R8C5', 1),
  new Given('R8C6', 7),
];

// The three drawn marks (text on a cell-pair edge).
const marked = [
  new V('R5C4', 'R6C4'),
  new X('R5C5', 'R6C5'),
  new Sum(15, 'R5C6', 'R6C6'),
];

// Negative: every other orthogonally adjacent pair must not sum to 5, 10, or
// 15. Two Replicate templates (horizontal offset, vertical offset) cover all
// 144 adjacent pairs; the 3 marked pairs above are excluded from their
// target list.
const graph = cellGraph('9x9');
const notMarkedKey = Pair.fnToKey(
  (a, b) => a + b !== 5 && a + b !== 10 && a + b !== 15, shape);

// Horizontal: pair (r,c)-(r,c+1) for every row, all 72 -- none marked.
const horizTargets = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 8; c++) horizTargets.push(makeCellId(r, c));
}
const horizNegative = graph.makeReplicate(
  [new Pair(notMarkedKey, 'not V/X/XV', 'R1C1', 'R1C2')],
  horizTargets,
);

// Vertical: pair (r,c)-(r+1,c) for every column, 72 minus the 3 marked
// pairs (R5C4-R6C4, R5C5-R6C5, R5C6-R6C6), all vertical, in the centre box.
const markedVerticalStarts = new Set(['R5C4', 'R5C5', 'R5C6']);
const vertTargets = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 9; c++) {
    const id = makeCellId(r, c);
    if (markedVerticalStarts.has(id)) continue;
    vertTargets.push(id);
  }
}
const vertNegative = graph.makeReplicate(
  [new Pair(notMarkedKey, 'not V/X/XV', 'R1C1', 'R2C1')],
  vertTargets,
);

return [shape, ...givens, ...marked, horizNegative, vertNegative];
