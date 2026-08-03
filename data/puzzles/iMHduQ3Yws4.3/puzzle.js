// Title: Ascending Starters Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=iMHduQ3Yws4
// Source: https://tinyurl.com/ye2ac9sj

// Normal sudoku, plus 12 outside clues (one per marked row/column side, from
// the "text" overlay). Each is the sum of the first maximal run of strictly
// ascending digits read into the grid from that side; a run may be a single
// digit when the second digit read does not exceed the first. Sides with no
// printed clue are unconstrained.

const graph = cellGraph('9x9');

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

const reversed = cells => [...cells].reverse();

// Row/column, direction, and value transcribed from the drawn outside-grid
// clue cells.
const outsideClues = [
  ascendingRun(graph.row(1), 44),              // row 1, from the left
  ascendingRun(reversed(graph.row(3)), 11),     // row 3, from the right
  ascendingRun(graph.row(4), 8),                // row 4, from the left
  ascendingRun(reversed(graph.row(6)), 24),     // row 6, from the right
  ascendingRun(graph.row(7), 25),               // row 7, from the left
  ascendingRun(reversed(graph.row(9)), 42),     // row 9, from the right
  ascendingRun(reversed(graph.column(1)), 37),  // column 1, from the bottom
  ascendingRun(graph.column(3), 4),             // column 3, from the top
  ascendingRun(reversed(graph.column(4)), 8),   // column 4, from the bottom
  ascendingRun(graph.column(6), 15),            // column 6, from the top
  ascendingRun(reversed(graph.column(7)), 12),  // column 7, from the bottom
  ascendingRun(graph.column(9), 42),            // column 9, from the top
];

return [
  new Shape('9x9'),
  new Given('R4C5', 4),
  new Given('R5C4', 2),
  new Given('R5C6', 5),
  new Given('R6C5', 1),
  ...outsideClues,
];
