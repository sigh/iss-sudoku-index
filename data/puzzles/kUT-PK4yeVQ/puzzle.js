// Title: Akari
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=kUT-PK4yeVQ
// Source: https://puzz.link/p?akari/10/10/m.j65bga.ja.k.k.gbbd5.k.k.hch.hbg67dh.m

// No Sudoku digit layer at all: the source payload carries genre 'akari' /
// 'Akari (Light Up)' and no rules text; the video description gives the
// standard Light Up ruleset directly. Place light bulbs in some white cells
// so that:
//   (1) every white cell is illuminated -- a bulb lights its entire row and
//       column, stopping at the nearest black cell or the grid edge;
//   (2) no bulb illuminates another bulb (no two bulbs share an unbroken
//       row/column run);
//   (3) a numbered black cell has exactly that many bulbs in its orthogonally
//       adjacent cells; an unnumbered black cell has no such restriction.
//
// Modelled as a 3-valued Raw grid (EMPTY / BULB / WALL) -- the same
// "shading as a widened Raw grid" technique this pipeline's other Akari rows
// (e.g. huMgnsAIDjw.1) and its Slitherlink rows use. There is no separate
// "is illuminated" overlay: a white cell's row-run and column-run (the
// maximal stretch of white cells either side of it, up to the nearest wall
// or edge) are computed directly from the fixed wall layout, and
// illumination becomes "at least one cell in that union is a bulb" -- a
// single Or of Given(cell, BULB) branches, one branch per candidate cell,
// which is trivially true when the cell is itself a bulb.

const EMPTY = 1, BULB = 2, WALL = 3;
const N = 10;

const shape = new Shape('10x10', 3, 'Raw');
const graph = cellGraph(shape);

// The 24 black cells, transcribed from the source's own clue table
// (r, c 1-indexed): -2 = unnumbered wall, 0-4 = numbered wall giving the
// exact count of bulbs required in its orthogonal neighbours. Every other
// cell of the 10x10 grid is a white (playable) cell.
const WALLS = [
  [1, 8, -2],
  [2, 3, 1], [2, 5, 0], [2, 7, 1],
  [3, 1, 0], [3, 4, -2], [3, 9, 0],
  [4, 2, -2], [4, 8, -2],
  [5, 4, -2], [5, 6, 1], [5, 9, 1],
  [6, 2, 3], [6, 5, 0], [6, 7, -2],
  [7, 3, -2], [7, 9, -2],
  [8, 2, 2], [8, 7, -2], [8, 10, 1],
  [9, 4, 1], [9, 6, 2], [9, 8, 3],
  [10, 3, -2],
];

const wallValue = new Map(WALLS.map(([r, c, v]) => [`${r},${c}`, v]));
const isWall = (r, c) => wallValue.has(`${r},${c}`);

// --- Domain restrictions ------------------------------------------------
// Every wall cell is pinned exactly to WALL; every white cell is restricted
// to {EMPTY, BULB}. This alone is what makes a wall cell read as "0 bulbs"
// when it turns up as somebody else's orthogonal neighbour below. Both are
// one-cell templates shifted onto every cell of their group, via Replicate.
const gridCells = graph.cells();
const wallCells = [];
const whiteCells = [];
for (let r = 1; r <= N; r++) {
  for (let c = 1; c <= N; c++) {
    (isWall(r, c) ? wallCells : whiteCells).push(makeCellId(r, c));
  }
}
const domainConstraints = [
  graph.makeReplicate(new Given(gridCells[0], WALL), wallCells),
  graph.makeReplicate(new Given(gridCells[0], EMPTY, BULB), whiteCells),
];

// --- Row/column runs -----------------------------------------------------
// A run is a maximal stretch of consecutive white cells in one row or one
// column, split at every wall and at the grid edge.
function computeRuns(cellAt) {
  const runs = [];
  let current = [];
  for (let i = 1; i <= N; i++) {
    const [r, c] = cellAt(i);
    if (isWall(r, c)) {
      if (current.length) runs.push(current);
      current = [];
    } else {
      current.push(makeCellId(r, c));
    }
  }
  if (current.length) runs.push(current);
  return runs;
}

const rowRuns = [];
const rowRunOfCell = new Map();
for (let r = 1; r <= N; r++) {
  for (const run of computeRuns(i => [r, i])) {
    rowRuns.push(run);
    for (const id of run) rowRunOfCell.set(id, run);
  }
}

const colRuns = [];
const colRunOfCell = new Map();
for (let c = 1; c <= N; c++) {
  for (const run of computeRuns(i => [i, c])) {
    colRuns.push(run);
    for (const id of run) colRunOfCell.set(id, run);
  }
}

// --- Rule (2): no two bulbs share a run ----------------------------------
// A run of length 1 trivially satisfies "at most one bulb", so only runs of
// 2+ cells need the machine.
const atMostOneBulb = NFA.encodeSpec({
  startState: 0,
  transition: (bulbSeen, value) => {
    if (value !== BULB) return bulbSeen;
    return bulbSeen === 1 ? undefined : 1;
  },
  accept: () => true,
}, 3);

const noSeeConstraints = [...rowRuns, ...colRuns]
  .filter(run => run.length >= 2)
  .map(run => new NFA(atMostOneBulb, 'no-see', ...run));

// --- Rule (1): every white cell is illuminated ---------------------------
// A cell is illuminated exactly when its row-run or its column-run holds a
// bulb (a run of at most one bulb, from rule 2 above, so "holds a bulb" and
// "the union contains exactly one BULB" coincide). Encoded directly as one
// Or per white cell over every cell of that union taking the value BULB --
// true whether the bulb is this cell itself or another cell sharing either
// run.
const illuminationConstraints = [];
for (let r = 1; r <= N; r++) {
  for (let c = 1; c <= N; c++) {
    if (isWall(r, c)) continue;
    const id = makeCellId(r, c);
    const union = new Set([...rowRunOfCell.get(id), ...colRunOfCell.get(id)]);
    illuminationConstraints.push(new Or([...union].map(u => new Given(u, BULB))));
  }
}

// --- Rule (3): numbered wall clues ---------------------------------------
// Reads only the existing orthogonal neighbours (a corner wall has 2, an
// edge wall has 3, an interior wall has 4) and counts how many equal BULB.
const bulbCountMachines = new Map();
function bulbCountMachine(target, arity) {
  const key = `${target}_${arity}`;
  if (!bulbCountMachines.has(key)) {
    bulbCountMachines.set(key, NFA.encodeSpec({
      startState: 0,
      transition: (count, value) => {
        const next = count + (value === BULB ? 1 : 0);
        return next > target ? undefined : next;
      },
      accept: count => count === target,
    }, 3));
  }
  return bulbCountMachines.get(key);
}

const wallClueConstraints = WALLS
  .filter(([, , value]) => value >= 0)
  .map(([r, c, target]) => {
    const neighbourIds = graph.neighbours(makeCellId(r, c));
    return new NFA(
      bulbCountMachine(target, neighbourIds.length), 'wall-clue', ...neighbourIds);
  });

return [
  shape,
  ...domainConstraints,
  ...noSeeConstraints,
  ...illuminationConstraints,
  ...wallClueConstraints,
];
