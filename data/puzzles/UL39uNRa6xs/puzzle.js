// Title: Parity Loop
// Author: Paletron
// Video: https://www.youtube.com/watch?v=UL39uNRa6xs
// Source: https://app.crackingthecryptic.com/sudoku/LqdQnHfdnM

// Normal sudoku rules apply. Draw a single closed loop, moving orthogonally
// through the centres of some cells, that does not branch and does not cross
// itself (the rule names only these two exclusions, so running alongside or
// touching itself is legal and must stay legal in the model). Along the loop,
// digit parity matches between consecutive loop cells unless the edge between
// them crosses a box border, in which case it switches. The loop passes
// through every circle; a circled cell's own sudoku digit counts how many
// cells it visits around it (its up-to-8 king neighbours plus itself, max 9)
// -- every circle in this puzzle is drawn blank, so this is the only place
// that count is recorded. Marked V/X dominoes sum to 5/10; only the drawn
// dominoes are constrained.
//
// A branch or crossing needs a cell using 3+ of its 4 sides; since the loop
// may touch itself, "on the loop" is not one flag per cell but one of 7 shape
// codes (off, or one of the 6 ways to use exactly 2 of the 4 sides), so
// degree is a property of the code itself rather than of counting on-loop
// neighbours -- counting neighbours would also forbid two loop strands
// sitting in adjacent cells without being connected, which the rules permit.
// Pairwise edge-agreement then ties each shared side to its neighbour's use of
// the opposite side. ConnectedValues over the non-off codes still requires
// the visited cells to form one connected blob, but (given touching is legal)
// does not by itself rule out two touching-but-disjoint loops.

const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
// Which of the 4 sides each shape code uses.
const SIDES = {
  [OFF]: [],
  [HORIZ]: ['left', 'right'],
  [VERT]: ['up', 'down'],
  [UL]: ['up', 'left'],
  [UR]: ['up', 'right'],
  [DL]: ['down', 'left'],
  [DR]: ['down', 'right'],
};
function usesSide(code, side) { return (SIDES[code] || []).includes(side); }

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shape = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Drawn circle overlays (all blank).
const circles = [
  'R1C1', 'R1C5', 'R2C7', 'R2C8', 'R6C3', 'R7C3', 'R7C4', 'R7C5', 'R7C7',
];

// --- Shape domain: every cell is off-loop or one of the 6 on-loop shapes;
// the loop passes through every circle, so circles exclude off-loop.
const originCell = shape.cells()[0];
const domain = [
  shape.makeReplicate(new Given(originCell, OFF, HORIZ, VERT, UL, UR, DL, DR)),
  ...shape.at(circles).map(cell => new Given(cell, HORIZ, VERT, UL, UR, DL, DR)),
];

// --- Border cells cannot use a side that runs off the grid: a code using
// such a side would claim an edge with no neighbour to agree on it, which the
// edge-agreement Pairs below never check (they range only over real edges).
const STEP_FOR_SIDE = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const ALL_CODES = [OFF, HORIZ, VERT, UL, UR, DL, DR];
const boundary = gridCells.flatMap(cell => {
  const missing = Object.entries(STEP_FOR_SIDE)
    .filter(([, [dR, dC]]) => graph.step(cell, dR, dC) === null)
    .map(([side]) => side);
  if (missing.length === 0) return [];  // interior cell: no extra restriction
  const validCodes = ALL_CODES.filter(
    code => SIDES[code].every(side => !missing.includes(side)));
  return [new Given(shape.at(cell), ...validCodes)];
});

// --- Edge agreement: a cell's use of a shared side must match its neighbour's
// use of the opposite side (off-off, unused-unused and used-used all agree; a
// used side facing an unused one does not). One horizontal and one vertical
// Replicate stamps the same two-cell Pair template onto every grid edge.
const rightLeftKey = Pair.fnToKey(
  (a, b) => usesSide(a, 'right') === usesSide(b, 'left'), geometry.numValues);
const downUpKey = Pair.fnToKey(
  (a, b) => usesSide(a, 'down') === usesSide(b, 'up'), geometry.numValues);
