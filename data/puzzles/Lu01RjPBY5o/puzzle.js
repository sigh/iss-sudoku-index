// Title: Can't Touch This!
// Author: Theasylm & Friends!
// Video: https://www.youtube.com/watch?v=Lu01RjPBY5o
// Source: https://app.crackingthecryptic.com/sudoku/nMqP9RD7rd

// Rules encoded here:
//  - Normal sudoku.
//  - Every cell is either shaded yellow or left unshaded.
//  - The clues printed outside a row or column give the sums of the contiguous
//    runs of shaded cells in that line, in the order the line is read (left to
//    right for a row, top to bottom for a column). The clue list is the whole
//    list: a line has exactly as many runs as it has clues.
//  - Runs are separated by at least one unshaded cell ("there must be an
//    unshaded cell between runs of the same colour"; yellow is the only colour
//    in play here, so this applies between every pair of runs and makes each
//    clued run a maximal one).
//  - A "?" clue stands for a run whose total is not given. Any run holds at
//    least one digit, so its total is non-zero whatever the clue.
// Nothing is omitted.

const SHADED = 1;      // the two values a shading Var cell may take
const UNSHADED = 2;
const UNKNOWN = null;  // a "?" clue: that run's total is not given

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// The shading Var cell paired with each grid cell (VS1..VS81, in grid order).
const shade = graph.makeOverlay('VS');

// Clue lists transcribed from the numbers printed outside the grid, each list in
// the reading order of its line; rowClues[0] is the list left of row 1 and
// columnClues[0] the list above column 1.
const rowClues = [
  [4],
  [16],
  [30],
  [18, UNKNOWN, 18],
  [6, 6, 10],
  [31],
  [15],
  [15, 8],
  [11, 11],
];
const columnClues = [
  [1],
  [10, 6],
  [40],
  [7, 20],
  [41],
  [10, 9],
  [40],
  [6, 4],
  [7],
];

// Reads a line as [shade(c1), digit(c1), shade(c2), digit(c2), ...].
// `runIndex` counts the runs already closed, `sum` totals the run currently open
// (null when none is open), and `shading` holds the shade value just read while
// that cell's digit is still to come. A run closes on an unshaded cell, so the
// gap between two runs is what advances runIndex.
const lineMachine = (clues, cellCount) => NFA.encodeSpec({
  startState: { runIndex: 0, sum: null, shading: null },
  transition: ({ runIndex, sum, shading }, value) => {
    if (shading === null) {  // reading a shade cell
      if (value === SHADED) {
        // Opening a further run needs a clue left for it; extending the open
        // run does not.
        if (sum === null && runIndex >= clues.length) return undefined;
        return { runIndex, sum: sum === null ? 0 : sum, shading: SHADED };
      }
      if (sum === null) return { runIndex, sum: null, shading: UNSHADED };
      // This unshaded cell closes the open run, so its total is now final.
      if (clues[runIndex] !== UNKNOWN && sum !== clues[runIndex]) return undefined;
      return { runIndex: runIndex + 1, sum: null, shading: UNSHADED };
    }
    // reading a digit cell
    if (shading === UNSHADED) return { runIndex, sum, shading: null };
    const total = sum + value;
    // Reject once the open run has overshot its clue, which also bounds `sum`.
    if (clues[runIndex] !== UNKNOWN && total > clues[runIndex]) return undefined;
    return { runIndex, sum: total, shading: null };
  },
  // A line whose last cell is shaded ends with a run still open; that run is the
  // last clue and its total is checked here instead of at a closing gap.
  accept: ({ runIndex, sum }) => (sum === null
    ? runIndex === clues.length
    : runIndex === clues.length - 1
      && (clues[runIndex] === UNKNOWN || sum === clues[runIndex])),
  // Two symbols per cell, so the scan is exactly this long; the "?" run needs
  // the bound because its running total has no clue to reject against.
  maxDepth: 2 * cellCount,
}, geometry.numValues);

const lineRuns = [
  ...graph.rows().map((cells, i) => [`runs-R${i + 1}`, rowClues[i], cells]),
  ...graph.columns().map((cells, i) => [`runs-C${i + 1}`, columnClues[i], cells]),
].map(([name, clues, cells]) => new NFA(lineMachine(clues, cells.length), name,
  ...cells.flatMap(cell => [shade.at(cell), cell])));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  // Every cell is shaded or unshaded, and nothing else.
  shade.makeReplicate(new Given(shade.cells()[0], SHADED, UNSHADED)),
  ...lineRuns,
];
