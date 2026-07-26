// Title: Sliding Doors
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=ss5Z0hY8B50
// Source: https://sudokupad.app/dx2flehouq
//
// Draw seven 6-cell orthogonally-connected regions in the grid (some region
// boundaries are drawn); place 1-6 in every row, column, and region; cells
// outside every region are left empty. Each outside clue sums the cells in
// its row/column from the clue's side, stopping before the first empty
// cell.
//
// The region-drawing rule is not encoded (no ISS primitive covers
// solver-deduced jigsaw regions over part of the grid, with a
// solver-placed hole per row/column). What remains is encoded faithfully:
//
// Modelled with value range 0-6: "empty" is plain value 0, so the default
// row/column all-different (7 distinct values across 7 cells) forces exactly
// one empty cell per row and per column on its own -- this follows from
// "place 1-6 in every row [and] column" (six digits in seven cells leaves
// exactly one cell with no digit, wherever it falls).

const shape = new Shape('7x7', '0-6');

// Outside clues: sum the cells from the clue's side until the first empty
// (0) cell, not including it. Cell order and side read from the drawn
// outside-clue text underlays (west/east of a row, north of a column).
const OUTSIDE_CLUES = [
  [['R5C7', 'R5C6', 'R5C5', 'R5C4', 'R5C3', 'R5C2', 'R5C1'], 9],   // east of R5
  [['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7'], 6],   // west of R2
  [['R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7'], 15],  // west of R4
  [['R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7'], 14],  // west of R6
  [['R7C7', 'R7C6', 'R7C5', 'R7C4', 'R7C3', 'R7C2', 'R7C1'], 12],  // east of R7
  [['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5'], 13],  // north of C5
];

// One NFA per clue: track the running sum of digits seen so far (a branch
// that has already overshot the target dies immediately, so the sum state is
// bounded by the target); require the sum to equal the target at the moment
// the empty (0) cell is read, then ignore every cell after it -- the
// row/column all-different above guarantees exactly one 0 per line, so
// "stop at the first empty cell" and "stop at the only empty cell" coincide.
const outsideClueNFAs = OUTSIDE_CLUES.map(([cells, target]) => {
  const spec = {
    startState: { sum: 0, stopped: false },
    transition: (state, value) => {
      if (state.stopped) return state;
      if (value === 0) {
        return state.sum === target ? { sum: state.sum, stopped: true } : undefined;
      }
      const sum = state.sum + value;
      return sum <= target ? { sum, stopped: false } : undefined;
    },
    accept: (state) => state.stopped,
  };
  const encoded = NFA.encodeSpec(spec, shape);
  return new NFA(encoded, `outside sum ${target}`, ...cells);
});

return [
  shape,
  ...outsideClueNFAs,
];
