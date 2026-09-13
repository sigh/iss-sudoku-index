// Title: Yajilin
// Author: Murat Can Tonta
// Video: https://www.youtube.com/watch?v=59ojfgCC-tM
// Source: https://tinyurl.com/3xb88y43

// Yajilin, 10x10. Blacken some white cells, then draw a single closed loop
// (no intersections or crossings) through every remaining white cell,
// travelling orthogonally cell to cell. Blackened cells cannot share an edge
// with each other. Ten cells are outlined and grey, hold a number and an
// arrow, and are excluded from the loop; each such cell is never itself
// blackened, and its number is the total count of blackened cells that exist
// in the arrow's direction from it, all the way to the far edge of the grid.
// (Rules transcribed verbatim from the video's on-screen rules panel.)

// The grid has no digit/Sudoku layer at all: every cell's only state is a
// "shape" code, held directly on the main (Raw) grid -- OFF (blackened) or
// one of six on-loop shapes recording which two of the cell's four edges the
// loop uses there (a straight or a turn). A clue cell is pinned to OFF but is
// never counted as blackened: the arrow-count and no-adjacent-blackened rules
// below both read only the free (non-clue) cells, skipping clue positions at
// list-building time rather than inside the encoding, since clue positions
// are fixed data known before solving.
//
// Degree comes from each cell's own shape code (0 for OFF, 2 for any on-loop
// code), so branching is impossible by construction; edge-agreement `Pair`s
// make neighbouring cells' codes join up consistently across the edge
// between them. `ConnectedValues` over the on-loop codes then requires every
// on-loop cell to form one connected cell region.
//
// This narrows but does not fully close "exactly one loop": the rules forbid
// the loop crossing or branching, not touching, so an on-loop cell may have
// more than two on-loop orthogonal neighbours as long as only two of its own
// four edges are actually used -- `ConnectedValues` sees cell adjacency, not
// which edge is used, so two loops that touch without sharing a used edge
// would still satisfy it while remaining two loops.

const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];
const ON_LOOP = [HORIZ, VERT, UL, UR, DL, DR];

const gridShape = new Shape('10x10', 7, 'Raw');
const graph = cellGraph(gridShape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Clue cells: (r, c) 1-based, the blackened-count target, and the arrow
// direction, transcribed from the puzzle's clue list and matching the
// video's rules-panel frame cell-for-cell.
const clues = [
  { r: 1, c: 1, value: 2, dir: 'D' },
  { r: 3, c: 4, value: 1, dir: 'R' },
  { r: 3, c: 5, value: 3, dir: 'D' },
  { r: 4, c: 8, value: 2, dir: 'D' },
  { r: 5, c: 8, value: 2, dir: 'L' },
  { r: 6, c: 3, value: 1, dir: 'R' },
  { r: 7, c: 3, value: 2, dir: 'R' },
  { r: 8, c: 6, value: 2, dir: 'L' },
  { r: 8, c: 7, value: 2, dir: 'L' },
  { r: 10, c: 10, value: 2, dir: 'L' },
];
const clueCellIds = new Set(clues.map(({ r, c }) => makeCellId(r, c)));
const isClue = cell => clueCellIds.has(cell);

// A group-domain Replicate: one Given template
// stamped over every target cell, target cells located on the main grid.
const replicateGiven = (targets, ...values) => new Replicate(
  [new Given(targets[0], ...values)],
  Replicate.encodeTargetCells(targets, targets[0], graph),
  targets[0]);
// An irregular Replicate: one 2-cell Pair
// template, shifted onto every target's own (cell, offset-neighbour) pair.
const replicatePair = (targets, step, key, label) => new Replicate(
  [new Pair(key, label, targets[0], graph.step(targets[0], ...step))],
  Replicate.encodeTargetCells(targets, targets[0], graph),
  targets[0]);

// --- Shape domains: every cell starts with the unrestricted 7-value domain
// (one Replicate stamped over the whole grid),
// narrowed by intersection: a clue cell to OFF, and a border free cell to the
// shapes whose edges all point to an in-grid neighbour (a clue neighbour is
// ruled out by edge agreement below, not here).
const isBorder = cell => {
  const { row, col } = parseCellId(cell);
  return row === 1 || row === geometry.numRows || col === 1 || col === geometry.numCols;
};
const borderFreeCells = gridCells.filter(cell => isBorder(cell) && !isClue(cell));
const shapeDomains = [
  replicateGiven(gridCells, ...ALL_SHAPES),
  ...clues.map(({ r, c }) => new Given(makeCellId(r, c), OFF)),
  ...borderFreeCells.map(cell => {
    const { row, col } = parseCellId(cell);
    const allowed = ALL_SHAPES.filter(s =>
      !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
      !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s)));
    return new Given(cell, ...allowed);
  }),
];

