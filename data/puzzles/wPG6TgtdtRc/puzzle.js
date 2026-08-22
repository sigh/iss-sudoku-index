// Title: Juosan Arrow Sudoku
// Author: Abed Hawila
// Video: https://www.youtube.com/watch?v=wPG6TgtdtRc
// Source: https://app.crackingthecryptic.com/sudoku/9FGBfdpL69

// Standard 9x9 sudoku (Shape default gives rows/columns/boxes). Arrow arms
// sum to their circle. Odd digits may run 3+ consecutively in a column but
// not a row; even digits may run 3+ consecutively in a row but not a column
// -- each encoded as a run-length NFA scanned over every row/column.

// Arrow clues: [circle, ...arm cells], transcribed from the puzzle's drawn
// arrow geometry. Two circles (R3C7, R7C1) carry more than one arm; each
// arm is its own Arrow sharing the circle cell.
const ARROWS = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R2C1', 'R2C2', 'R2C3'],
  ['R2C7', 'R2C8', 'R2C9'],
  ['R3C7', 'R3C6', 'R3C5', 'R3C4'],
  ['R3C7', 'R2C6', 'R1C5'],
  ['R3C7', 'R4C7', 'R5C7'],
  ['R6C7', 'R6C8', 'R5C9', 'R4C8'],
  ['R6C6', 'R5C5', 'R4C6'],
  ['R6C5', 'R5C6', 'R4C5'],
  ['R6C2', 'R6C3', 'R5C3', 'R4C3'],
  ['R7C1', 'R6C1', 'R5C1'],
  ['R7C1', 'R8C2', 'R9C3'],
  ['R9C9', 'R9C8', 'R8C8'],
];

// A run-length NFA: resets to 0 on a cell that fails `tracked`, otherwise
// increments and rejects once the run would exceed maxRun. `accept` is
// trivially true since an over-length run is already unreachable by the
// time the scan ends.
const runLimitNFA = (tracked, maxRun) => NFA.encodeSpec({
  startState: 0,
  transition: (run, v) => {
    if (!tracked(v)) return 0;
    const next = run + 1;
    return next > maxRun ? undefined : next;
  },
  accept: () => true,
}, 9);

const isOdd = v => v % 2 === 1;
const isEven = v => v % 2 === 0;
const ROW_ODD_RUN = runLimitNFA(isOdd, 2);   // rows: no 3+ consecutive odds
const COL_EVEN_RUN = runLimitNFA(isEven, 2); // columns: no 3+ consecutive evens

const row = r => Array.from({ length: 9 }, (_, c) => makeCellId(r, c + 1));
const col = c => Array.from({ length: 9 }, (_, r) => makeCellId(r + 1, c));

return [
  new Shape('9x9'),

  ...ARROWS.map(([circle, ...arm]) => new Arrow(circle, ...arm)),

  ...Array.from({ length: 9 }, (_, i) =>
    new NFA(ROW_ODD_RUN, 'row: no 3+ consecutive odd digits', ...row(i + 1))),
  ...Array.from({ length: 9 }, (_, i) =>
    new NFA(COL_EVEN_RUN, 'column: no 3+ consecutive even digits', ...col(i + 1))),
];
