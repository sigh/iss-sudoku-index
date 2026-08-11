// Title: Spl/it X-sums
// Author: 28 degrees
// Video: https://www.youtube.com/watch?v=VZQ1jdBjwvA
// Source: https://app.crackingthecryptic.com/sudoku/2jrpnNd2DD

// Normal sudoku (default 9x9 Shape: rows, columns, and the nine 3x3 boxes
// are all-different). No given digits.
//
// Rules: "The digits before an equals sign have the same sum as the digits
// after, and the equation includes X in the first or last cell of the
// row/column, where X is the total number of digits used in the equation."
// There is no separate printed clue number anywhere in the payload -- every
// mark is a plain "=" (row split) or "||" (column split) badge on a grid
// edge with no digit -- so "X" is read purely as the value already sitting
// in that row/column's own first or last cell. "Total number of digits
// used in the equation" is read literally: the equation need not span the
// whole row/column, only the run of X cells counted in from whichever end
// contains X, so a row/column can carry more than one independent equation
// (row 2 does, one near each end).
//
// splitXSumOr(lineCells, k) builds one row's or column's equation as an Or
// over every way to satisfy it: the drawn split sits between position k and
// k+1 (1-indexed) along lineCells. "The equation includes X in the first or
// last cell" is encoded as written -- a disjunction over both ends, not a
// choice between them:
//  - first-cell anchor: X = lineCells[0]'s digit; the equation runs from
//    position 1 to position X (X in [k+1, 9] so both sides of the split are
//    non-empty); before = positions 1..k, after = positions k+1..X.
//  - last-cell anchor: X = lineCells[8]'s digit; the equation runs from
//    position (10-X) to position 9 (X in [10-k, 9]); before = positions
//    (10-X)..k, after = positions k+1..9 (fixed, touching the anchor).
// Each candidate X pins the anchor cell to that literal value (Given) and
// asserts the two sides sum equal (EqualSum); the whole thing is an Or of
// those And branches.
function splitXSumOr(lineCells, k) {
  const branches = [];
  for (let X = k + 1; X <= 9; X++) {
    const before = lineCells.slice(0, k);
    const after = lineCells.slice(k, X);
    branches.push(new And([
      new Given(lineCells[0], X),
      new EqualSum(before, after),
    ]));
  }
  for (let X = 10 - k; X <= 9; X++) {
    const near = lineCells.slice(k, 9);
    const far = lineCells.slice(9 - X, k);
    branches.push(new And([
      new Given(lineCells[8], X),
      new EqualSum(far, near),
    ]));
  }
  return new Or(branches);
}

const graph = cellGraph('9x9');

// Row splits ("="): [row, split position k = cells before the mark].
// Transcribed from the drawn "=" edge badges (edge between C(k) and C(k+1)).
const rowSplits = [
  [1, 3], // R1: edge(R1C3, R1C4)
  [2, 2], // R2: edge(R2C2, R2C3)
  [2, 6], // R2: edge(R2C6, R2C7) -- row 2's second, independent equation
  [3, 3], // R3: edge(R3C3, R3C4)
  [4, 3], // R4: edge(R4C3, R4C4)
  [9, 4], // R9: edge(R9C4, R9C5)
];

// Column splits ("||"): [col, split position k = cells before the mark].
// Transcribed from the drawn "||" edge badges (edge between R(k) and R(k+1)).
const colSplits = [
  [2, 1], // C2: edge(R1C2, R2C2)
  [4, 2], // C4: edge(R2C4, R3C4)
  [5, 2], // C5: edge(R2C5, R3C5)
  [6, 7], // C6: edge(R7C6, R8C6)
  [1, 6], // C1: edge(R6C1, R7C1)
  [8, 5], // C8: edge(R5C8, R6C8)
  [9, 6], // C9: edge(R6C9, R7C9)
];

return [
  new Shape('9x9'),
  ...rowSplits.map(([row, k]) => splitXSumOr(graph.row(row), k)),
  ...colSplits.map(([col, k]) => splitXSumOr(graph.column(col), k)),
];
