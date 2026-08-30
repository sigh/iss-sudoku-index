// Title: Japanese Sums
// Author: Serkan Yurekli
// Video: https://www.youtube.com/watch?v=VJjYOgwh45w
// Source: https://cracking-the-cryptic.web.app/sudoku/4NHM9TGmRj

// Japanese Sums on a 7x7 board with no boxes: each cell either stays empty
// or holds a digit 1-5, no digit repeats within a row or column, and the
// numbers printed outside a lane give the sums of its maximal runs of filled
// cells, in order, one number per run, read in the same direction as the
// lane (left to right for a row, top to bottom for a column).
//
// Encoded on a Raw shape with range 0-5 -- 0 means "empty", 1-5 the digit --
// because a lane holds several empty cells and a default Sudoku grid's
// implicit row/column all-different would read those as repeats. Every
// row/column rule is therefore stated here explicitly.
//
// Omitted: R1's run sums. The source prints no clue stack beside R1, and the
// clue arithmetic (columns total 72, the six clued rows total 65) shows R1
// must still hold digits summing to 7, so the stack is missing rather than
// absent by design. R1 is left with only the digit-uniqueness rule and its
// columns' constraints; nothing stands in for the sums it should have.

const shape = new Shape('7x7', '0-5', 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const rows = graph.rows();       // rows[i]: R(i+1)C1 .. R(i+1)C7, left to right
const columns = graph.columns(); // columns[j]: R1C(j+1) .. R7C(j+1), top to bottom

const EMPTY = 0;

// Clue stacks transcribed from the numbers drawn in the three-cell band left
// of each row and above each column, ordered outermost band cell first --
// the same order as the runs they label. Blank outer band cells (rows 5-7,
// columns 1 and 4-7) carry no clue and simply shorten the stack. R1's stack
// is null: nothing is drawn beside it.
const ROW_CLUES = [
  null,
  [5, 3, 2],
  [6, 2, 4],
  [3, 5, 3],
  [7, 6],
  [6, 3],
  [5, 5],
];

const COL_CLUES = [
  [4],
  [5, 6],
  [7, 8],
  [9],
  [10],
  [11],
  [12],
];

// ---- No repeated digit in a lane ----
// One machine reused by every lane: 0 (empty) leaves the seen-digit bitmask
// alone, so a lane may hold any number of empty cells, while a second copy of
// a digit 1-5 rejects. 32 states, kept as its own constraint so the bitmask
// does not multiply against the run/sum machine's state.
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

// ---- Run sums, in clue order ----
// Scanning the lane in clue order: `phase` is 'gap' (before the next run, or
// on an empty cell) or 'run' (inside run number `idx`, `sum` its total so
// far). Leaving a run checks its clue; a lane with more runs than clues, or
// fewer, rejects -- the clue count fixes the number of runs exactly.
function laneSumSpec(clues) {
  const k = clues.length;
  return NFA.encodeSpec({
    startState: { phase: 'gap', idx: 0, sum: 0 },
    transition: (state, value) => {
      const { phase, idx } = state;
      if (phase === 'gap') {
        if (value === EMPTY) return { phase: 'gap', idx, sum: 0 };
        if (idx >= k) return undefined; // more runs than clues
        if (value > clues[idx]) return undefined;
        return { phase: 'run', idx, sum: value };
      }
      if (value === EMPTY) {
        if (state.sum !== clues[idx]) return undefined;
        return { phase: 'gap', idx: idx + 1, sum: 0 };
      }
      const sum = state.sum + value;
      if (sum > clues[idx]) return undefined;
      return { phase: 'run', idx, sum };
    },
    accept: (state) => {
      if (state.phase === 'gap') return state.idx === k; // every run closed
      // Lane ends inside a run: it must be the last one, and complete.
      return state.idx === k - 1 && state.sum === clues[state.idx];
    },
  }, geometry);
}

const rowSumRules = rows.flatMap((cells, i) => ROW_CLUES[i] === null ? []
  : [new NFA(laneSumSpec(ROW_CLUES[i]), `row-${i + 1}-sums`, ...cells)]);
const colSumRules = columns.map((cells, j) =>
  new NFA(laneSumSpec(COL_CLUES[j]), `col-${j + 1}-sums`, ...cells));

return [
  shape,
  ...uniqueRules,
  ...rowSumRules,
  ...colSumRules,
];
