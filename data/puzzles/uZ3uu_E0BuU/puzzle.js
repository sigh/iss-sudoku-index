// Title: Unknown
// Author: Jesper Josefsson
// Video: https://www.youtube.com/watch?v=uZ3uu_E0BuU
// Source: https://cracking-the-cryptic.web.app/sudoku/RPdNfMq8FQ
//
// Normal Sudoku rules apply. Nine diagonals carry a clue "T[S]": T is the sum
// of all digits on the diagonal; S is the sum of the digits strictly between
// the diagonal's highest digit and its lowest digit (excluding those two
// digits). S is "-" when the highest digit, the lowest digit, or both, occur
// more than once on the diagonal (no unique pair of extreme cells to
// sandwich between). T is sometimes omitted, leaving only "[S]". Digits are
// not otherwise forced distinct along a diagonal -- no diagonal
// all-different rule is stated, so only each cell's row/column/box applies.
//
// Each diagonal's cell list below is transcribed from the drawn arrow path;
// traversal direction does not matter to T or S.

const LT = Pair.fnToKey((a, b) => a < b, 9);
const GT = Pair.fnToKey((a, b) => a > b, 9);
const GE = Pair.fnToKey((a, b) => a >= b, 9);

// cells[i] strictly less than every other cell in the list -- i.e. cells[i]
// is the diagonal's unique lowest digit.
function uniqueMinAt(cells, i) {
  return cells
    .filter((_, k) => k !== i)
    .map(other => new Pair(LT, 'diag-min', cells[i], other));
}

// cells[j] strictly greater than every other cell -- the unique highest digit.
function uniqueMaxAt(cells, j) {
  return cells
    .filter((_, k) => k !== j)
    .map(other => new Pair(GT, 'diag-max', cells[j], other));
}

// cells[p] and cells[q] are equal, and both are <= every other cell: they
// are two (of possibly more) cells tied for the diagonal's lowest digit.
function tiedAtMin(cells, p, q) {
  const others = cells.filter((_, k) => k !== p && k !== q);
  return [
    new SameValues(2, cells[p], cells[q]),
    ...others.map(o => new Pair(GE, 'diag-min-tie', o, cells[p])),
  ];
}

// cells[p] and cells[q] are equal, and both are >= every other cell: tied
// for the diagonal's highest digit.
function tiedAtMax(cells, p, q) {
  const others = cells.filter((_, k) => k !== p && k !== q);
  return [
    new SameValues(2, cells[p], cells[q]),
    ...others.map(o => new Pair(GE, 'diag-max-tie', cells[p], o)),
  ];
}

// Build the constraints for one "T[S]" diagonal clue.
// T: total sum, or null when omitted. S: sandwich sum, or '-' when undefined.
function diagonalClue(cells, T, S) {
  const n = cells.length;
  const out = [];
  if (T !== null) out.push(new Sum(T, ...cells));

  if (S === '-') {
    // The highest digit repeats, or the lowest digit repeats (or both):
    // some pair of cells is tied for the min, or some pair is tied for the
    // max. Enumerate every unordered pair as the tied witnesses.
    const branches = [];
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        branches.push(new And(tiedAtMin(cells, p, q)));
        branches.push(new And(tiedAtMax(cells, p, q)));
      }
    }
    out.push(new Or(branches));
  } else {
    // Both the highest and lowest digit are unique. Enumerate every ordered
    // pair (i = position of the unique min, j = position of the unique max)
    // and require the digits strictly between them (by position) to sum to
    // S. A branch is dropped when S cannot possibly fit the gap between i
    // and j -- the gap's digits are each in 1..9 (and, from the min/max
    // constraints in the same branch, strictly between the min and max
    // values), so a branch whose S falls outside [gap*1, gap*9] can never
    // be satisfied and is pruned rather than left for the solver to refute.
    const branches = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const lo = Math.min(i, j), hi = Math.max(i, j);
        const between = cells.slice(lo + 1, hi);
        const gap = between.length;
        if (gap === 0) {
          if (S !== 0) continue;
          branches.push(new And([...uniqueMinAt(cells, i), ...uniqueMaxAt(cells, j)]));
        } else {
          if (S < gap * 1 || S > gap * 9) continue;
          branches.push(new And([
            ...uniqueMinAt(cells, i), ...uniqueMaxAt(cells, j),
            new Sum(S, ...between),
          ]));
        }
      }
    }
    out.push(new Or(branches));
  }
  return out;
}

const diagonals = [
  // [cells, T, S] -- one row per drawn diagonal clue "T[S]".
  [['R1C6', 'R2C7', 'R3C8', 'R4C9'], null, '-'],
  [['R6C9', 'R7C8', 'R8C7', 'R9C6'], 10, '-'],
  [['R7C9', 'R8C8', 'R9C7'], 18, 8],
  [['R9C9', 'R8C8', 'R7C7', 'R6C6', 'R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C1'], 54, 30],
  [['R9C6', 'R8C5', 'R7C4', 'R6C3', 'R5C2', 'R4C1'], 17, 7],
  [['R6C1', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C6'], null, 0],
  [['R5C1', 'R4C2', 'R3C3', 'R2C4', 'R1C5'], 26, 16],
  [['R4C1', 'R3C2', 'R2C3', 'R1C4'], 11, '-'],
  [['R3C1', 'R2C2', 'R1C3'], 11, 2],
];

return [
  new Shape('9x9'),
  ...diagonals.flatMap(([cells, T, S]) => diagonalClue(cells, T, S)),
];
