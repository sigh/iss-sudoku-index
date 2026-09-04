// Title: Hoshihoshi
// Author: Nell Gwyn
// Video: https://www.youtube.com/watch?v=rLdj0JKPSGg
// Source: https://sudokupad.app/l3dwxfya1w

// Rules (metadata.rules): Norinori -- shade two cells in each region such
// that all shaded cells are part of dominoes and no two dominoes touch each
// other orthogonally (they may touch diagonally). Star Battle -- place one
// star in each region such that there are exactly two stars in each row and
// column; stars cannot touch each other, even diagonally; stars cannot be
// placed on shaded Norinori cells.
//
// Per the setter's own solution-check note, every cell ends in exactly one
// of three states: 1 = star, 2 = shaded (Norinori), 3 = empty. There is no
// digit grid and no row/column/box "different digits" rule at all, so this
// is a ternary Raw board, not a Sudoku: no implicit constraints, and every
// rule below is stated explicitly. "Stars cannot be placed on shaded cells"
// needs no separate constraint: a cell already holds exactly one of the
// three values, so STAR and SHADED are mutually exclusive by construction.

const STAR = 1;
const SHADED = 2;

const shape = new Shape('10x10', '1-3', 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();

// The 20 regions, transcribed from the drawn wall geometry (walls
// flood-filled into what they enclose) as [row, col] pairs. Converted
// through makeCellId rather than hand-written 'R10C..' strings, since
// row/col 10 is the single character 'a' on this 10-wide grid.
const regionCoords = [
  [[6, 5], [6, 6], [7, 6], [7, 5], [8, 5], [9, 5], [9, 6], [9, 7], [10, 6]],
  [[2, 10], [3, 10], [4, 10], [4, 9], [5, 9], [6, 9], [5, 10]],
  [[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [2, 2]],
  [[3, 7], [3, 8], [3, 9], [4, 8], [4, 7], [4, 6]],
  [[5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [6, 4]],
  [[6, 1], [6, 2], [6, 3], [7, 3], [7, 4], [7, 2]],
  [[1, 9], [1, 10], [2, 9], [2, 8], [2, 7]],
  [[2, 4], [2, 5], [3, 5], [3, 6], [3, 4]],
  [[5, 6], [5, 7], [5, 8], [6, 8], [6, 7]],
  [[7, 1], [8, 1], [8, 2], [8, 3], [9, 1]],
  [[7, 7], [8, 7], [8, 8], [9, 8], [8, 6]],
  [[9, 2], [9, 3], [10, 3], [10, 2], [10, 1]],
  [[1, 6], [1, 7], [1, 8], [2, 6]],
  [[4, 2], [4, 3], [4, 4], [4, 5]],
  [[6, 10], [7, 10], [7, 9], [7, 8]],
  [[8, 4], [9, 4], [10, 4], [10, 5]],
  [[8, 9], [8, 10], [9, 10], [9, 9]],
  [[10, 7], [10, 8], [10, 9], [10, 10]],
  [[2, 1], [3, 1], [4, 1]],
  [[2, 3], [3, 3], [3, 2]],
];
const regions = regionCoords.map(coords => coords.map(([r, c]) => makeCellId(r, c)));

// One star per region; exactly two shaded cells per region (the region's
// own Norinori count -- the domino they form need not stay inside the
// region, per the rule's plain reading below).
const oneStarPerRegion = regions.map(cells => new ContainExact(`${STAR}`, ...cells));
const twoShadedPerRegion = regions.map(cells => new ContainExact(`${SHADED}_${SHADED}`, ...cells));

// Exactly two stars in each row and column.
const rowStars = graph.rows().map(cells => new ContainExact(`${STAR}_${STAR}`, ...cells));
const colStars = graph.columns().map(cells => new ContainExact(`${STAR}_${STAR}`, ...cells));

// Stars cannot touch each other, even diagonally: no two king-adjacent
// cells both hold STAR. Grouped by relative offset and stamped with
// Replicate instead of one Pair per edge, since the 342 in-grid edges are
// shifted copies of just 4 templates (right, down, down-left, down-right --
// the "forward" half of the 8 king directions, so each undirected edge is
// covered exactly once).
const noStarTouchKey = Pair.fnToKey((a, b) => !(a === STAR && b === STAR), geometry.numValues);
const FORWARD_KING_OFFSETS = [[0, 1], [1, 0], [1, -1], [1, 1]];
const starTouch = FORWARD_KING_OFFSETS.map(([dRow, dCol]) => {
  const origins = graph.cells().filter(cell => graph.step(cell, dRow, dCol) !== null);
  const [origin] = origins;
  const template = [new Pair(
    noStarTouchKey, 'no-star-touch', origin, graph.step(origin, dRow, dCol))];
  return new Replicate(template, Replicate.encodeTargetCells(origins, origin, graph), origin);
});

// Norinori: every shaded cell has exactly one orthogonally-adjacent shaded
// cell, checked over the whole grid (the rule's "touch" is never scoped to
// a region). This both requires each shaded cell to have a domino partner
// (a lone shaded cell has zero shaded neighbours) and forbids two dominoes
// touching orthogonally (a shaded cell with two-or-more shaded neighbours
// means a second domino sits against its own). Reads a cell's own state
// then each in-grid neighbour's (2, 3 or 4 of them, depending on how close
// to an edge/corner the cell sits); the running count clamps and rejects
// once it exceeds 1.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, shadedNeighbours }, value) => {
    if (phase === 'start') {
      return value === SHADED
        ? { phase: 'shaded', shadedNeighbours: 0 }
        : { phase: 'other' };
    }
    if (phase === 'other') return { phase: 'other' };
    const count = shadedNeighbours + (value === SHADED ? 1 : 0);
    return count > 1 ? undefined : { phase: 'shaded', shadedNeighbours: count };
  },
  accept: ({ phase, shadedNeighbours }) => phase === 'other' || shadedNeighbours === 1,
}, geometry.numValues);