const firstCell = gridCells[0];
const agreements = [
  shape.makeReplicate(
    new Pair(rightLeftKey, 'edge-h', shape.at(firstCell), shape.at(graph.step(firstCell, 0, 1))),
    shape.at(gridCells.filter(cell => graph.step(cell, 0, 1)))),
  shape.makeReplicate(
    new Pair(downUpKey, 'edge-v', shape.at(firstCell), shape.at(graph.step(firstCell, 1, 0))),
    shape.at(gridCells.filter(cell => graph.step(cell, 1, 0)))),
];

// --- Circle counts: a circle's own digit equals 1 (itself, always on-loop)
// plus how many of its king neighbours are visited (any non-off shape).
// Reads the digit, then own shape, then each king neighbour's shape.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };  // own digit first
    const next = count + (value !== OFF ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const circleCounts = circles.map(cell => new NFA(countMachine, 'circle-count',
  cell, shape.at(cell), ...shape.at(graph.kingNeighbours(cell))));

// --- Loop parity: for two orthogonally-adjacent cells whose shared side is
// actually used by the loop (per the shape codes, not mere adjacency), digit
// parity matches unless the edge crosses a box border, in which case it must
// differ -- "the loop travels on cells of the same parity ... when it crosses
// a box border, the parity switches" read literally: match by default, switch
// only at a box crossing. Box-crossing is fixed geometry (standard 3x3
// boxes), computed once per edge below, not solver state. Reads (own shape,
// own digit, other shape, other digit); an edge neither side uses is
// unconstrained.
function parityMachine(mustMatch, side) {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: (state, value) => {
      if (state.phase === 'start') {
        return usesSide(value, side) ? { phase: 'usedA' } : { phase: 'skip', left: 3 };
      }
      if (state.phase === 'usedA') return { phase: 'digitB', aDigit: value };
      if (state.phase === 'digitB') return { phase: 'digitOther', aDigit: state.aDigit };
      if (state.phase === 'digitOther') {
        const same = (state.aDigit % 2) === (value % 2);
        return same === mustMatch ? { phase: 'done' } : undefined;
      }
      if (state.phase === 'skip') {
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
      }
    },
    accept: ({ phase }) => phase === 'done',
  }, geometry.numValues);
}
const sameH = parityMachine(true, 'right');
const switchH = parityMachine(false, 'right');
const sameV = parityMachine(true, 'down');
const switchV = parityMachine(false, 'down');
// 0-based box index (standard 3x3 boxes); differs across an edge only when
// that edge crosses a box border.
function boxIndex(cell) {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
}
const parityEdges = [];
for (const cell of gridCells) {
  const right = graph.step(cell, 0, 1);
  if (right) {
    const m = boxIndex(cell) !== boxIndex(right) ? switchH : sameH;
    parityEdges.push(new NFA(m, 'parity-h', shape.at(cell), cell, shape.at(right), right));
  }
  const down = graph.step(cell, 1, 0);
  if (down) {
    const m = boxIndex(cell) !== boxIndex(down) ? switchV : sameV;
    parityEdges.push(new NFA(m, 'parity-v', shape.at(cell), cell, shape.at(down), down));
  }
}

// --- V/X dominoes -- drawn marks only.
const xDominoes = [
  new X('R4C2', 'R4C3'),
  new X('R3C5', 'R3C6'),
  new X('R5C1', 'R6C1'),
];
const vDominoes = [
  new V('R3C7', 'R3C8'),
];

return [
  new Shape('9x9'),
  new Given('R1C9', 8),
  new Given('R5C6', 5),
  new Given('R8C5', 7),
  new Given('R9C2', 8),
  new Given('R9C9', 7),

  shape.toVar('shape'),
  ...domain,
  ...boundary,
  ...agreements,
  // Visited cells form one connected blob; does not by itself exclude two
  // touching-but-disjoint loops.
  new ConnectedValues('VS', `${HORIZ}_${VERT}_${UL}_${UR}_${DL}_${DR}`),
  ...circleCounts,
  ...parityEdges,
  ...xDominoes,
  ...vDominoes,
];
