// Title: unknown
// Author: Hong Weihua
// Video: https://www.youtube.com/watch?v=ZzRDQtQMB5Y
// Source: https://app.crackingthecryptic.com/sudoku/4JrqrrjDTd

// Standard 6x6 sudoku (rows/columns 1-6 once each); regions are not given and
// must be deduced (ChaosConstruction: six orthogonally-connected 6-cell
// regions, replacing the default 2x3 boxes via NoBoxes).
//
// White circle: the surrounding 4 cells are all one region -- encoded as
// SameValues(4, ...) over their CC region-label cells (forces the 4 labels
// equal without pinning which label, which a CC cell may never be given).
//
// Border-sum outside clues: for every row and column, each place where two
// orthogonally adjacent cells fall in different regions ("a region border")
// has the sum of its two digits listed outside the grid. A lane's outside
// clues and its grid cells read as one continuous strip in a single
// direction (top-to-bottom for a column, left-to-right for a row): the
// clue printed first (farthest from the grid) is the first border met
// continuing that same direction into the grid, and so on inward. "All
// possible outside clues have been given", so a lane's clue
// count is exactly its border count -- neither more nor fewer borders exist.
// A "?" clue confirms a border there without constraining its sum (any
// positive integer already holds for any 1-6 digit pair).
//
// Each lane is one NFA scanning [label_1, digit_1, label_2, digit_2, ...]:
// it tracks the previous cell's label/digit, and whenever the label changes
// it consumes the lane's next clue (checking the digit sum against a numeric
// clue, or accepting any sum for null/"?"); it rejects a border beyond the
// clue list, and accepts only once every listed clue has been consumed.

const cc = cellGraph('6x6').makeOverlay('CC');

// Builds one border-sum NFA for a lane of 6 cells, given as [cellId, ...] in
// near-edge-to-far order, against its ordered clue list (numbers, or null for
// "?"). Returns an NFA constraint over the interleaved [label, digit, ...]
// sequence for that lane.
function borderSumLane(name, cellIds, clueList) {
  const spec = NFA.encodeSpec({
    startState: {
      awaiting: 'label', havePrev: false,
      prevLabel: null, prevDigit: null, curLabel: null, clueIdx: 0,
    },
    transition(state, value) {
      if (state.awaiting === 'label') {
        return { ...state, curLabel: value, awaiting: 'digit' };
      }
      const digit = value;
      let { havePrev, prevLabel, prevDigit, curLabel, clueIdx } = state;
      if (havePrev && curLabel !== prevLabel) {
        // A region border here: consume the lane's next clue.
        const expected = clueList[clueIdx];
        if (expected === undefined) return undefined; // more borders than clues
        const sum = prevDigit + digit;
        if (expected !== null && expected !== sum) return undefined;
        clueIdx += 1;
      }
      return {
        awaiting: 'label', havePrev: true,
        prevLabel: curLabel, prevDigit: digit, curLabel: null, clueIdx,
      };
    },
    accept: (state) => state.clueIdx === clueList.length,
  }, 6);

  const sequence = cellIds.flatMap(id => [cc.at(id), id]);
  return new NFA(spec, name, ...sequence);
}

// Per-column clues (grid columns 1-6), read top-to-bottom (farthest-from-
// grid margin cell first, continuing down into the grid). Provenance: the
// overlay "?" marks and numeric values in the margin above the grid, one
// column at a time.
const COLUMN_CLUES = [
  [null],
  [null, null],
  [8, 9, 3],
  [null, 4],
  [null, null],
  [10],
];

// Per-row clues (grid rows 1-6), read left-to-right (farthest-from-grid
// margin cell first, continuing right into the grid). Provenance: the
// overlay "?" marks and numeric values in the margin left of the grid, one
// row at a time.
const ROW_CLUES = [
  [null],
  [null, 5, 5],
  [null, null, null],
  [8, null, 5, 8],
  [null, 7, 7],
  [null, null],
];

const columnLanes = COLUMN_CLUES.map((clues, i) => {
  const col = i + 1;
  const cells = [1, 2, 3, 4, 5, 6].map(row => makeCellId(row, col));
  return borderSumLane(`ColBorder${col}`, cells, clues);
});

const rowLanes = ROW_CLUES.map((clues, i) => {
  const row = i + 1;
  const cells = [1, 2, 3, 4, 5, 6].map(col => makeCellId(row, col));
  return borderSumLane(`RowBorder${row}`, cells, clues);
});

// White circles: each forces its 4 cells' CC labels equal (same region).
const whiteCircles = [
  ['R1C4', 'R1C5', 'R2C4', 'R2C5'],
  ['R5C1', 'R5C2', 'R6C1', 'R6C2'],
].map(cells => new SameValues(4, ...cc.at(cells)));

return [
  new Shape('6x6'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...whiteCircles,
  ...columnLanes,
  ...rowLanes,
];
