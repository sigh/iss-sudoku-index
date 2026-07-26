// Title: Sweeper Cell
// Author: JoshLavig
// Video: https://www.youtube.com/watch?v=BwLGn5ho5MU
// Source: https://sudokupad.app/u1u3olem22

// Normal sudoku rules apply (standard rows/columns/boxes, the ISS default).
// Mines: every red-circle cell must hold an odd digit; orthogonally adjacent
// mine cells must differ by at least 4. Not all odd digits are mines --
// only the drawn cells are mines, so the "odd" restriction applies only to
// them and no "not a mine" restriction exists for other cells.
// Sweepers: every green-diamond cell's digit equals the number of mines
// among its (up to 8) king-move neighbours. The mine set is fixed drawn
// geometry (not solver-discovered), so each sweeper's count is a computed
// constant -- encoded as a Given, derived below from MINE_CELLS rather than
// hand-computed, matching the 4 sweeper cells whose digit is also given
// directly in the payload (R2C2, R3C2, R3C3, R7C2).
// Kropki dots: white rounded dots carry the required difference as printed
// text (5, 1, 1, 1) rather than the classic fixed value of 1.
// Dynamic Fog is solving UI, not a final-grid rule; not encoded.

const graph = cellGraph('9x9');

// Mine cells: red circle (#e80a0a) underlays, one per covered cell.
const MINE_CELLS = [
  'R1C1', 'R2C1', 'R2C4', 'R3C4', 'R4C4', 'R3C9', 'R4C8',
  'R6C1', 'R7C1', 'R8C1', 'R8C2', 'R8C3', 'R7C3', 'R6C3', 'R6C2',
  'R1C5', 'R1C6', 'R4C6', 'R6C4', 'R6C6',
  'R9C4', 'R8C5', 'R9C5', 'R7C5', 'R9C9', 'R8C8', 'R7C6',
];
const mineSet = new Set(MINE_CELLS);

// Sweeper cells: green diamond (#11db0a, 45-degree rotated) underlays, one
// per covered cell.
const SWEEPER_CELLS = [
  'R2C2', 'R3C3', 'R3C2', 'R2C8', 'R3C8', 'R7C2',
  'R1C4', 'R5C2', 'R5C5', 'R8C4', 'R5C9', 'R9C1',
];

// Kropki dots: four independent white rounded edge overlays, each with a
// printed difference value (5, 1, 1, 1). The three difference-1 dots use
// the native WhiteDot class (exact "differ by 1, adjacent cells" match,
// per lint_constraints.js's pair-native-relation guidance); the
// difference-5 dot has no native equivalent and uses a custom Pair.
const KROPKI_DOT_5 = ['R8C9', 'R9C9'];
const WHITE_DOTS = [
  ['R8C8', 'R8C9'],
  ['R4C7', 'R4C8'],
  ['R1C8', 'R1C9'],
];

// Every mine cell holds an odd digit.
const mineOdd = MINE_CELLS.map(cell => new Given(cell, 1, 3, 5, 7, 9));

// Orthogonally adjacent mine pairs must differ by at least 4. Derived from
// MINE_CELLS via the grid graph rather than hand-enumerated, deduped by
// only looking at the lexicographically-later neighbour.
const mineWhispers = MINE_CELLS.flatMap(cell =>
  graph.neighbours(cell)
    .filter(n => mineSet.has(n) && n > cell)
    .map(n => new Whisper(4, cell, n)));

// Each sweeper's digit is the count of its king-move neighbours that are
// mine cells -- a constant fixed by the drawn mine geometry, not a solver
// deduction.
const sweeperGivens = SWEEPER_CELLS.map(cell => {
  const count = graph.kingNeighbours(cell).filter(n => mineSet.has(n)).length;
  return new Given(cell, count);
});

return [
  new Shape('9x9'),
  ...mineOdd,
  ...mineWhispers,
  ...sweeperGivens,
  new Pair(
    Pair.fnToKey((x, y) => Math.abs(x - y) === 5, 9),
    'Kropki5', ...KROPKI_DOT_5),
  ...WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b)),
];
