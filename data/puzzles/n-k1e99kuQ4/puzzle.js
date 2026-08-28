// Title: Please Find My Sandwiches
// Author: Unknown
// Video: https://www.youtube.com/watch?v=n-k1e99kuQ4
// Source: https://cracking-the-cryptic.web.app/sudoku/gMBNmQBjBM

// Normal sudoku rules apply. The two long diagonals each contain 1-9
// (Diagonal). Cages show their sums with no repeated digit inside a cage
// (Cage). The clues outside the grid give the sum of the digits strictly
// between the cell holding digit X and the cell holding digit Y in that
// row/column, where X and Y are two distinct digits (1-9) that are not
// given directly -- they must be identified, and the same X and Y are used
// for every outside clue (a single "mystery" bread pair, not the usual 1
// and 9). This reading is forced, not assumed: if X and Y were instead
// taken from the row/column's own crossing points with the two marked
// diagonals (main diagonal at column = row, anti-diagonal at column =
// 10 - row), their column gap is always even (0 at row 5, otherwise >= 2),
// so a "between" sum of 0 could never occur -- yet the R2 clue is 0. A
// shared, solver-identified X/Y pair is consistent with every clue instead.

const graph = cellGraph('9x9');

// Two abstract Var cells hold the shared "bread" digits X and Y. They are
// not grid cells; the overlay's two anchor cells are arbitrary and only
// used to create the pair.
const bread = graph.makeOverlay('VXY', ['R1C1', 'R1C2']);
const [breadX, breadY] = bread.cells();

// Cages -- provenance: sums and cells read from the drawn cage outlines,
// all 2-3 cell killer cages with no repeated digit inside a cage (Cage's
// default semantics).
const cages = [
  [9, ['R1C4', 'R1C5', 'R1C6']],
  [15, ['R7C5', 'R7C6']],
  [15, ['R8C5', 'R8C6']],
  [14, ['R9C7', 'R9C8']],
  [6, ['R6C2', 'R6C3']],
  [6, ['R6C4', 'R6C5']],
  [5, ['R7C1', 'R7C2']],
  [5, ['R7C3', 'R8C3']],
  [15, ['R3C2', 'R3C3']],
  [14, ['R2C1', 'R2C2']],
];

// Outside "mystery sandwich" clues -- provenance: printed number and lane
// read from the drawn outside-clue overlays: top clues give a column, left
// clues give a row.
const outsideClues = [
  { target: 2, cells: graph.column(1) },
  { target: 0, cells: graph.row(2) },
  { target: 1, cells: graph.row(6) },
  { target: 19, cells: graph.column(3) },
  { target: 32, cells: graph.column(4) },
  { target: 14, cells: graph.column(5) },
  { target: 13, cells: graph.column(7) },
];

// Builds an NFA for one outside clue. The sequence fed to the NFA is
// [X, Y, ...lineCells]: the first two symbols read the shared bread digits
// (any value 1-9, remembered as the unordered pair {lo, hi}), then the
// line is scanned left-to-right (or top-to-bottom): 'before' the first
// bread digit is seen, 'between' the two bread digits (accumulating their
// sum, killing any branch that would exceed the target), then 'after' the
// second (pass-through). Accept iff the second bread digit was found and
// the accumulated sum equals the target exactly.
function sandwichSpec(target) {
  return NFA.encodeSpec({
    startState: { phase: 'readX' },
    transition: (state, value) => {
      if (state.phase === 'readX') return { phase: 'readY', x: value };
      if (state.phase === 'readY') {
        return {
          phase: 'before',
          lo: Math.min(state.x, value),
          hi: Math.max(state.x, value),
        };
      }
      if (state.phase === 'before') {
        if (value === state.lo || value === state.hi) {
          return { phase: 'between', lo: state.lo, hi: state.hi, sum: 0 };
        }
        return state;
      }
      if (state.phase === 'between') {
        if (value === state.lo || value === state.hi) {
          return { phase: 'after', sum: state.sum };
        }
        const sum = state.sum + value;
        // Dead branch: adding this cell already exceeds the target, and the
        // sum only grows from here.
        if (sum > target) return undefined;
        return { phase: 'between', lo: state.lo, hi: state.hi, sum };
      }
      // phase === 'after': remaining cells are outside the sandwich.
      return state;
    },
    accept: (state) => state.phase === 'after' && state.sum === target,
  }, 9);
}

return [
  new Shape('9x9'),

  bread.toVar('mystery sandwich bread (X, Y)'),
  // AllDifferent(X, Y) is implied by X < Y; the ordering also breaks the
  // otherwise-inert X/Y-swap symmetry (the rule never distinguishes which
  // of the pair is "X" vs "Y"), so the search does not report the same grid
  // twice under the two labellings of the same bread pair.
  new Pair(Pair.fnToKey((a, b) => a < b, 9), 'bread order', breadX, breadY),

  new Diagonal(1),
  new Diagonal(-1),

  ...cages.map(([sum, cells]) => new Cage(sum, ...cells)),

  ...outsideClues.map(({ target, cells }, i) =>
    new NFA(sandwichSpec(target), `Sandwich${i}`, breadX, breadY, ...cells)),
];
