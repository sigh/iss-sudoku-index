// Title: Ca fait la rue Michel
// Author: Patrick Junke
// Video: https://www.youtube.com/watch?v=bIKZry6ynX8
// Source: https://sudokupad.app/daypits38m

// Every cell is either a labyrinth cell or a wall cell (VS overlay:
// LAB = 1, WALL = 2). The labyrinth is a single orthogonally-connected
// region (ConnectedValues), no 2x2 block is entirely labyrinth, and no
// labyrinth cell is a dead end (every labyrinth cell has at least two
// labyrinth orthogonal neighbours).
//
// Wall cells must additionally split into isolated (king-move-separated)
// groups of exactly four orthogonally-connected cells, with distinct digits
// summing to 14 in each group. That per-component size/isolation/sum rule
// over an unknown-count partition is not expressible in ISS and is
// intentionally omitted here.
//
// X between two cells: those two digits sum to 10, ALL Xs are given (no
// other adjacent pair may sum to 10), and a framed X marks a same-type
// pair (both labyrinth or both wall) while an unframed X marks a
// different-type pair (one labyrinth, one wall).

const LAB = 1;
const WALL = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const shadeCell = cell => shade.at(cell);
const gridCells = graph.cells();

// Every shade Var is either labyrinth or wall.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(new Given(firstShade, LAB, WALL));

// X clues: [cellA, cellB, framed]. Framed X's frame overlay shares the same
// drawn centre as the X text; the rest are unframed. Geometry derived from
// SudokuPad edge-mark centres and cross-checked against the known solution
// (every pair below sums to 10 in it).
const xClues = [
  ['R4C4', 'R5C4', true],
  ['R2C2', 'R2C3', true],
  ['R2C1', 'R3C1', false],
  ['R6C2', 'R6C3', true],
  ['R6C3', 'R7C3', false],
  ['R9C1', 'R9C2', false],
  ['R8C6', 'R9C6', false],
  ['R8C8', 'R8C9', false],
  ['R5C7', 'R6C7', false],
  ['R5C6', 'R5C7', false],
  ['R1C7', 'R2C7', false],
  ['R2C8', 'R3C8', true],
  ['R6C5', 'R7C5', true],
  ['R7C5', 'R7C6', false],
  ['R8C4', 'R8C5', false],
];

const xSumClues = xClues.map(([a, b]) => new X(a, b));

// Framed => same labyrinth/wall type; unframed => different type. The
// shade overlay only takes 2 values, so these reduce to plain equality /
// inequality between the two shade Vars.
const xTypeClues = xClues.map(([a, b, framed]) => framed
  ? new SameValues(2, shadeCell(a), shadeCell(b))
  : new AllDifferent(shadeCell(a), shadeCell(b)));

// ALL Xs are given, so every other orthogonally adjacent pair must NOT sum
// to 10 (scoped negative -- this puzzle has no V clue, so StrictXV, which
// also forbids sum-to-5, would over-constrain).
const xEdgeKeys = new Set(
  xClues.map(([a, b]) => [a, b].sort().join('|')));
const notTenKey = Pair.fnToKey((a, b) => a + b !== 10, geometry.numValues);
const nonXPairs = [];
for (const cell of gridCells) {
  const right = graph.step(cell, 0, 1);
  if (right !== null && !xEdgeKeys.has([cell, right].sort().join('|'))) {
    nonXPairs.push([cell, right]);
  }
  const down = graph.step(cell, 1, 0);
  if (down !== null && !xEdgeKeys.has([cell, down].sort().join('|'))) {
    nonXPairs.push([cell, down]);
  }
}
const noHiddenX = nonXPairs.map(
  ([a, b]) => [a, b]);
const noHiddenXConstraints = [
  graph.makeReplicate(
    new Pair(notTenKey, 'not X', 'R1C1', 'R1C2'),
    noHiddenX.filter(([a, b]) => parseCellId(a).row === parseCellId(b).row).map(([a]) => a)),
  graph.makeReplicate(
    new Pair(notTenKey, 'not X', 'R1C1', 'R2C1'),
    noHiddenX.filter(([a, b]) => parseCellId(a).col === parseCellId(b).col).map(([a]) => a)),
];

// No 2x2 block may be entirely labyrinth: at least one wall cell per block.
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const no2x2AllLabyrinth = blockOrigins.map(origin => new Or(
  graph.block(origin, 2, 2).map(cell => new Given(shadeCell(cell), WALL))));

// No dead ends: every labyrinth cell has at least two labyrinth orthogonal
// neighbours. Enumerated directly (domain is only 2 values, degree <= 4):
// either the cell is a wall, or some pair of its neighbours are both
// labyrinth.
const noDeadEnds = gridCells.map(cell => {
  const neighbours = graph.neighbours(cell);
  const pairBranches = [];
  for (let i = 0; i < neighbours.length; i++) {
    for (let j = i + 1; j < neighbours.length; j++) {
      pairBranches.push(new And([
        new Given(shadeCell(neighbours[i]), LAB),
        new Given(shadeCell(neighbours[j]), LAB),
      ]));
    }
  }
  return new Or([new Given(shadeCell(cell), WALL), ...pairBranches]);
});

return [
  new Shape('9x9'),
  shade.toVar('labyrinth/wall'),
  new Given('R3C9', 9),
  shadeDomain,
  // Labyrinth connectivity: a single orthogonally-connected region. Walls
  // are NOT given ConnectedValues -- they form several components, and
  // ConnectedValues only asserts exactly one.
  new ConnectedValues('VS', LAB),
  no2x2AllLabyrinth,
  noDeadEnds,
  ...xSumClues,
  ...xTypeClues,
  ...noHiddenXConstraints,
];
