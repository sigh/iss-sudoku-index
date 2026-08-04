// Title: Round The Houses
// Author: Tallcat
// Video: https://www.youtube.com/watch?v=xh6ESoNs29U
// Source: https://app.crackingthecryptic.com/sudoku/4qJrNJh6tP

// Standard sudoku (rows, cols, boxes) plus the one given. Draw a single
// loop through cell centres, orthogonal step to step. The rules never say
// whether the loop may touch itself, and the cage totals below turn out to
// force the loop through a run of adjacent cells that only closes up if
// touching is allowed, so this is modelled with a per-cell `shape` code
// (which of its edges the loop uses -- off, straight, or one of four turns)
// plus edge-agreement between neighbours, rather than a plain cell-adjacency
// membership + neighbour-count degree, which would forbid touching --
// unsound here, since these totals force two cage runs into a shared
// three-neighbour cell (R1C5) that only resolves if the loop may touch
// itself there.
//
// Each of the 16 drawn cages (covering 58 of the 81 cells; the rest belong
// to no cage) must be visited by the loop as one run: a nonempty, proper
// (not-all-cells) subset of the cage's cells forms a single simple path
// through the shape codes (the two path ends also use one edge leaving the
// cage; interior cells use both their path edges), its digits sum to the
// cage total, and every cell of the cage (on- or off-loop) is pairwise
// distinct -- "digits may not repeat in cages" is not scoped to the loop,
// unlike the totals sentence.

// Shape codes, identical to the convention used in wendezaune.js.
const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const ON_SHAPES = [HORIZ, VERT, UL, UR, DL, DR];
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;
const usesDir = { up: usesUp, down: usesDown, left: usesLeft, right: usesRight };
// The one shape code that uses exactly these two (distinct) directions.
const codeForDirs = (d1, d2) => ON_SHAPES.find(s => usesDir[d1](s) && usesDir[d2](s));

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shape = graph.makeOverlay('VS');
const gridCells = graph.cells();

const given = new Given('R4C7', 3);

// A cell may use an edge only if the neighbour exists, so border cells
// can't take shapes that point off the grid.
const ALL_SHAPES = [OFF, ...ON_SHAPES];
const shapeDomains = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const allowed = ALL_SHAPES.filter(s =>
    !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
    !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s)));
  return new Given(shape.at(cell), ...allowed);
});

// Edge agreement: neighbours must agree on the shared edge (the first uses
// the edge towards the second iff the second uses the edge back). A 2-cell
// relation, so `Pair` (not an `NFA` per pair) is the direct expression; one
// `Replicate` per direction shifts that one template pair over every cell
// that actually has a right (resp. down) neighbour, instead of stamping out
// one Pair per edge by hand.
const edgeKeyRight = Pair.fnToKey((a, b) => usesRight(a) === usesLeft(b), geometry.numValues);
const edgeKeyDown = Pair.fnToKey((a, b) => usesDown(a) === usesUp(b), geometry.numValues);
const rightTemplate = new Pair(edgeKeyRight, 'edge-h',
  shape.cells()[0], shape.at(graph.step(gridCells[0], 0, 1)));
const downTemplate = new Pair(edgeKeyDown, 'edge-v',
  shape.cells()[0], shape.at(graph.step(gridCells[0], 1, 0)));
const rightTargets = shape.at(gridCells.filter(cell => graph.step(cell, 0, 1)));
const downTargets = shape.at(gridCells.filter(cell => graph.step(cell, 1, 0)));
const edgeRules = [
  shape.makeReplicate(rightTemplate, rightTargets),
  shape.makeReplicate(downTemplate, downTargets),
];

