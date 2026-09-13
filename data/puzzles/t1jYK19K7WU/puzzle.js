// Title: Halo Loop
// Author: Derek LeClair
// Video: https://www.youtube.com/watch?v=t1jYK19K7WU
// Source: https://sudokupad.app/avvo3j3xng

// Standard 9x9 sudoku. Draw a single loop that moves orthogonally from cell to
// cell and never crosses or overlaps itself -- "overlaps" is about revisiting a
// cell, not about adjacency, so two loop cells may sit next to each other
// without a used edge between them; the loop may run alongside itself (same
// reading as data/puzzles/bhKtKFEy0AM's near-identical rules text). A digit in
// a circle is that cell's own sudoku digit, and it counts how many of the
// circle's up to 8 king-move neighbours the loop passes through; the loop
// itself may not enter a circled cell. Adjacent digits along the loop (cells
// joined by a used loop edge) differ by at least 5.

// Shape codes (the value stored in each VS cell): which of a cell's four edges
// the loop uses -- off, a straight, or one of four corners (turns).
const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shape = graph.makeOverlay('VS');
const shapeCell = cell => shape.at(cell);
const gridCells = graph.cells();

// Circle cells: white circle underlay, drawn at cell centre.
const circles = ['R1C1', 'R2C1', 'R3C1', 'R1C6', 'R2C9', 'R5C8', 'R6C3', 'R7C5', 'R9C9'];
const circleSet = new Set(circles);

// --- Shape domains: a cell may use an edge only if the neighbour exists, so
// border cells can't take shapes that point off the grid. Circle cells are
// further restricted to OFF: the loop cannot pass through them.
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];
const shapeDomainConstraints = gridCells.map(cell => {
  if (circleSet.has(cell)) return new Given(shapeCell(cell), OFF);
  const { row, col } = parseCellId(cell);
  const allowed = ALL_SHAPES.filter(s =>
    !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
    !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s)));
  return new Given(shapeCell(cell), ...allowed);
});

// --- Global loop connectivity: the loop cells (shape != OFF) must form a
// single orthogonally-connected region. `shape` is a whole grid layer (one Var
// per cell), so ConnectedValues applies directly. This is CELL connectivity,
// not edge/loop connectivity: the rules only forbid the loop branching or
// crossing itself, not touching itself, so two disjoint loops running
// cell-adjacent (without sharing a used edge) would still pass this check. It
// is nonetheless a sound strengthening -- any genuine single loop is
// cell-connected -- that rules out loop cells split into components that
// never even touch. Proving there is exactly one loop needs used-edge
// connectivity, which ISS has no primitive for (blocker #859) and which has no
// closing technique here since no clue forces a specific cell onto the route
// (blocker #1117): single-loop connectivity beyond this is a declared
// omission, not encoded.
const loopConnectivity = new ConnectedValues('VS', [HORIZ, VERT, UL, UR, DL, DR]);

// --- Edge agreement: neighbours must agree on the shared edge. A pure 2-cell
// relation on the two cells' shapes: the first uses the edge towards the
// second iff the second uses the edge back. `toB`/`toA` say whether a shape
// uses that shared edge.
const edgeAgreeKey = (toB, toA) =>
  Pair.fnToKey((a, b) => toB(a) === toA(b), geometry.numValues);

// --- Loop differences: two cells joined by a loop edge differ by at least 5.
// Reads [shapeA, digitA, digitB]; `toB` says whether A uses the edge to B (edge
// agreement guarantees B agrees), so digits are only constrained when joined.
const diffEdge = (toB) => NFA.encodeSpec({
  startState: { phase: 'shape' },
  transition: (state, value) => {
    if (state.phase === 'shape') return { phase: 'digitA', joined: toB(value) };
    if (state.phase === 'digitA') return { phase: 'digitB', joined: state.joined, digitA: value };
    if (!state.joined) return { done: true };
    return Math.abs(state.digitA - value) >= 5 ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);

// Apply both to every right and down neighbour pair.
const edgeRightKey = edgeAgreeKey(usesRight, usesLeft), edgeDownKey = edgeAgreeKey(usesDown, usesUp);
const diffRight = diffEdge(usesRight), diffDown = diffEdge(usesDown);
const edgeAndDiffConstraints = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  return [
    ...(right ? [new NFA(diffRight, 'diff-h', shapeCell(cell), cell, right)] : []),
    ...(down ? [new NFA(diffDown, 'diff-v', shapeCell(cell), cell, down)] : []),
  ];
});

const edgeAgreementConstraints = [
  shape.makeReplicate(
    new Pair(edgeRightKey, 'edge-h', shapeCell('R1C1'), shapeCell('R1C2')),
    shape.at(gridCells.filter(cell => graph.step(cell, 0, 1)))),
  shape.makeReplicate(
    new Pair(edgeDownKey, 'edge-v', shapeCell('R1C1'), shapeCell('R2C1')),
    shape.at(gridCells.filter(cell => graph.step(cell, 1, 0)))),
];

// --- Circle counts: a circle's own digit equals how many of its up-to-8 king
// neighbours are on the loop (any shape other than OFF). Reads the circle
// cell's digit, then each king neighbour's shape.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };   // the circle's own digit
    const next = count + (value !== OFF ? 1 : 0);
    return next > target ? [] : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const circleConstraints = circles.map(cell => new NFA(countMachine, 'circle-count',
  cell, ...shape.at(graph.kingNeighbours(cell))));

return [
  new Shape('9x9'),
  shape.toVar('shape'),
  ...shapeDomainConstraints,
  loopConnectivity,
  ...edgeAgreementConstraints,
  ...edgeAndDiffConstraints,
  ...circleConstraints,
];
