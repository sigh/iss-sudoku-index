// Title: Yajilin
// Author: Grant Fikes
// Video: https://www.youtube.com/watch?v=59ojfgCC-tM
// Source: https://tinyurl.com/ywx4a3s3

// Rules: blacken some cells (no two orthogonally adjacent), then draw a
// single closed loop through every other cell except the 8 grey clue cells,
// which are outlined, never blackened and never on the loop. A grey cell's
// printed number counts the blackened cells along the ray its arrow points,
// all the way to the grid edge.
//
// No digits, boxes or Sudoku rules apply anywhere in this puzzle, so the
// grid is Raw. Every cell holds one "role" value: BLACK, CLUE (the 8 fixed
// grey cells), or one of six loop shapes recording which of the cell's four
// edges the loop uses there (a straight or one of four corners). Edge
// agreement between neighbours joins the per-cell shapes into loops; a clue
// or black cell never uses an edge, so a loop cell can never point into one.
//
// Omitted: that the loop is a *single* loop. Edge agreement gives every loop
// cell degree 2, and ConnectedValues forces the loop cells into one
// orthogonally-connected blob, but the rules only forbid the drawn line
// crossing or reusing a cell -- they say nothing about the loop touching
// itself -- so this loop may legally run alongside itself, and two separate
// loops could then sit cell-adjacent while sharing no used edge. That
// residue is not expressed here.

const shape = new Shape('10x10', 8, 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Role codes: the two off-loop states, then the six ways the loop can pass
// through a cell (which of its four edges it uses there).
const BLACK = 1, CLUE = 2, HORIZ = 3, VERT = 4, UL = 5, UR = 6, DL = 7, DR = 8;
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;
const LOOP_CODES = [HORIZ, VERT, UL, UR, DL, DR];

// The 8 grey clue cells, transcribed from the payload's clue array. Rows
// and columns past 9 (row/col 10) need makeCellId: a hand-written 'R10C4'
// silently matches no cell.
const arrowClues = {
  [makeCellId(1, 1)]: { dir: 'down', count: 2 },
  [makeCellId(1, 7)]: { dir: 'down', count: 5 },
  [makeCellId(3, 7)]: { dir: 'left', count: 0 },
  [makeCellId(5, 7)]: { dir: 'left', count: 2 },
  [makeCellId(6, 4)]: { dir: 'up', count: 2 },
  [makeCellId(8, 4)]: { dir: 'left', count: 2 },
  [makeCellId(10, 4)]: { dir: 'up', count: 2 },
  [makeCellId(10, 10)]: { dir: 'up', count: 2 },
};

// Grey cells are clues: never black, never on the loop. Every other cell is
// black or a loop cell, and cannot use an edge that would leave the grid.
// One Replicate stamps the full 7-value domain over every non-clue cell;
// a border cell additionally gets its own narrower Given excluding the
// edge-leaving codes, and the two intersect (ISS merges same-cell Givens),
// so the border cell ends up with exactly its filtered set.
const origin = gridCells[0];
const PLACEABLE = [BLACK, HORIZ, VERT, UL, UR, DL, DR];
const isBorder = ({ row, col }) =>
  row === 1 || row === geometry.numRows || col === 1 || col === geometry.numCols;
const nonClueCells = gridCells.filter(cell => arrowClues[cell] === undefined);
const stateDomains = [
  ...Object.keys(arrowClues).map(cell => new Given(cell, CLUE)),
  ...nonClueCells
    .filter(cell => isBorder(parseCellId(cell)))
    .map(cell => {
      const { row, col } = parseCellId(cell);
      const allowed = PLACEABLE.filter(s =>
        !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
        !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s)));
      return new Given(cell, ...allowed);
    }),
  graph.makeReplicate(new Given(origin, ...PLACEABLE), nonClueCells),
];

// Neighbour rules, stamped onto each cell that has a right neighbour and each
// cell that has a down neighbour, so every orthogonal pair is covered once.
// - edge agreement: the left/upper cell uses the shared edge exactly when the
//   right/lower one does, which is what joins the per-cell codes into loops.
//   A CLUE or BLACK cell uses no edge, so a neighbour can never point into it.
// - no-touch: two black cells may not be orthogonally adjacent.
const agreeAcross = Pair.fnToKey((a, b) => usesRight(a) === usesLeft(b), geometry);
const agreeDown = Pair.fnToKey((a, b) => usesDown(a) === usesUp(b), geometry);
const noTouch = Pair.fnToKey((a, b) => !(a === BLACK && b === BLACK), geometry);
const neighbourRules = [
  graph.makeReplicate([
    new Pair(agreeAcross, 'edge-h', origin, graph.step(origin, 0, 1)),
    new Pair(noTouch, 'no-touch-h', origin, graph.step(origin, 0, 1)),
  ], gridCells.filter(cell => graph.step(cell, 0, 1))),
  graph.makeReplicate([
    new Pair(agreeDown, 'edge-v', origin, graph.step(origin, 1, 0)),
    new Pair(noTouch, 'no-touch-v', origin, graph.step(origin, 1, 0)),
  ], gridCells.filter(cell => graph.step(cell, 1, 0))),
];

// --- Arrow clues: count BLACK cells along the ray from a clue cell to the
// grid edge in its arrow's direction, excluding the clue cell itself.
const DIRECTIONS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
// graph.ray() includes the cell it starts from, which is the clue itself.
const rayFrom = (cell, direction) =>
  graph.ray(cell, ...DIRECTIONS[direction]).slice(1);

// One machine per distinct target count (0, 2 and 5 are the only ones used),
// scanning the ray and rejecting outright once the count would exceed the
// target, so the state stays bounded.
const memo = fn => { const m = new Map(); return k => (m.has(k) ? m : m.set(k, fn(k))).get(k); };
const countExactly = memo(target => NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) => {
    const next = count + (value === BLACK ? 1 : 0);
    return next > target ? undefined : { count: next };
  },
  accept: ({ count }) => count === target,
}, geometry));

const arrowRules = Object.entries(arrowClues).map(([cell, { dir, count }]) =>
  new NFA(countExactly(count), 'arrow-count', ...rayFrom(cell, dir)));

return [
  shape,
  ...stateDomains,
  ...neighbourRules,
  ...arrowRules,
  // Single connected blob of loop cells: sound but only narrows -- see the
  // single-loop omission above.
  new ConnectedValues('', LOOP_CODES),
];
