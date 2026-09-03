// Title: World Class Kakuro (Puzzle 2)
// Author: Prasanna Seshadri
// Video: https://www.youtube.com/watch?v=QBihIeXcL6I
// Source: https://cracking-the-cryptic.web.app/sudoku/d2pd4JrtgL

// Kakuro with shaded clue cells.
//
// Base rules: a digit 1-9 goes in every playable cell. The sum of digits in
// each Across entry equals the value printed to the left of the entry, the sum
// in each Down entry equals the value printed above it, and no digit repeats
// within a single entry. An entry is a maximal run of playable cells bounded
// by a block or the grid edge; the printed total is a label that some -- not
// all -- entries carry, so an entry with no printed total still holds distinct
// digits (see notes).
//
// Variant rule: some cells are shaded. A shaded cell holds a digit like any
// other playable cell and is an ordinary member of the Across and Down entries
// it lies in. Its digit *additionally* acts as a Kakuro clue for the
// subsequent cells -- to the right for an Across reading, below for a Down
// reading -- running until the next shaded cell, block or grid boundary. The
// solver decides which direction a shaded digit clues; it may clue both. So
// each shaded digit clues at least one of its two runs, and a run that is
// empty (the neighbour is a shaded cell, a block, or the edge) cannot be the
// one it clues.
//
// There is no whole-grid Sudoku rule: rows and columns are not all-different,
// only the entries are, hence the Raw grid type.
//
// The source is a 10x10 canvas whose top row and left column are a solid black
// border holding clue labels only; the playing field is the inner 9x9, used
// here directly (source R2C2 is this script's R1C1, etc.). BLOCKED cells hold
// no digit. Shape widens to 10 values so a spare "blank" marker (10) exists to
// pin them; iss_solution marks these cells `.`. Playable cells are restricted
// back to 1-9.

const shape = new Shape('9x9', 10, 'Raw');
const graph = cellGraph(shape);
const SIZE = 9;

// Drawn geometry, read off the grid art: solid black cells (blocks and clue
// boxes) and grey shaded cells, both shifted -1 row/-1 col from the source
// canvas to drop the black border row and column.
const BLOCKED = [
  'R1C8', 'R1C9',
  'R2C5',
  'R3C3', 'R3C4',
  'R4C7', 'R4C8',
  'R5C5',
  'R6C2', 'R6C3',
  'R7C6', 'R7C7',
  'R8C5',
  'R9C1', 'R9C2',
];
const SHADED = [
  'R1C1', 'R1C4',
  'R2C1', 'R2C6',
  'R3C9',
  'R4C4',
  'R5C1', 'R5C2', 'R5C6',
  'R6C7',
  'R7C4', 'R7C9',
  'R8C1', 'R8C6',
  'R9C6',
];

// Printed clue totals, one per drawn number: [direction, first cell of the run
// the number clues, total]. Each number is drawn inside the black cell
// immediately before that run -- in the upper-right triangle for an Across
// total, the lower-left triangle for a Down total.
const PRINTED = [
  ['A', 'R2C6', 12],
  ['A', 'R3C1', 16],
  ['A', 'R3C5', 17],
  ['A', 'R5C6', 12],
  ['A', 'R8C1', 18],
  ['A', 'R8C6', 12],
  ['A', 'R9C3', 35],
  ['D', 'R1C2', 32],
  ['D', 'R1C3', 9],
  ['D', 'R1C4', 16],
  ['D', 'R1C6', 26],
  ['D', 'R2C8', 6],
  ['D', 'R2C9', 36],
  ['D', 'R3C5', 11],
  ['D', 'R4C3', 8],
  ['D', 'R4C4', 34],
  ['D', 'R5C7', 6],
  ['D', 'R5C8', 19],
  ['D', 'R6C5', 5],
  ['D', 'R7C2', 8],
  ['D', 'R7C3', 23],
];

