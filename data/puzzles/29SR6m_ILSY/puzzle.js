// Title: Japanese Minesweeper (Beginner)
// Author: rdrd
// Video: https://www.youtube.com/watch?v=29SR6m_ILSY
// Source: https://sudokupad.app/acruau5lrz
//
// Minesweeper: a mine is encoded as digit 9; every other cell holds the
// count, 0-8, of its up-to-8 king-move neighbours that are mines (0 for
// none -- a "0" cell is the rules' "left empty" cell, so no separate rule is
// needed for it). Exactly 10 mines total. No row/column/box rule is stated
// anywhere, so the grid is Raw.
//
// Japanese Sums: outside clue lanes read in the same direction as the lane
// they label (left-to-right for a row, top-to-bottom for a column). Each
// maximal run of "clued" cells (non-mine cells holding a positive
// minesweeper count, 1-8) sums to one printed clue, in the order the runs
// appear; a run is closed by a mine or an empty (digit-0) cell, and the
// lane's run count must match its clue count exactly. Only 3 of the 9
// columns and 3 of the 9 rows carry any printed clue band -- every other
// lane has no run/sum rule at all; `clueLines` below transcribes the drawn
// clue stacks. A `?` clue fixes its run's sum to 1-9 without stating the
// value, `??` fixes it to 10+; both are encoded as a range, never as the
// value the solution happens to use.
//
// A hidden whole-board cage (no total) and a transparent whole-canvas
// underlay are also drawn; both are board-boundary/rendering markers, not a
// rule -- the puzzle names only Minesweeper and Japanese Sums, and the
// cage's usual default reading (all-different) would reject the puzzle's
// own solution, which repeats digits throughout every row and column.

const MINE = 9;
const EMPTY = 0;
const TOTAL_MINES = 10;

const shape = new Shape('9x9', '0-9', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// --- Minesweeper count ------------------------------------------------
// Reads a cell's own value, then its king-move neighbours' values. A mine
// (value 9) needs no count and accepts unconditionally; any other cell's
// value must equal the number of its neighbours that are mines.
const countMachine = NFA.encodeSpec({
  startState: { phase: 'own' },
  transition: (state, value) => {
    if (state.phase === 'own') {
      return value === MINE
        ? { phase: 'mine' }
        : { phase: 'count', target: value, seen: 0 };
    }
    if (state.phase === 'mine') return { phase: 'mine' };
    const seen = state.seen + (value === MINE ? 1 : 0);
    return seen > state.target ? undefined : { phase: 'count', target: state.target, seen };
  },
  accept: (state) => state.phase === 'mine' || state.seen === state.target,
}, shape);
const mineCounts = cells.map(cell =>
  new NFA(countMachine, 'mine-count', cell, ...graph.kingNeighbours(cell)));

// --- Exactly 10 mines across the whole grid ---------------------------
const totalMinesMachine = NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) => {
    const next = count + (value === MINE ? 1 : 0);
    return next > TOTAL_MINES ? undefined : { count: next };
  },
  accept: ({ count }) => count === TOTAL_MINES,
}, shape);
const totalMines = new NFA(totalMinesMachine, 'total-mines', ...cells);

// --- Japanese Sums ------------------------------------------------------
// One run/sum NFA per clued lane. `clues` lists each run's sum requirement,
// in the order the runs appear along the lane: `{ exact: N }` for a printed
// number, `{ min, max }` (either bound optional) for a `?`/`??` digit-count
// clue. A run is closed by a break cell (mine or empty); the lane's run
// count must equal `clues.length` exactly, so a lane not listed here (no
// drawn clue band) gets no constraint at all.
// A clue is `{ exact: N }` for a printed number, or `{ min, max }` (either
// bound optional) for a "?"/"??" digit-count clue.
function clueSatisfied(clue, sum) {
  if (clue.exact !== undefined) return sum === clue.exact;
  if (clue.min !== undefined && sum < clue.min) return false;
  if (clue.max !== undefined && sum > clue.max) return false;
  return true;
}
// No clue in this puzzle cares about a sum past 10 (the highest bound any
// clue uses is the "??" >= 10 threshold), so once a run's running sum
// clears this cap it is clamped there -- an open-ended "??" run otherwise
// keeps growing for as long as the lane has clued cells left and blows the
// NFA compiler's state budget for no semantic gain.
const SUM_CAP = 12;
function makeRunSumMachine(clues) {
  return NFA.encodeSpec({
    startState: { runIndex: 0, sum: null },
    transition: ({ runIndex, sum }, value) => {
      const isBreak = value === EMPTY || value === MINE;
      if (isBreak) {
        if (sum === null) return { runIndex, sum: null };
        if (runIndex >= clues.length || !clueSatisfied(clues[runIndex], sum)) return undefined;
        return { runIndex: runIndex + 1, sum: null };
      }
      // A clued (1-8) cell.
      if (sum === null) {
        if (runIndex >= clues.length) return undefined; // one more run than clued
        return { runIndex, sum: value };
      }
      const nextSum = Math.min(sum + value, SUM_CAP);
      const clue = clues[runIndex];
      if (clue.exact !== undefined && nextSum > clue.exact) return undefined;
      if (clue.max !== undefined && nextSum > clue.max) return undefined;
      return { runIndex, sum: nextSum };
    },
    accept: ({ runIndex, sum }) => {
      if (sum !== null) {
        if (runIndex >= clues.length || !clueSatisfied(clues[runIndex], sum)) return false;
        runIndex += 1;
      }
      return runIndex === clues.length;
    },
  }, shape);
}

const ONE_DIGIT = { min: 1, max: 9 };   // "?"
const TWO_DIGIT = { min: 10 };          // "??"

// Clued lanes, transcribed from the drawn clue bands (canvas C5/C8/C11
// column bands; canvas R4/R7/R10 row bands). Run order = farthest-from-
// board clue slot first, matching the lane's own reading direction.
const clueLines = [
  { cells: graph.column(2), clues: [ONE_DIGIT, ONE_DIGIT] },              // canvas C5: R1 "?", R2 "?"
  { cells: graph.column(5), clues: [TWO_DIGIT, TWO_DIGIT] },              // canvas C8: R1 "??", R2 "??"
  { cells: graph.column(8), clues: [{ exact: 4 }] },                      // canvas C11: R2 "4" (R1 blank)
  { cells: graph.row(2), clues: [ONE_DIGIT, ONE_DIGIT, { exact: 4 }] },   // canvas R4: C1 "?", C2 "?", C3 "4"
  { cells: graph.row(5), clues: [ONE_DIGIT, ONE_DIGIT, ONE_DIGIT] },      // canvas R7: C1 "?", C2 "?", C3 "?"
  { cells: graph.row(8), clues: [{ exact: 4 }, ONE_DIGIT, ONE_DIGIT] },   // canvas R10: C1 "4", C2 "?", C3 "?"
];
const japaneseSums = clueLines.map(({ cells: laneCells, clues }, i) =>
  new NFA(makeRunSumMachine(clues), `jsum-${i}`, ...laneCells));

return [
  shape,
  ...mineCounts,
  totalMines,
  ...japaneseSums,
];