// Group cells by which of the 4 orthogonal directions stay on the grid --
// interior cells see all 4, an edge cell sees 3, a corner sees 2 -- so every
// cell in one group has the exact same relative neighbour offsets and one
// Replicate template covers the whole group. A group of size 1 (a corner)
// has nothing to replicate against, so it is encoded directly.
const ORTHOGONAL_OFFSETS = { N: [-1, 0], S: [1, 0], W: [0, -1], E: [0, 1] };
const cellsByNeighbourShape = new Map();
for (const cell of graph.cells()) {
  const dirs = Object.entries(ORTHOGONAL_OFFSETS)
    .filter(([, [dRow, dCol]]) => graph.step(cell, dRow, dCol) !== null)
    .map(([dir]) => dir)
    .join('');
  if (!cellsByNeighbourShape.has(dirs)) cellsByNeighbourShape.set(dirs, []);
  cellsByNeighbourShape.get(dirs).push(cell);
}
const norinoriDegrees = [...cellsByNeighbourShape.entries()].map(([dirs, cells]) => {
  const offsets = dirs.split('').map(dir => ORTHOGONAL_OFFSETS[dir]);
  const [origin] = cells;
  const neighboursOf = cell => offsets.map(([dRow, dCol]) => graph.step(cell, dRow, dCol));
  if (cells.length === 1) {
    return new NFA(degreeMachine, 'shaded-neighbour-count', origin, ...neighboursOf(origin));
  }
  const template = [new NFA(
    degreeMachine, 'shaded-neighbour-count', origin, ...neighboursOf(origin))];
  return new Replicate(template, Replicate.encodeTargetCells(cells, origin, graph), origin);
});

return [
  shape,
  ...oneStarPerRegion,
  ...twoShadedPerRegion,
  ...rowStars,
  ...colStars,
  ...starTouch,
  ...norinoriDegrees,
];
