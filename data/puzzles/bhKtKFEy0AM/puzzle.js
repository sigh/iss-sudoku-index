// Title: Wendezaeune
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=bhKtKFEy0AM
// Source: https://sudokupad.app/uevzycz28t

// Standard 9x9 sudoku. Draw a single loop through cell centres that travels
// orthogonally and may go straight or turn within a cell, but never branches or
// crosses itself. The loop may run alongside itself, so two loop cells can be
// adjacent without being connected. Adjacent digits along the loop differ by at
// least 5. Each circle sits on a grid vertex; its digit is how many of the four
// cells around that vertex are turns of the loop, and at least one of those four
// cells holds that digit.
//
// Each cell has a "shape" Var recording which of its four edges the loop uses:
// off, a straight (horizontal/vertical), or one of four corners (turns). Edge
// agreement between neighbours makes the shapes join up into loops.

// Shape codes (the value stored in each VS cell).
const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;
const isTurn = s => s >= UL;   // the four corners

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shape = graph.makeOverlay('VS');
const shapeCell = cell => shape.at(cell);
const gridCells = graph.cells();

// Each circle sits on a grid vertex, keyed by the top-left cell of the 2x2 it
// constrains; the value is the clue digit.
const circleClues = {
  R2C1: 4, R5C1: 3, R6C2: 2, R7C3: 4, R8C5: 1,
  R2C5: 2, R1C3: 2, R4C6: 2, R7C7: 2, R5C8: 1,
};

// --- Shape domains: a cell may use an edge only if the neighbour exists, so
// border cells can't take shapes that point off the grid.
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];
const shapeDomainConstraints = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const allowed = ALL_SHAPES.filter(s =>
    !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
    !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s)));
  return new Given(shapeCell(cell), ...allowed);
});

// --- Global loop connectivity: the loop cells (shape != OFF) must form a
// single orthogonally-connected region. `shape` is a whole grid layer (one
// Var per cell), so ConnectedValues applies directly. This is CELL
// connectivity, not edge/loop connectivity: the rules only forbid the loop
// branching or crossing itself, not touching itself, so two disjoint loops
// running cell-adjacent (without sharing a used edge) would still pass this
// check. It is nonetheless a sound strengthening -- any genuine single loop
// is cell-connected -- that rules out loop cells split into components that
// never even touch.
const loopConnectivity = new ConnectedValues('VS', [HORIZ, VERT, UL, UR, DL, DR]);

// --- Edge agreement: neighbours must agree on the shared edge. A pure
// 2-cell relation on the two cells' shapes: the first uses the edge towards
// the second iff the second uses the edge back. `toB`/`toA` say whether a
// shape uses that shared edge.
const edgeAgreeKey = (toB, toA) =>
  Pair.fnToKey((a, b) => toB(a) === toA(b), geometry.numValues);

// --- Loop differences: two cells joined by a loop edge differ by at least 5.
// Reads [shapeA, digitA, digitB]; `toB` says whether A uses the edge to B (edge
// agreement guarantees B agrees), so we only constrain the digits when joined.
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
    ...(right ? [
      new NFA(diffRight, 'diff-h', shapeCell(cell), cell, right),
    ] : []),
    ...(down ? [
      new NFA(diffDown, 'diff-v', shapeCell(cell), cell, down),
    ] : []),
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

// --- Circle clues. Each vertex's clue does two things: at least one of the four
// cells around it holds the clue digit (a Quad on that 2x2), and exactly that many
// of the four cells are turns of the loop (a count over their shapes).
const memo = (fn) => { const m = new Map(); return k => (m.has(k) ? m : m.set(k, fn(k))).get(k); };
const turnsExactly = memo((target) => NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) => {
    const next = count + (isTurn(value) ? 1 : 0);
    return next > target ? [] : { count: next };
  },
  accept: ({ count }) => count === target,
}, geometry.numValues));
const circleConstraints = Object.entries(circleClues).flatMap(([topLeft, d]) => [
  new Quad(topLeft, d),
  new NFA(turnsExactly(d), 'circle-turns',
    ...shape.at(graph.block(topLeft, 2, 2))),
]);

return [
  new Shape('9x9'),
  new Given('R1C1', 6),
  shape.toVar('shape'),
  ...shapeDomainConstraints,
  loopConnectivity,
  ...edgeAgreementConstraints,
  ...edgeAndDiffConstraints,
  ...circleConstraints,
];
