// Title: July 6 '22: Ascending Starters
// Author: clover!
// Video: https://www.youtube.com/watch?v=glCWGqNR2U0
// Source: https://tinyurl.com/yc5yn9wz

// Normal sudoku, plus 15 outside clues (one per marked row/column side, from
// the "text" overlay). Each is the sum of the first maximal run of strictly
// ascending digits read into the grid from that side; a run may be a single
// digit when the second digit read does not exceed the first. Sides with no
// printed clue are unconstrained.

// One state machine per clue: `prev` is the last digit admitted to the
// ascending run (null before the first digit), `sum` the running total of
// the run, `done` whether a break (a non-increase) has ended the run. Once
// `done`, later digits in the line are ignored, matching "sum only the
// initial ascending run". `target` is the clue's printed value, closed over
// per call rather than carried in state.
function ascendingRun(cells, target) {
  const spec = NFA.encodeSpec({
    startState: { prev: null, sum: 0, done: false },
    transition: ({ prev, sum, done }, value) => {
      if (done) return { prev, sum, done };
      if (prev === null) return { prev: value, sum: value, done: false };
      if (value > prev) return { prev: value, sum: sum + value, done: false };
      return { prev, sum, done: true };
    },
    accept: ({ sum }) => sum === target,
  }, 9);
  return new NFA(spec, `ascend${target}`, ...cells);
}

const row = (r) => Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));
const column = (c) => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));
const reversed = (cells) => [...cells].reverse();

// Row/column, direction, and value transcribed from the drawn outside-grid
// clue cells (the payload's "text" entries at row/col 0 or 10).
const outsideClues = [
  ascendingRun(row(2), 2),                  // row 2, from the left
  ascendingRun(reversed(row(2)), 17),       // row 2, from the right
  ascendingRun(row(3), 5),                  // row 3, from the left
  ascendingRun(reversed(row(3)), 7),        // row 3, from the right
  ascendingRun(row(6), 10),                 // row 6, from the left
  ascendingRun(reversed(row(6)), 9),        // row 6, from the right
  ascendingRun(row(8), 24),                 // row 8, from the left
  ascendingRun(reversed(row(8)), 3),        // row 8, from the right
  ascendingRun(column(2), 9),               // column 2, from the top
  ascendingRun(reversed(column(3)), 10),    // column 3, from the bottom
  ascendingRun(column(4), 10),              // column 4, from the top
  ascendingRun(reversed(column(5)), 7),     // column 5, from the bottom
  ascendingRun(column(6), 10),              // column 6, from the top
  ascendingRun(reversed(column(7)), 8),     // column 7, from the bottom
  ascendingRun(column(8), 10),              // column 8, from the top
];

return [
  new Shape('9x9'),
  new Given('R1C4', 3),
  new Given('R1C6', 4),
  new Given('R2C1', 2),
  new Given('R2C9', 8),
  new Given('R3C4', 1),
  new Given('R3C6', 2),
  new Given('R4C3', 4),
  new Given('R4C7', 5),
  new Given('R5C3', 5),
  new Given('R5C7', 6),
  new Given('R6C3', 6),
  new Given('R6C7', 7),
  new Given('R8C1', 7),
  new Given('R8C9', 3),
  new Given('R9C5', 3),
  ...outsideClues,
];