const blockedSet = new Set(BLOCKED);
const shadedSet = new Set(SHADED);
const playable = graph.cells().filter(c => !blockedSet.has(c));

const inGrid = (r, c) => r >= 1 && r <= SIZE && c >= 1 && c <= SIZE;
const isBlocked = (r, c) => blockedSet.has(makeCellId(r, c));
const isShaded = (r, c) => shadedSet.has(makeCellId(r, c));
const STEP = { A: [0, 1], D: [1, 0] };

// Walk from (r, c) in direction dir, collecting playable cells. `stopAtShaded`
// is the extra barrier a shaded cell's own clue run stops at.
function walk(r, c, dir, stopAtShaded) {
  const [dr, dc] = STEP[dir];
  const cells = [];
  while (inGrid(r, c) && !isBlocked(r, c) && !(stopAtShaded && isShaded(r, c))) {
    cells.push(makeCellId(r, c));
    r += dr;
    c += dc;
  }
  return cells;
}

// Every entry: the maximal runs of playable cells in each direction, found by
// starting one wherever the preceding cell is a block or the grid edge.
const entries = [];
for (const dir of ['A', 'D']) {
  const [dr, dc] = STEP[dir];
  for (let r = 1; r <= SIZE; r++) {
    for (let c = 1; c <= SIZE; c++) {
      if (isBlocked(r, c)) continue;
      if (inGrid(r - dr, c - dc) && !isBlocked(r - dr, c - dc)) continue;
      entries.push([dir, walk(r, c, dir, false)]);
    }
  }
}

const printedTotal = new Map(PRINTED.map(([dir, cell, total]) => [dir + cell, total]));
const entryConstraints = entries.flatMap(([dir, cells]) => {
  const total = printedTotal.get(dir + cells[0]);
  // A printed total gives sum + distinctness; an unlabelled entry gives
  // distinctness alone. A single-cell entry needs neither.
  if (total !== undefined) return [new Cage(total, ...cells)];
  return cells.length > 1 ? [new AllDifferent(...cells)] : [];
});
if (entryConstraints.length !== entries.filter(e => e[1].length > 1).length) {
  throw Error('entry constraint count mismatch');
}
if (PRINTED.some(([dir, cell]) => !entries.some(([d, cs]) => d === dir && cs[0] === cell))) {
  throw Error('a printed total does not sit at the head of a maximal entry');
}

// Shaded-cell clues. `Arrow(bulb, ...arm)` is "the bulb cell's digit equals the
// sum of the arm cells", which is exactly what the shaded digit asserts about
// the run it clues. The two readings are disjoined because the rules leave the
// direction to the solver; where one run is empty only the other reading is
// available, and the empty one is dropped rather than encoded as sum 0.
// Distinctness inside a shaded run needs no constraint of its own: each such
// run is a contiguous stretch of the entry the shaded cell sits in, which is
// already all-different above.
const shadedClues = SHADED.map((cell) => {
  const { row, col } = parseCellId(cell);
  const arms = ['A', 'D']
    .map(dir => walk(row + STEP[dir][0], col + STEP[dir][1], dir, true))
    .filter(arm => arm.length > 0);
  if (arms.length === 0) throw Error(`shaded cell ${cell} clues nothing`);
  const readings = arms.map(arm => new Arrow(cell, ...arm));
  return readings.length === 1 ? readings[0] : new Or(readings);
});

// Domain stamping: playable cells restricted to 1-9, blocked cells pinned to
// the spare blank marker 10, each as one Replicate over its group so the
// widened range never leaks into a real digit.
const playableDomain = new Replicate(
  [new Given(playable[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)],
  Replicate.encodeTargetCells(playable, playable[0], graph),
  playable[0],
);
const blockedDomain = new Replicate(
  [new Given(BLOCKED[0], 10)],
  Replicate.encodeTargetCells(BLOCKED, BLOCKED[0], graph),
  BLOCKED[0],
);

return [shape, playableDomain, blockedDomain, ...entryConstraints, ...shadedClues];