// --- Edge agreement: neighbours must agree on their shared edge -- one uses
// it towards the other iff the other uses it back. Every cell with a right
// (respectively down) neighbour gets the identical relation to it, so each
// direction is one Replicate over all such cells (clue cells included: a
// clue's own Given(OFF) then forces its free neighbour off that edge too).
const edgeAgreeKey = (toB, toA) =>
  Pair.fnToKey((a, b) => toB(a) === toA(b), geometry);
const edgeRightKey = edgeAgreeKey(usesRight, usesLeft);
const edgeDownKey = edgeAgreeKey(usesDown, usesUp);
const rightNeighbourCells = gridCells.filter(cell => graph.step(cell, 0, 1));
const downNeighbourCells = gridCells.filter(cell => graph.step(cell, 1, 0));
const edgeRules = [
  replicatePair(rightNeighbourCells, [0, 1], edgeRightKey, 'edge-h'),
  replicatePair(downNeighbourCells, [1, 0], edgeDownKey, 'edge-v'),
];

// --- Single loop (narrowed -- see the header comment above): every on-loop
// cell must form one connected cell region. groupPrefix '' addresses the
// main grid directly (there is no separate overlay).
const connectivity = [new ConnectedValues('', ON_LOOP)];

// --- No two blackened cells share an edge. Only free cells can be
// blackened, so a pair is checked only when both its cells are free; a clue
// neighbour is excluded from each direction's target list here, not inside
// the predicate. One Replicate per direction over the (irregular, clue-cell
// gaps aside) remaining targets.
const noAdjacentBlackKey = Pair.fnToKey((a, b) => !(a === OFF && b === OFF), geometry);
const noAdjBlackRightCells = rightNeighbourCells.filter(
  cell => !isClue(cell) && !isClue(graph.step(cell, 0, 1)));
const noAdjBlackDownCells = downNeighbourCells.filter(
  cell => !isClue(cell) && !isClue(graph.step(cell, 1, 0)));
const noAdjacentBlack = [
  replicatePair(noAdjBlackRightCells, [0, 1], noAdjacentBlackKey, 'no-adjacent-black'),
  replicatePair(noAdjBlackDownCells, [1, 0], noAdjacentBlackKey, 'no-adjacent-black'),
];

// --- Arrow counts. For each clue, the ray of free cells from the clue to the
// far grid edge in its arrow direction (skipping any other clue cell the ray
// passes, since it is never blackened and contributes nothing -- built from
// the clues' fixed positions, not read from a cell). One small NFA per clue
// counts how many of those cells are OFF (blackened).
const STEP = { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] };
const rayFreeCells = (r, c, dir) => {
  const [dr, dc] = STEP[dir];
  const cells = [];
  for (let rr = r + dr, cc = c + dc;
    rr >= 1 && rr <= geometry.numRows && cc >= 1 && cc <= geometry.numCols;
    rr += dr, cc += dc) {
    const id = makeCellId(rr, cc);
    if (!isClue(id)) cells.push(id);
  }
  return cells;
};
const arrowSpecCache = new Map();
const arrowSpec = target => {
  if (!arrowSpecCache.has(target)) {
    arrowSpecCache.set(target, NFA.encodeSpec({
      startState: { count: 0 },
      transition: ({ count }, value) => {
        const next = count + (value === OFF ? 1 : 0);
        return next > target ? undefined : { count: next };
      },
      accept: ({ count }) => count === target,
    }, geometry));
  }
  return arrowSpecCache.get(target);
};
const arrowRules = clues.map(({ r, c, value, dir }) =>
  new NFA(arrowSpec(value), 'arrow-count', ...rayFreeCells(r, c, dir)));

return [
  gridShape,
  ...shapeDomains,
  ...edgeRules,
  ...connectivity,
  ...noAdjacentBlack,
  ...arrowRules,
];