// Cages: cell lists and totals transcribed from the drawn cage clues.
// Only 58 of the 81 cells belong to a cage; the other 23 carry no cage
// constraint at all.
const cages = [
  { cells: ['R1C2', 'R2C2', 'R2C1'], total: 4 },
  { cells: ['R1C3', 'R1C4', 'R1C5'], total: 15 },
  { cells: ['R1C6', 'R2C6', 'R2C5', 'R3C5'], total: 19 },
  { cells: ['R2C4', 'R2C3', 'R3C3', 'R3C2', 'R4C2'], total: 10 },
  { cells: ['R4C1', 'R5C1', 'R5C2', 'R5C3'], total: 18 },
  { cells: ['R6C3', 'R6C4', 'R7C4', 'R7C5', 'R8C5'], total: 23 },
  { cells: ['R7C1', 'R7C2', 'R7C3', 'R8C2'], total: 4 },
  { cells: ['R9C1', 'R9C2', 'R9C3'], total: 13 },
  { cells: ['R8C6', 'R8C7', 'R7C6', 'R9C7'], total: 22 },
  { cells: ['R8C8', 'R9C8', 'R8C9'], total: 12 },
  { cells: ['R7C7', 'R6C8', 'R7C8', 'R6C7'], total: 14 },
  { cells: ['R5C6', 'R6C6', 'R6C5'], total: 11 },
  { cells: ['R5C5', 'R4C5', 'R4C6', 'R3C6'], total: 13 },
  { cells: ['R2C8', 'R1C8', 'R1C9'], total: 11 },
  { cells: ['R2C9', 'R3C9', 'R3C8'], total: 8 },
  { cells: ['R4C8', 'R5C8', 'R5C9'], total: 12 },
];

// Direction from `a` to orthogonally-adjacent `b`, else null.
function directionTo(a, b) {
  const p = parseCellId(a), q = parseCellId(b);
  if (q.row === p.row - 1 && q.col === p.col) return 'up';
  if (q.row === p.row + 1 && q.col === p.col) return 'down';
  if (q.col === p.col - 1 && q.row === p.row) return 'left';
  if (q.col === p.col + 1 && q.row === p.row) return 'right';
  return null;
}

// Every ordered simple path (both directions of traversal) covering exactly
// `subset`, stepping only between orthogonally-adjacent cells -- computed
// from the cage's own cell list, not hand-enumerated.
function simplePathsOver(subset) {
  const paths = [];
  const walk = (remaining, path) => {
    if (remaining.length === 0) { paths.push([...path]); return; }
    for (const cell of remaining) {
      if (path.length === 0 || directionTo(path[path.length - 1], cell)) {
        path.push(cell);
        walk(remaining.filter(c => c !== cell), path);
        path.pop();
      }
    }
  };
  walk(subset, []);
  return paths;
}

// One branch per (nonempty, proper subset) x (simple path over that
// subset): pins every excluded cage cell OFF, pins the path's interior
// cells to the exact turn/straight their two path-neighbours force, pins
// each path end to "uses the edge toward its cage-internal neighbour" --
// its other used edge leaves the cage, so it stays a multi-value Given --
// and sums the path's digits to the cage total.
function cageBranches(cells, total) {
  const n = cells.length;
  const branches = [];
  for (let mask = 1; mask < (1 << n) - 1; mask++) {
    const subset = cells.filter((_, i) => mask & (1 << i));
    for (const path of simplePathsOver(subset)) {
      const inPath = new Set(path);
      const offGivens = cells
        .filter(cell => !inPath.has(cell))
        .map(cell => new Given(shape.at(cell), OFF));
      const onGivens = path.map((cell, i) => {
        if (path.length === 1) return new Given(shape.at(cell), ...ON_SHAPES);
        if (i === 0) {
          const dir = directionTo(cell, path[1]);
          return new Given(shape.at(cell), ...ON_SHAPES.filter(usesDir[dir]));
        }
        if (i === path.length - 1) {
          const dir = directionTo(cell, path[i - 1]);
          return new Given(shape.at(cell), ...ON_SHAPES.filter(usesDir[dir]));
        }
        const d1 = directionTo(cell, path[i - 1]), d2 = directionTo(cell, path[i + 1]);
        return new Given(shape.at(cell), codeForDirs(d1, d2));
      });
      branches.push(new And([new Sum(total, ...path), ...offGivens, ...onGivens]));
    }
  }
  return branches;
}

const cageConstraints = cages.flatMap(({ cells, total }) => [
  new AllDifferent(...cells),
  new Or(cageBranches(cells, total)),
]);

return [
  new Shape('9x9'),
  given,
  shape.toVar('shape'),
  ...shapeDomains,
  ...edgeRules,
  new ConnectedValues('VS', ON_SHAPES),
  ...cageConstraints,
];
