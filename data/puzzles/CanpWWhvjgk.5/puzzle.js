// Title: June 9, 2022: Max Ascending
// Author: clover!
// Video: https://www.youtube.com/watch?v=CanpWWhvjgk
// Source: https://tinyurl.com/2p986suj
//
// Normal sudoku rules apply. Also, a clue outside of a row or column gives the
// length of the longest contiguous "run" of increasing digits in that row or
// column, from the direction of the clue: an N to the left of a row (or above
// a column) means the longest strictly-increasing run, scanned left-to-right
// (or top-to-bottom), has length exactly N -- no run of N+1 may occur.
//
// Every outside clue here sits at the left of a row or the top of a column,
// so each row/column is scanned in its natural left-to-right / top-to-bottom
// order; no clue requires the reverse direction.
//
// Run-length clue NFA: state carries the previous digit, the current
// ascending-run length ending at the cell just read, and the longest such run
// seen so far. Each new digit either extends the run (value > prev) or resets
// it to 1. Accept iff the longest run seen equals the clue's target.
const makeRunNfa = (target) => NFA.encodeSpec({
  startState: { prev: null, curRun: 0, maxRun: 0 },
  transition: ({ prev, curRun, maxRun }, value) => {
    const newRun = prev !== null && value > prev ? curRun + 1 : 1;
    return { prev: value, curRun: newRun, maxRun: Math.max(maxRun, newRun) };
  },
  accept: ({ maxRun }) => maxRun === target,
}, 9);

// Row clues: [row, target], all read left-to-right (clue printed at the left).
const rowClues = [
  [2, 6],
  [4, 5],
  [5, 2],
  [6, 5],
  [8, 6],
];

// Column clues: [col, target], all read top-to-bottom (clue printed at the top).
const colClues = [
  [2, 6],
  [4, 2],
  [5, 2],
  [6, 2],
  [8, 6],
];

const rowCells = (row) => Array.from({ length: 9 }, (_, i) => makeCellId(row, i + 1));
const colCells = (col) => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, col));

const rowRuns = rowClues.map(
  ([row, target]) => new NFA(makeRunNfa(target), `RowRun${row}`, ...rowCells(row)));
const colRuns = colClues.map(
  ([col, target]) => new NFA(makeRunNfa(target), `ColRun${col}`, ...colCells(col)));

return [
  new Shape('9x9'),

  new Given('R1C1', 8), new Given('R1C5', 3), new Given('R1C9', 4),
  new Given('R2C4', 1), new Given('R2C6', 6),
  new Given('R4C2', 5), new Given('R4C8', 1),
  new Given('R5C1', 2), new Given('R5C5', 5), new Given('R5C9', 8),
  new Given('R6C2', 9), new Given('R6C8', 5),
  new Given('R8C4', 4), new Given('R8C6', 9),
  new Given('R9C1', 7), new Given('R9C5', 8), new Given('R9C9', 2),

  ...rowRuns,
  ...colRuns,
];
