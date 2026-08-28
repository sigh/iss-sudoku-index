// Title: Inception
// Author: matyas
// Video: https://www.youtube.com/watch?v=4mfPEtnttPw
// Source: https://tinyurl.com/inceptionpuzzle

// Five nested puzzles share one 9x9 grid of fixed corner pencil marks.
//
// Encoded here:
//  1. Hitori over the pencil marks: shade cells so that no row or column keeps
//     two equal unshaded marks, no two shaded cells are orthogonally adjacent,
//     and the unshaded cells form one orthogonally connected region.
//  2. Akari with the Hitori-shaded cells as walls: bulbs go in unshaded cells;
//     a wall's mark is its bulb-count clue, counting orthogonal neighbours,
//     and a mark greater than 4 acts as a clue of 0; light runs from a bulb
//     along its row and column until a wall or the frame; every unshaded cell
//     is lit and no bulb lies in another bulb's light.
//  3. A bulb whose mark is not 8 or 9 places that mark in the grid.
//  6. Star Battle: two stars in every row, column and box, no two stars
//     touching even diagonally, and no star on a 4 or a 5.
//  Standard Sudoku on the placed digits.
//
// Omitted, as ISS has no way to attach size, sum or distinctness predicates to
// the components of a partition the solver itself discovers:
//  4. Nurikabe with the placed numbers as clues (one clue per island, island
//     size equal to its clue, connected river, no 2x2 of river).
//  5. Killer Sudoku whose cages are the Nurikabe islands, each cage summing to
//     the total of its own pencil marks.
// The Sudoku half of rule 5 is encoded; the cages are not, so the digits are
// only as constrained as rule 3 and Sudoku leave them.

// Corner pencil marks, row by row, transcribed from the grid's corner marks.
const MARKS = [
  [1, 8, 3, 9, 9, 6, 7, 2, 5],
  [9, 7, 2, 6, 4, 8, 1, 9, 2],
  [6, 1, 1, 7, 8, 3, 8, 5, 8],
  [2, 9, 8, 7, 1, 2, 5, 9, 3],
  [1, 3, 2, 4, 5, 3, 8, 6, 1],
  [2, 3, 2, 8, 3, 9, 2, 1, 4],
  [2, 2, 9, 2, 8, 4, 3, 7, 6],
  [8, 6, 5, 2, 1, 1, 9, 3, 2],
  [3, 1, 4, 5, 6, 7, 7, 8, 1],
];

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const markAt = (cell) => {
  const { row, col } = parseCellId(cell);
  return MARKS[row - 1][col - 1];
};

// One overlay carries both of the first two layers, so that the Akari scans
// read a single symbol per cell: a wall blocks light, and the two unshaded
// codes say whether the cell holds a bulb.
const LIGHT = 1;  // unshaded, no bulb
const BULB = 2;   // unshaded, holds a bulb
const WALL = 3;   // shaded by the Hitori
const board = graph.makeOverlay('VH');

// Whether each cell is lit along its row / along its column. Walls are unlit.
const DARK = 1;
const LIT = 2;
const rowLit = graph.makeOverlay('VR');
const colLit = graph.makeOverlay('VC');

const NOSTAR = 1;
const STAR = 2;
const stars = graph.makeOverlay('VS');

// Each overlay carries a code, not a digit, so every cell is restricted to the
// codes its layer defines.
const domains = [
  board.makeReplicate(new Given(board.cells()[0], LIGHT, BULB, WALL)),
  rowLit.makeReplicate(new Given(rowLit.cells()[0], DARK, LIT)),
  colLit.makeReplicate(new Given(colLit.cells()[0], DARK, LIT)),
  stars.makeReplicate(new Given(stars.cells()[0], NOSTAR, STAR)),
];

const lines = [...graph.rows(), ...graph.columns()];

const notBothUnshaded = Pair.fnToKey((a, b) => a === WALL || b === WALL, shape);
const equalMarkPairs = lines.flatMap(line => line.flatMap((a, i) =>
  line.slice(i + 1)
    .filter(b => markAt(a) === markAt(b))
    .map(b => new Pair(
      notBothUnshaded, 'hitori', board.at(a), board.at(b)))));

const notBothWalls = Pair.fnToKey((a, b) => a !== WALL || b !== WALL, shape);
const noAdjacentWalls = lines.map(
  line => new Pair(notBothWalls, 'hitori', ...board.at(line)));

const unshadedConnected = new ConnectedValues('VH', [LIGHT, BULB]);

