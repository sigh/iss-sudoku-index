// Title: Rectangle Sums
// Author: FIT7Y
// Video: https://www.youtube.com/watch?v=T03vUTiJBjk
// Source: https://sudokupad.app/xqqerfk832

// Normal sudoku rules apply. Fifteen rectangles are drawn in the grid, but
// only their upper-left and bottom-right corners are shown; each shown
// upper-left corner is labelled with the sum of the digits inside its
// rectangle, and pairs with exactly one of the fifteen shown (unlabelled)
// bottom-right corners. Which bottom-right corner belongs to which
// upper-left corner is not given directly - it is itself part of the
// solve, so the encoding must let the solver choose it rather than fixing
// a pairing in advance.
//
// Each upper-left corner gets a Var (VR1..VR15) whose value selects which
// of the fifteen bottom-right corners closes its rectangle; AllDifferent
// over those Vars enforces the one-to-one correspondence between corners.
// For each (top-left, chosen bottom-right) combination an And of a Sum
// over that rectangle's cells and a Given fixing the Var records the
// choice; Or lets the solver pick whichever bottom-right makes that
// upper-left corner's rectangle valid.
//
// The candidate bottom-rights for each upper-left are pruned to those that
// are geometrically and arithmetically possible; both prunings follow from
// the puzzle rules alone (not from any known solution):
//   1. Strict corner geometry. An "upper-left" corner is strictly above and
//      to the left of its own "bottom-right" corner, so a candidate must
//      satisfy row1 > row0 and col1 > col0.
//   2. Sum bounds from row/column all-different. A rectangle of h rows by w
//      cols is w column-segments of h distinct digits (one column is
//      all-different) and also h row-segments of w distinct digits. So its
//      digit total lies in [max(w*T(h), h*T(w)), min(w*S(h), h*S(w))], where
//      T(k)=1+..+k is the smallest and S(k)=9+..+(10-k) the largest sum of k
//      distinct digits 1-9. A candidate whose rectangle cannot reach the
//      labelled sum can never satisfy it and is dropped. This never removes a
//      real pairing (each labelled sum stays reachable by its true rectangle),
//      so the known solution is still accepted; it only discards branches that
//      are impossible under sudoku's own row/column constraints.

const topLefts = [
  ["R1C1", 81], ["R1C2", 170], ["R1C3", 74], ["R1C4", 150], ["R1C5", 141],
  ["R1C6", 65], ["R1C7", 111], ["R1C8", 62], ["R2C1", 120], ["R3C1", 188],
  ["R4C1", 241], ["R5C1", 175], ["R6C1", 116], ["R7C1", 34], ["R8C1", 26],
];

const bottomRights = [
  'R2C9', 'R3C9', 'R4C4', 'R4C9', 'R5C9',
  'R6C9', 'R7C9', 'R8C9', 'R9C2', 'R9C3',
  'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8',
];

const K = topLefts.length;

function* rangeI(from, to) {
  for (let i = from; i <= to; i++) {
    yield i;
  }
}

// Smallest / largest sum of k distinct digits drawn from 1..9.
const minK = k => (k * (k + 1)) / 2;
const maxK = k => (k * (19 - k)) / 2;

const graph = cellGraph("9x9");
const rectangle = (topLeft, bottomRight) => {
  const [rc1, rc2] = [topLeft, bottomRight].map(parseCellId);
  return graph.block(topLeft, rc2.row - rc1.row + 1, rc2.col - rc1.col + 1);
};

// A bottom-right is a feasible partner for a labelled upper-left only when it
// is strictly down-and-right and the rectangle's forced digit-sum range can
// contain the label. Both tests come from the rules, not the known grid.
const feasible = (topLeft, bottomRight, sum) => {
  const [rc1, rc2] = [topLeft, bottomRight].map(parseCellId);
  const h = rc2.row - rc1.row + 1;
  const w = rc2.col - rc1.col + 1;
  if (h < 2 || w < 2) return false;
  const lo = Math.max(w * minK(h), h * minK(w));
  const hi = Math.min(w * maxK(h), h * maxK(w));
  return lo <= sum && sum <= hi;
};

const rectangleVar = new Var("R", "Rectangle", K);

const allCells = rectangle("R1C1", "R9C9");
const allCellsOrigin = allCells[0];

return [
  new Shape("9x9", K),
  new Replicate(
    [new Given(allCellsOrigin, ...rangeI(1, 9))],
    Replicate.encodeTargetCells(allCells, allCellsOrigin, graph),
    allCellsOrigin,
  ),
  rectangleVar,
  new AllDifferent(...rectangleVar.cells()),
  ...topLefts.map(([topLeft, sum], i) => new Or(
    bottomRights
      .map((bottomRight, j) => ({ bottomRight, value: j + 1 }))
      .filter(({ bottomRight }) => feasible(topLeft, bottomRight, sum))
      .map(({ bottomRight, value }) => new And([
        new Sum(sum, ...rectangle(topLeft, bottomRight)),
        new Given(rectangleVar.cell(i + 1), value),
      ]))
  ))
];
