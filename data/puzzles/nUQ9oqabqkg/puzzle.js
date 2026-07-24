// Title: The 'No-9 Line'
// Author: Timpanist
// Video: https://www.youtube.com/watch?v=nUQ9oqabqkg
// Source: https://sudokupad.app/185kxmxozs
//
// Normal sudoku rules apply.
//
// Loop: draw a single closed loop that moves orthogonally and does not
// branch or intersect itself. The loop must visit every cell except the
// nine cells that contain a 9.
//
// Box-local sums: the 3x3 box borders divide the loop into segments; within
// a box every segment must have the same sum (the sum may vary by box), and
// every box must have at least two segments. Segment SUMS are not encoded
// here (an unknown-partition equal-sum rule with no faithful ISS primitive);
// the segment-COUNT floor ("at least two segments", i.e. at least four
// box-boundary crossings) is encoded below, since box membership is static
// and crossings are a derivable count.
//
// No two orthogonally-adjacent cells directly connected by the loop may sum
// to 9.
//
// Loop model: one Var per grid cell records which of its (up to four) edges
// the loop uses -- off, or one of six on-shapes (straight horizontal/
// vertical, four turns). A cell's shape is OFF exactly when its digit is 9
// and an on-shape otherwise, which ties loop membership to the digit and
// forces exactly two used edges per on-loop cell (zero for a 9-cell) --
// never a branch or a self-crossing. The rules do not say the loop cannot
// touch itself, so no anti-touch rule is added, and ConnectedValues over the
// on-shapes is a sound, best-effort narrowing rather than a full single-loop
// closure (a pair of loops that only touch cell-to-cell without sharing a
// used edge would not be caught).

const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const ON_SHAPES = [HORIZ, VERT, UL, UR, DL, DR];
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const boxes = graph.boxes();

const shape = graph.makeOverlay('VS');
const shapeCell = cell => shape.at(cell);

const givens = [
  new Given('R1C4', 2),
  new Given('R2C2', 7),
  new Given('R5C6', 2),
  new Given('R7C8', 5),
  new Given('R8C6', 6),
  new Given('R9C5', 2),
];

// --- Shape domains: forbid edges that would point off the grid. ---
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];
const shapeDomains = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const allowed = ALL_SHAPES.filter(s =>
    !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
    !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s)));
  return new Given(shapeCell(cell), ...allowed);
});

// --- Loop membership tied to the digit: a cell is off the loop (shape OFF)
// exactly when its own digit is 9, on (one of the six on-shapes) otherwise.
const membershipKey = Pair.fnToKey(
  (digit, shapeVal) => (digit === 9) === (shapeVal === OFF), geometry.numValues);
const membershipLinks = gridCells.map(cell =>
  new Pair(membershipKey, 'no9-membership', cell, shapeCell(cell)));

// --- Edge agreement: neighbours must agree on the shared edge. Reads the two
// cells' shapes; the first uses the edge towards the second iff the second
// uses the edge back.
const edgeAgreeKey = (toB, toA) => Pair.fnToKey(
  (a, b) => toB(a) === toA(b), geometry.numValues);

// --- No two loop-connected cells sum to 9. Reads [shapeA, digitA, digitB];
// `toB` says whether A uses the edge to B (edge agreement guarantees B
// agrees), so the digits are only constrained when the edge is actually used.
const noSumNineEdge = (toB) => NFA.encodeSpec({
  startState: { phase: 'shape' },
  transition: (state, value) => {
    if (state.phase === 'shape') return { phase: 'digitA', joined: toB(value) };
    if (state.phase === 'digitA') return { phase: 'digitB', joined: state.joined, digitA: value };
    if (!state.joined) return { done: true };
    return (state.digitA + value === 9) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);

const sumRight = noSumNineEdge(usesRight), sumDown = noSumNineEdge(usesDown);

// Right/down steps only: each orthogonal pair is covered once.
const edgeRules = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  return [
    ...(right ? [
      new NFA(sumRight, 'no-sum9-h', shapeCell(cell), cell, right),
    ] : []),
    ...(down ? [
      new NFA(sumDown, 'no-sum9-v', shapeCell(cell), cell, down),
    ] : []),
  ];
});
const replicateEdgeAgreement = (name, key, dRow, dCol) => {
  const origins = gridCells.filter(cell => graph.step(cell, dRow, dCol));
  const origin = origins[0];
  return shape.makeReplicate(
    [new Pair(key, name, shapeCell(origin), shapeCell(graph.step(origin, dRow, dCol)))],
    shape.at(origins));
};
const edgeAgreements = [
  replicateEdgeAgreement('edge-h', edgeAgreeKey(usesRight, usesLeft), 0, 1),
  replicateEdgeAgreement('edge-v', edgeAgreeKey(usesDown, usesUp), 1, 0),
];

// --- Box-local segment floor: a box has >=2 segments iff the loop crosses
// its border on >=4 (cell, outward-direction) edges -- each excursion into
// or out of the box contributes one entry and one exit crossing, and
// segments = crossings / 2 for a closed loop. Box membership is fixed
// geometry, so the crossing candidates are known; only whether each is
// actually used (via the cell's own shape) is unknown.
const DIRS = [
  { dRow: -1, dCol: 0, uses: usesUp },
  { dRow: 1, dCol: 0, uses: usesDown },
  { dRow: 0, dCol: -1, uses: usesLeft },
  { dRow: 0, dCol: 1, uses: usesRight },
];
const boxOf = new Map();
boxes.forEach((box, i) => box.forEach(cell => boxOf.set(cell, i)));

// Reads one shape value per crossing candidate (checkers[i] matches position
// i), counting how many indicate the edge is used, saturating at threshold.
// Compilation explores one hypothetical extra read past the real scan length,
// so once every candidate has been read the state becomes a fixed sink
// (ignoring any further symbol) instead of indexing off the end of checkers.
const crossingCountMachine = (checkers, threshold) => NFA.encodeSpec({
  startState: { i: 0, count: 0 },
  transition: ({ i, count }, value) => {
    if (i >= checkers.length) return { i, count };
    const hit = checkers[i](value) ? 1 : 0;
    return { i: i + 1, count: Math.min(count + hit, threshold) };
  },
  accept: ({ count }) => count >= threshold,
}, geometry.numValues);

const segmentFloors = boxes.map(box => {
  const crossingCells = [];
  const checkers = [];
  for (const cell of box) {
    for (const { dRow, dCol, uses } of DIRS) {
      const neighbour = graph.step(cell, dRow, dCol);
      if (neighbour && boxOf.get(neighbour) !== boxOf.get(cell)) {
        crossingCells.push(shapeCell(cell));
        checkers.push(uses);
      }
    }
  }
  return new NFA(crossingCountMachine(checkers, 4), 'box-segments-floor', ...crossingCells);
});

return [
  new Shape('9x9'),
  ...givens,
  shape.toVar('loop-shape'),
  ...shapeDomains,
  ...membershipLinks,
  ...edgeAgreements,
  ...edgeRules,
  ...segmentFloors,
  // Best-effort single-loop narrowing (see the header comment).
  new ConnectedValues('VS', ON_SHAPES),
];
