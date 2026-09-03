// Title: Glass90Sweeper
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=WnLUrKe0kcY
// Source: https://app.crackingthecryptic.com/sudoku/TnPqrGrR4T

// Normal sudoku on the standard 9x9 grid, no given digits. A "mine" is a cell
// holding a factor of 90; among the digits 1-9 those are 1, 2, 3, 5, 6 and 9,
// and 4, 7 and 8 are not. A circled cell's digit equals the number of mines
// among the up-to-eight cells surrounding it (king-move neighbours, clipped at
// the grid edge), not counting the circled cell itself. "All such circles are
// provided" is the matching negative: every uncircled cell's digit differs
// from the number of mines surrounding it.

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const allCells = graph.cells();

const MINE_DIGITS = [1, 2, 3, 5, 6, 9];  // the digits 1-9 that divide 90
const CLEAR_DIGITS = [4, 7, 8];          // the digits 1-9 that do not

// The seventeen drawn circles, transcribed in the order they are drawn.
const circles = [
  'R1C1', 'R2C1', 'R2C2', 'R4C2', 'R6C1', 'R7C2', 'R8C1', 'R9C1', 'R9C3',
  'R6C4', 'R7C5', 'R8C5', 'R8C7', 'R9C8', 'R9C9', 'R5C8', 'R1C9',
];
const isCircled = new Set(circles);

// Two overlays shadow the grid: `mines` holds a 0/1 flag saying whether that
// cell's own digit is a mine, and `counts` holds the number of mines among
// that cell's neighbours. The count has to be materialized as a cell because
// the uncircled cells need to be compared against it with "not equal", which
// a sum cannot state.
const mines = graph.makeOverlay('VM');
const counts = graph.makeOverlay('VN');

return [
  shape,

  // The alphabet is widened to 0-9 only so the two overlays can hold 0; the
  // playable grid is pinned back to the sudoku digits 1-9.
  graph.makeReplicate(new Given(allCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),

  mines.toVar('mine flags'),
  counts.toVar('surrounding mine counts'),

  // Flag is 1 exactly when the cell's own digit is a factor of 90. The
  // disjunction also confines the flag to {0, 1}, so it needs no domain given.
  ...allCells.map(cell => new Or([
    new And([new Given(cell, ...MINE_DIGITS), new Given(mines.at(cell), 1)]),
    new And([new Given(cell, ...CLEAR_DIGITS), new Given(mines.at(cell), 0)]),
  ])),

  ...allCells.map(cell => new EqualSum(
    [counts.at(cell)], mines.at(graph.kingNeighbours(cell)))),

  // The clue and its exhaustiveness clause, cell by cell: a circled cell's
  // digit equals its count, an uncircled cell's digit differs from it.
  ...allCells.map(cell => isCircled.has(cell)
    ? new SameValues(2, cell, counts.at(cell))
    : new AllDifferent(cell, counts.at(cell))),
];
