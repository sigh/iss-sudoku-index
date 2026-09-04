// Title: Japanese Sums and Products
// Author: Freddie Hand
// Video: https://www.youtube.com/watch?v=_p08eVjfxBc
// Source: https://cracking-the-cryptic.web.app/sudoku/9Qj4h2ffFF

// Japanese Sums and Products on a 7x7 board with no boxes: each cell either
// stays empty or holds a digit 1-7, no digit repeats within a row or column,
// and the numbers printed outside a lane give the totals of its maximal runs
// of filled cells, in order -- but each individual number may be EITHER the
// sum or the product of its run, with nothing (no colour, no legend)
// distinguishing which. That per-clue ambiguity is the rule as stated, encoded
// below as a disjunction, not a gap.
//
// Encoded on a Raw shape with range 0-7 -- 0 means "empty", 1-7 the digit --
// because a lane holds several empty cells and a default Sudoku grid's
// implicit row/column all-different would read those as repeats. Every
// row/column rule is therefore stated here explicitly.
//
// Omitted: R2, R4 and R6's run totals. The source prints no clue stack beside
// any of them, yet every column's two clues are equal (e.g. C1 = 3, 3): if
// R2/R4/R6 were empty by design, every column run would be forced to a single
// cell (R1/R3/R5/R7 are never adjacent once the rows between them are all
// blank), so a column's two equal-valued runs would each place that same
// digit twice -- repeating a digit within the column, which is forbidden
// outright. So R2/R4/R6 do hold digits and their clue stacks are lost data;
// they keep only the digit-uniqueness rule below.

const shape = new Shape('7x7', '0-7', 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const rows = graph.rows();       // rows[i]: R(i+1)C1 .. R(i+1)C7, left to right
const columns = graph.columns(); // columns[j]: R1C(j+1) .. R7C(j+1), top to bottom

const EMPTY = 0;

// Clue stacks transcribed from the numbers drawn in the two-cell band left of
// each row and above each column, outermost band cell first -- the same order
// as the runs they label. R2, R4 and R6 print nothing in either band slot;
// see the omission note above.
const ROW_CLUES = [
  [7, 7],
  null,
  [14, 14],
  null,
  [9, 9],
  null,
  [8], // single clue drawn in the inner band slot only
];

const COL_CLUES = [
  [3, 3],
  [4, 4],
  [5, 5],
  [6, 6],
  [7, 7],
  [8, 8],
  [9, 9],
];

// ---- No repeated digit in a lane ----
// One machine reused by every lane: 0 (empty) leaves the seen-digit bitmask
// alone, so a lane may hold any number of empty cells, while a second copy of
// a digit 1-7 rejects. 128 states, kept as its own constraint so the bitmask
// does not multiply against the run/total machine's state.
const uniqueSpec = NFA.encodeSpec({
  startState: { seen: 0 },
  transition: ({ seen }, value) => {
    if (value === EMPTY) return { seen };
    const bit = 1 << (value - 1);
    if (seen & bit) return undefined;
    return { seen: seen | bit };
  },
  accept: () => true,
}, geometry);

const uniqueRules = [
  ...rows.map((cells, i) => new NFA(uniqueSpec, `row-${i + 1}-unique`, ...cells)),
  ...columns.map((cells, j) => new NFA(uniqueSpec, `col-${j + 1}-unique`, ...cells)),
];

// ---- Run totals, sum OR product, in clue order ----
// Scanning the lane in clue order: `phase` is 'gap' (before the next run, or
// on an empty cell) or 'run' (inside run number `idx`, `sum`/`prod` its
// running total and running product so far). Both fields only increase as a
// run consumes more digits (every digit is >= 1, and a lane's digits are
// distinct so at most one 1 appears per run), so once either passes this
// lane's largest clue it can never come back down to match a later, smaller
// one -- clamped to `cap` (one past the lane's own maximum clue) collapses
// that dead region to a single sink value instead of counting higher. Leaving
// a run checks whether sum OR product equals the clue; a lane with more runs
// than clues, or fewer, rejects -- the clue count fixes the number of runs
// exactly.
function laneTotalSpec(clues) {
  const k = clues.length;
  const cap = Math.max(...clues) + 1;
  return NFA.encodeSpec({
    startState: { phase: 'gap', idx: 0, sum: 0, prod: 1 },
    transition: (state, value) => {
      const { phase, idx } = state;
      if (phase === 'gap') {
        if (value === EMPTY) return { phase: 'gap', idx, sum: 0, prod: 1 };
        if (idx >= k) return undefined; // more runs than clues
        return { phase: 'run', idx, sum: Math.min(value, cap), prod: Math.min(value, cap) };
      }
      if (value === EMPTY) {
        const target = clues[idx];
        if (state.sum !== target && state.prod !== target) return undefined;
        return { phase: 'gap', idx: idx + 1, sum: 0, prod: 1 };
      }
      const sum = Math.min(state.sum + value, cap);
      const prod = Math.min(state.prod * value, cap);
      return { phase: 'run', idx, sum, prod };
    },
    accept: (state) => {
      if (state.phase === 'gap') return state.idx === k; // every run closed
      // Lane ends inside a run: it must be the last one, and it must match.
      if (state.idx !== k - 1) return false;
      const target = clues[state.idx];
      return state.sum === target || state.prod === target;
    },
  }, geometry);
}

const rowTotalRules = rows.flatMap((cells, i) => ROW_CLUES[i] === null ? []
  : [new NFA(laneTotalSpec(ROW_CLUES[i]), `row-${i + 1}-totals`, ...cells)]);
const colTotalRules = columns.map((cells, j) =>
  new NFA(laneTotalSpec(COL_CLUES[j]), `col-${j + 1}-totals`, ...cells));

return [
  shape,
  ...uniqueRules,
  ...rowTotalRules,
  ...colTotalRules,
];
