// Title: Masyu
// Author: Jonas Gleim
// Video: https://www.youtube.com/watch?v=Xg9radRLT8s
// Source: http://pzv.jp/p.html?mashu/12/5/0000479c9220410c0000

// Masyu, 12x5. Draw a single loop through the centres of some cells, moving
// orthogonally, that never crosses or branches. The loop must pass through
// every circle: a white circle is a straight with a turn in at least one
// loop-neighbour; a black circle is a turn with a straight in both
// loop-neighbours. Not every cell needs to be on the loop.

// The grid has no digit/Sudoku layer at all: every cell's only state is a
// "shape" code, held directly on the main (Raw) grid -- OFF, or one of six
// on-loop shapes recording which two of the cell's four edges the loop uses
// there (a straight or a turn). Degree comes from each cell's own shape code
// (0 for OFF, 2 for any on-loop code), so branching is impossible by
// construction; edge-agreement `Pair`s make neighbouring cells' codes join up
// consistently across the edge between them. `ConnectedValues` over the
// on-loop codes then requires every on-loop cell to form one connected cell
// region.
//
// This narrows but does not fully close "a single loop": the rules forbid
// the loop crossing or branching, not touching, so two loop pieces could run
// cell-adjacent without sharing a used edge and still satisfy
// `ConnectedValues` while remaining two loops -- same residual as
// `59ojfgCC-tM.2` (Yajilin) and `VCPmKKtMbTc` (Modular Masyu), blocker #1117.

const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];
const ON_LOOP = [HORIZ, VERT, UL, UR, DL, DR];
const TURN_CODES = [UL, UR, DL, DR];
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;
const isTurn = s => TURN_CODES.includes(s);

const gridShape = new Shape('5x12', 7, 'Raw');
const graph = cellGraph(gridShape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Circle positions, transcribed from the source's own clue table.
const WHITE = [
  [2, 2], [2, 3], [2, 6], [2, 7], [2, 10], [2, 11],
  [3, 1],
  [4, 2], [4, 3], [4, 6], [4, 10], [4, 11],
].map(([r, c]) => makeCellId(r, c));
const BLACK = [[2, 5], [3, 6], [3, 9]].map(([r, c]) => makeCellId(r, c));

const DIRS = ['up', 'down', 'left', 'right'];
const usesDir = { up: usesUp, down: usesDown, left: usesLeft, right: usesRight };
const dirStep = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const presentDirs = cell => DIRS.filter(d => graph.step(cell, ...dirStep[d]));

// A group-domain Replicate: one Given template stamped over every target
// cell, target cells located on the main grid.
const replicateGiven = (targets, ...values) => new Replicate(
  [new Given(targets[0], ...values)],
  Replicate.encodeTargetCells(targets, targets[0], graph),
  targets[0]);
// An irregular Replicate: one 2-cell Pair template, shifted onto every
// target's own (cell, offset-neighbour) pair.
const replicatePair = (targets, step, key, label) => new Replicate(
  [new Pair(key, label, targets[0], graph.step(targets[0], ...step))],
  Replicate.encodeTargetCells(targets, targets[0], graph),
  targets[0]);

// --- Shape domains: every cell starts with the unrestricted 7-value domain
// (one Replicate over the whole grid), narrowed at border cells by
// intersecting a Given that drops any shape pointing off the grid. Circle
// cells get a further intersecting Given below (white: straight; black:
// turn); a circle on the border (R3C1) is settled by the intersection of
// both -- e.g. R3C1 has no left neighbour, so HORIZ is already excluded by
// the border Given, leaving VERT as its only straight option.
const isBorder = cell => {
  const { row, col } = parseCellId(cell);
  return row === 1 || row === geometry.numRows || col === 1 || col === geometry.numCols;
};
const borderCells = gridCells.filter(isBorder);
const shapeDomains = [
  replicateGiven(gridCells, ...ALL_SHAPES),
  ...borderCells.map(cell => {
    const { row, col } = parseCellId(cell);
    const allowed = ALL_SHAPES.filter(s =>
      !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
      !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s)));
    return new Given(cell, ...allowed);
  }),
];

// Every circle is on the loop: white circles are straight, black circles turn.
const circleDomains = [
  ...WHITE.map(cell => new Given(cell, HORIZ, VERT)),
  ...BLACK.map(cell => new Given(cell, ...TURN_CODES)),
];

// --- Edge agreement: neighbours must agree on their shared edge -- one uses
// it towards the other iff the other uses it back. Every cell with a right
// (respectively down) neighbour gets the identical relation, so each
// direction is one Replicate over all such cells.
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

// --- Black circle: must turn, and go straight through the cell on each side
// (the neighbour in each used direction continues in the same axis).
function blackMachine(dirs) {
  return NFA.encodeSpec({
    startState: { phase: 'shape' },
    transition: (state, value) => {
      if (state.phase === 'done') return { phase: 'done' };   // absorb extra symbols
      if (state.phase === 'shape') {
        if (!isTurn(value)) return undefined;
        return { phase: 'dir', idx: 0, shapeVal: value };
      }
      const dir = dirs[state.idx];
      if (usesDir[dir](state.shapeVal)) {
        const axis = (dir === 'up' || dir === 'down') ? VERT : HORIZ;
        if (value !== axis) return undefined;
      }
      const idx = state.idx + 1;
      return idx < dirs.length ? { phase: 'dir', idx, shapeVal: state.shapeVal } : { phase: 'done' };
    },
    accept: (state) => state.phase === 'done',
  }, geometry);
}
const blackRules = BLACK.map(cell => {
  const dirs = presentDirs(cell);
  const neighbourCells = dirs.map(d => graph.step(cell, ...dirStep[d]));
  return new NFA(blackMachine(dirs), 'black-straight-sides', cell, ...neighbourCells);
});

// --- White circle: must go straight, and turn on at least one side.
function whiteMachine(dirs) {
  return NFA.encodeSpec({
    startState: { phase: 'shape' },
    transition: (state, value) => {
      if (state.phase === 'done') return { phase: 'done' };   // absorb extra symbols
      if (state.phase === 'shape') {
        if (value !== HORIZ && value !== VERT) return undefined;
        return { phase: 'dir', idx: 0, shapeVal: value, sawTurn: false };
      }
      const dir = dirs[state.idx];
      const used = usesDir[dir](state.shapeVal);
      const sawTurn = state.sawTurn || (used && isTurn(value));
      const idx = state.idx + 1;
      if (idx < dirs.length) return { phase: 'dir', idx, shapeVal: state.shapeVal, sawTurn };
      return sawTurn ? { phase: 'done' } : undefined;
    },
    accept: (state) => state.phase === 'done',
  }, geometry);
}
const whiteRules = WHITE.map(cell => {
  const dirs = presentDirs(cell);
  const neighbourCells = dirs.map(d => graph.step(cell, ...dirStep[d]));
  return new NFA(whiteMachine(dirs), 'white-turn-side', cell, ...neighbourCells);
});

// --- Single loop (narrowed -- see the header comment above): every on-loop
// cell must form one connected cell region. groupPrefix '' addresses the
// main grid directly (there is no separate overlay).
const connectivity = [new ConnectedValues('', ON_LOOP)];

return [
  gridShape,
  ...shapeDomains,
  ...circleDomains,
  ...edgeRules,
  ...blackRules,
  ...whiteRules,
  ...connectivity,
];