// Bulb-count clue for one wall. The scan is [the clued cell, its orthogonal
// neighbours]: the first symbol decides whether the cell is a wall at all, and
// only then are the neighbours' bulbs counted.
const bulbCountSpec = (target) => NFA.encodeSpec({
  startState: { wall: null, count: 0 },
  transition: ({ wall, count }, value) => {
    if (value > WALL) return undefined;
    if (wall === null) return { wall: value === WALL, count: 0 };
    if (!wall) return { wall: false, count: 0 };
    const seen = count + (value === BULB ? 1 : 0);
    return seen > target ? undefined : { wall: true, count: seen };
  },
  accept: ({ wall, count }) => !wall || count === target,
}, shape);
const bulbCountSpecs = new Map(
  [0, 1, 2, 3, 4].map(target => [target, bulbCountSpec(target)]));

const bulbCounts = graph.cells().map(cell => {
  const mark = markAt(cell);
  return new NFA(
    bulbCountSpecs.get(mark > 4 ? 0 : mark), 'akari clue',
    ...board.at([cell, ...graph.neighbours(cell)]));
});

// One row or column of the Akari, scanned as [code, lit, code, lit, ...]. A
// maximal run of unshaded cells between two walls is lit exactly when it holds
// a bulb, so the run's cells all carry the same lit flag; `committed` is that
// flag, taken from the run's first cell and checked against `bulb` when the run
// ends. At most one bulb per run is the "no bulb lights another bulb" rule.
const litSpec = NFA.encodeSpec({
  startState: { needLit: false, wall: false, committed: null, bulb: false },
  transition: (s, value) => {
    if (!s.needLit) {
      if (value === WALL) {
        if (s.committed !== null && s.committed !== s.bulb) return undefined;
        return { needLit: true, wall: true, committed: null, bulb: false };
      }
      if (value !== LIGHT && value !== BULB) return undefined;
      if (value === BULB && s.bulb) return undefined;
      return {
        needLit: true, wall: false,
        committed: s.committed, bulb: s.bulb || value === BULB
      };
    }
    if (value !== DARK && value !== LIT) return undefined;
    if (s.wall) {
      return value === DARK
        ? { needLit: false, wall: false, committed: null, bulb: false }
        : undefined;
    }
    const lit = value === LIT;
    if (s.committed !== null && s.committed !== lit) return undefined;
    return { needLit: false, wall: false, committed: lit, bulb: s.bulb };
  },
  accept: (s) => !s.needLit && (s.committed === null || s.committed === s.bulb),
}, shape);

const interleave = (cells, overlay) =>
  cells.flatMap(cell => [board.at(cell), overlay.at(cell)]);
const litScans = [
  ...graph.rows().map(
    row => new NFA(litSpec, 'akari row', ...interleave(row, rowLit))),
  ...graph.columns().map(
    col => new NFA(litSpec, 'akari column', ...interleave(col, colLit))),
];

const illuminated = graph.cells().map(cell => new Or([
  new Given(board.at(cell), WALL),
  new Given(rowLit.at(cell), LIT),
  new Given(colLit.at(cell), LIT),
]));

const placesMark = new Map([1, 2, 3, 4, 5, 6, 7].map(
  mark => [mark, Pair.fnToKey(
    (code, digit) => code !== BULB || digit === mark, shape)]));
const placedMarks = graph.cells()
  .filter(cell => markAt(cell) <= 7)
  .map(cell => new Pair(
    placesMark.get(markAt(cell)), 'placed mark', board.at(cell), cell));

const starCounts = graph.rowsColumnsBoxes().map(
  region => new ContainExact([STAR, STAR].join('_'), ...stars.at(region)));

// Every maximal king-move line: consecutive cells along one are exactly the
// pairs of touching cells, including the diagonal ones.
const diagonalStarts = (dc) => graph.cells().filter(cell => {
  const { row, col } = parseCellId(cell);
  return row === 1 || col === (dc > 0 ? 1 : 9);
});
const starLines = [
  ...lines,
  ...diagonalStarts(1).map(cell => graph.ray(cell, 1, 1)),
  ...diagonalStarts(-1).map(cell => graph.ray(cell, 1, -1)),
].filter(line => line.length > 1);
const notBothStars = Pair.fnToKey((a, b) => a !== STAR || b !== STAR, shape);
const starSpacing = starLines.map(
  line => new Pair(notBothStars, 'star battle', ...stars.at(line)));

const noStarOn45 = Pair.fnToKey(
  (digit, star) => star !== STAR || (digit !== 4 && digit !== 5), shape);
const starDigits = graph.cells().map(
  cell => new Pair(noStarOn45, 'star battle', cell, stars.at(cell)));

return [
  shape,
  board.toVar('hitori shading / akari bulbs'),
  rowLit.toVar('lit along the row'),
  colLit.toVar('lit along the column'),
  stars.toVar('stars'),
  ...domains,
  ...equalMarkPairs,
  ...noAdjacentWalls,
  unshadedConnected,
  ...bulbCounts,
  ...litScans,
  ...illuminated,
  ...placedMarks,
  ...starCounts,
  ...starSpacing,
  ...starDigits,
];
