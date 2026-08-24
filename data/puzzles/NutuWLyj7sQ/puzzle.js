// Title: Ascending Starters Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=NutuWLyj7sQ
// Source: https://app.crackingthecryptic.com/sudoku/FQr78jpf86

// Normal sudoku rules apply (default 9x9 row/column/box all-different, no
// givens, no cages -- the payload's `cages` array is three metadata stubs).
//
// Outside clues give the sum of the first "set of ascending digits" read
// from the side the clue is printed on: starting at the cell nearest the
// clue, keep a cell in the set only while it is greater than the previous
// one already in the set. The clue is the sum of that first run only -- once
// a cell fails to continue the ascent the run has ended, and the rest of the
// line is outside the clued set (a second, third, ... run may follow but is
// not clued). A run may be a single digit.
//
// Each clue is one NFA scanning its row/column in the clue's own reading
// direction. State carries the running sum of the still-open run and
// whether the run has ended: `sum` is clamped at target+1 once the run can
// no longer sum to target (a saturating counter, so the compiled state
// never needs to track a sum higher than one past the clue), and once the
// run ends (`done`) the machine holds the final sum untouched for the
// remaining cells in the line, which the clue does not see.
const ascendingRunSum = (target) => NFA.encodeSpec({
  startState: { sum: 0, prev: 0, done: false },
  transition: ({ sum, prev, done }, value) => {
    if (done) return { sum, prev: 0, done };
    // prev === 0 means "no digit read yet" (grid digits are 1-9, so 0 is a
    // safe sentinel); the first cell of the line always starts the run.
    if (prev === 0 || value > prev) {
      return { sum: Math.min(sum + value, target + 1), prev: value, done: false };
    }
    return { sum, prev: 0, done: true };
  },
  accept: ({ sum }) => sum === target,
}, 9);

const graph = cellGraph('9x9');

// Row clues: [row, side, target]. Transcribed from the drawn outside-clue
// overlays (one text box per clue, positioned in the margin next to the row
// or column it reads).
const rowClues = [
  [1, 'right', 22],
  [2, 'left', 11],
  [5, 'left', 12],
  [5, 'right', 20],
  [6, 'left', 13],
  [7, 'left', 22],
  [7, 'right', 10],
];
// Column clues: [col, side, target].
const colClues = [
  [2, 'bottom', 10],
  [4, 'top', 14],
  [4, 'bottom', 25],
  [5, 'bottom', 6],
  [6, 'bottom', 6],
  [7, 'top', 26],
  [8, 'bottom', 11],
];

const outsideConstraints = [
  ...rowClues.map(([row, side, target]) => {
    const cells = graph.row(row);
    // 'left' reads C1->C9 (natural order); 'right' reads C9->C1.
    const ordered = side === 'left' ? cells : [...cells].reverse();
    return new NFA(ascendingRunSum(target), `row${row}-${side}`, ...ordered);
  }),
  ...colClues.map(([col, side, target]) => {
    const cells = graph.column(col);
    // 'top' reads R1->R9 (natural order); 'bottom' reads R9->R1.
    const ordered = side === 'top' ? cells : [...cells].reverse();
    return new NFA(ascendingRunSum(target), `col${col}-${side}`, ...ordered);
  }),
];

return [
  new Shape('9x9'),
  ...outsideConstraints,
];
