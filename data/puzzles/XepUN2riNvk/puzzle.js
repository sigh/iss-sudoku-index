// Title: Gravity
// Author: mnasti2
// Video: https://www.youtube.com/watch?v=XepUN2riNvk
// Source: https://app.crackingthecryptic.com/sudoku/BrHHMMrtTB

// Normal sudoku on a 9x9 grid. No digit is given.
//
// Every clue of the original puzzle has fallen straight down out of the bottom
// of the grid: a clue keeps its columns and its shape and moves only
// vertically. No two clues ever overlapped, and no clue ever passed through
// another. The clues are drawn only where they came to rest, heaped below the
// grid, so each clue's columns are known but its original rows are not.
//
// Digits in a cage do not repeat and sum to the cage's total. Along a
// thermometer digits increase from the bulb end.
//
// The board is the reconstructed 9x9 sudoku; the heap is not part of it. The
// fallen clues are therefore listed below in the source canvas's own
// coordinates -- the grid is canvas rows 1-9, the heap canvas rows 11-16 -- and
// every clue is put back into the grid by the constraints, not by hand.

const GRID_SIZE = 9;

// Cages as drawn in the heap: [total, ...[row, col]], canvas coordinates.
const HEAP_CAGES = [
  [5, [15, 1], [16, 1]],
  [10, [15, 2], [16, 2]],
  [5, [14, 1], [14, 2]],
  [6, [13, 1], [13, 2]],
  [13, [11, 1], [12, 1]],
  [5, [11, 2], [12, 2]],
  [14, [11, 3], [12, 3]],
  [21, [13, 3], [13, 4], [14, 4]],
  [13, [13, 5], [14, 5]],
  [22, [11, 6], [12, 5], [12, 6]],
  [30, [15, 4], [15, 5], [15, 6], [15, 7]],
  [14, [16, 5], [16, 6]],
  [8, [15, 8], [16, 7], [16, 8]],
  [8, [13, 8], [13, 9], [14, 8]],
  [9, [12, 8], [12, 9]],
];

// Thermometers as drawn in the heap, bulb cell first, canvas coordinates.
// The grey circle in the source marks the bulb end of each stroke.
const HEAP_THERMOS = [
  [[16, 4], [16, 3], [15, 3], [14, 3]],
  [[14, 6], [13, 6], [13, 7], [14, 7]],
  [[16, 9], [15, 9], [14, 9]],
];

// A clue is its heap footprint plus the constraint it imposes once replaced.
// `top` is its topmost heap row: shifting the whole footprint so that `top`
// lands on grid row `t` is the only freedom the fall leaves.
const makeClue = (cells, make) => {
  const rows = cells.map(([r]) => r);
  const top = Math.min(...rows);
  const height = Math.max(...rows) - top + 1;
  // Per column, the clue's heap row span. Every clue here is a single run of
  // rows in each column it occupies, so a span is enough to place it.
  const spans = new Map();
  for (const [r, c] of cells) {
    const span = spans.get(c);
    if (span) {
      span[0] = Math.min(span[0], r);
      span[1] = Math.max(span[1], r);
    } else {
      spans.set(c, [r, r]);
    }
  }
  return {
    cells, top, spans, make,
    // The clue was wholly inside the 9x9 grid before it fell.
    tops: Array.from(
      { length: GRID_SIZE - height + 1 }, (_, i) => i + 1),
  };
};

const clues = [
  ...HEAP_CAGES.map(([total, ...cells]) => makeClue(
    cells, ids => new Cage(total, ...ids))),
  ...HEAP_THERMOS.map(cells => makeClue(
    cells, ids => new Thermo(...ids))),
];

// One variable per clue, holding the grid row its topmost cell started on.
const rowVars = new Var('G', 'grid row each fallen clue started on', clues.length);
const rowVarId = i => rowVars.cell(i + 1);

const placedIds = (clue, t) =>
  clue.cells.map(([r, c]) => makeCellId(r - clue.top + t, c));

// Each clue holds in exactly one of its candidate positions, and its variable
// names that position so the pairwise rules below can talk about it.
const placements = clues.map((clue, i) => new Or(
  clue.tops.map(t => new And([
    new Given(rowVarId(i), t),
    clue.make(placedIds(clue, t)),
  ]))));

// "No two clues ever overlapped" and "without passing through any other clue":
// in every column two clues share, whichever of them is higher in the heap was
// already strictly higher, with no shared cell, before either fell. Clues that
// share no column never interact.
const preservesOrder = (a, b, ta, tb) => {
  const da = ta - a.top;
  const db = tb - b.top;
  for (const [col, [aMin, aMax]] of a.spans) {
    const span = b.spans.get(col);
    if (!span) continue;
    const [bMin, bMax] = span;
    // Heap footprints are disjoint, so one of the two is strictly above.
    if (aMax < bMin) {
      if (aMax + da >= bMin + db) return false;
    } else {
      if (bMax + db >= aMin + da) return false;
    }
  }
  return true;
};

const sharesColumn = (a, b) =>
  [...a.spans.keys()].some(col => b.spans.has(col));

const fallOrder = clues.flatMap((a, i) => clues.slice(i + 1).flatMap((b, j) => {
  if (!sharesColumn(a, b)) return [];
  const fn = (ta, tb) => preservesOrder(a, b, ta, tb);
  return [new Pair(
    Pair.fnToKey(fn, GRID_SIZE), 'fall order',
    rowVarId(i), rowVarId(i + 1 + j))];
}));

return [
  new Shape('9x9'),
  rowVars,
  ...placements,
  ...fallOrder,
];
