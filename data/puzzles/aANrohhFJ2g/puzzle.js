// Title: Atoll
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=aANrohhFJ2g
// Source: https://app.crackingthecryptic.com/sudoku/m73tnQmbbd

// Rules encoded below:
//   Normal sudoku rules apply.
//   Draw a loop (which never intersects with itself) through the centres of some
//   cells; the loop moves from cell to cell orthogonally.
//   Every cell is one of three types: inside the loop, outside the loop, or part
//   of the loop.
//   A 2x2 area cannot be entirely one cell type.
//   A green circle is inside the loop, a blue circle outside, a yellow circle
//   part of the loop.
//   A digit in a circle is the number of cells of its own type it sees
//   horizontally and vertically, including itself; the other cell types obstruct
//   vision.
//   Cells inside the loop form one orthogonally connected area, and cells
//   outside the loop are orthogonally connected to the edge of the grid.
//   Adjacent non-loop cells contain digits that differ by 5 or more; "adjacent"
//   is read as orthogonally adjacent, the default in this ruleset's other
//   pairwise wording.
// Nothing is omitted. Single-loop-ness is not a constraint of its own: it
// follows from the three rules that are encoded -- see the ConnectedValues note
// at the end.

// Cell state, one value per cell of an 11x11 layer (the 9x9 grid plus a
// one-cell border ring). A cell is outside the loop, inside it, or on it with
// one of the six ways a loop can pass through a cell.
const OUT = 1, IN = 2, HORIZ = 3, VERT = 4, UL = 5, UR = 6, DL = 7, DR = 8;
const ALL_STATES = [OUT, IN, HORIZ, VERT, UL, UR, DL, DR];
const LOOP_STATES = [HORIZ, VERT, UL, UR, DL, DR];

const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;

// The three cell types the rules speak about. LOOP merges the six shape codes,
// which differ only in how the loop passes through the cell.
const LOOP = 0;
const cellType = s => (s === OUT || s === IN) ? s : LOOP;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// The state layer is one cell larger on each side than the grid. The ring is
// pinned OUT so that "outside cells reach the grid edge" becomes a single
// connectivity assertion over the whole layer; no other rule reads the ring.
const PAD = 1;
const LAYER_SIZE = geometry.numRows + 2 * PAD;
const layer = cellGraph(`${LAYER_SIZE}x${LAYER_SIZE}`).makeOverlay('VS');
const stateLayer = layer.toVar('cell type');
const stateAt = (cell) => {
  const { row, col } = parseCellId(cell);
  return stateLayer.cell(row + PAD, col + PAD);
};
const gridStateCells = new Set(gridCells.map(stateAt));
const ringGivens = stateLayer.cells()
  .filter(cell => !gridStateCells.has(cell))
  .map(cell => new Given(cell, OUT));

// A grid cell may only take a shape whose edges stay on the grid.
const stateDomains = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const allowed = ALL_STATES.filter(s =>
    !(row === 1 && usesUp(s)) &&
    !(row === geometry.numRows && usesDown(s)) &&
    !(col === 1 && usesLeft(s)) &&
    !(col === geometry.numCols && usesRight(s)));
  return new Given(stateAt(cell), ...allowed);
});

// Edge agreement: two neighbouring cells must agree on whether the loop uses the
// edge between them. With every cell carrying exactly two used edges (or none),
// this makes the loop cells a union of simple closed loops, and lets the loop run
// alongside itself, which "never intersects with itself" permits.
const edgeAgreeKey = (fromA, fromB) =>
  Pair.fnToKey((a, b) => fromA(a) === fromB(b), geometry);
const edgeRightKey = edgeAgreeKey(usesRight, usesLeft);
const edgeDownKey = edgeAgreeKey(usesDown, usesUp);

// Adjacent non-loop cells differ by at least 5. Reads
// [stateA, digitA, stateB, digitB]; a loop cell at either end skips the
// remaining symbols of the pair.
const differenceMachine = NFA.encodeSpec({
  startState: { phase: 'stateA' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'stateA':
        return cellType(value) === LOOP
          ? { phase: 'skip', left: 3 } : { phase: 'digitA' };
      case 'digitA':
        return { phase: 'stateB', digitA: value };
      case 'stateB':
        return cellType(value) === LOOP
          ? { phase: 'skip', left: 1 }
          : { phase: 'digitB', digitA: state.digitA };
      case 'digitB':
        return Math.abs(state.digitA - value) >= 5 ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1
          ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);

// Right and down steps cover every orthogonal pair exactly once. Both rules are
// the same template at every cell that has such a neighbour, so the edge
// agreement is stamped with Replicate over the state layer; the difference rule
// reads grid cells too, which a single-layer Replicate cannot shift.
const stepRules = [[0, 1], [1, 0]].map(([dR, dC], index) => {
  const origins = gridCells.filter(cell => graph.step(cell, dR, dC));
  const template = new Pair(
    index === 0 ? edgeRightKey : edgeDownKey,
    index === 0 ? 'edge-h' : 'edge-v',
    stateLayer.cell(1, 1), stateLayer.cell(1 + dR, 1 + dC));
  return [
    layer.makeReplicate(template, origins.map(stateAt)),
    ...origins.map(cell => {
      const other = graph.step(cell, dR, dC);
      return new NFA(differenceMachine, index === 0 ? 'diff-h' : 'diff-v',
        stateAt(cell), cell, stateAt(other), other);
    }),
  ];
}).flat();

// Inside/outside is the even-odd rule for the loop as a closed curve. A ray cast
// leftwards from a cell's centre, raised just above the row's centre line, meets
// the loop exactly at the cells of that row that use their top edge, so a cell is
// inside iff an odd number of cells before it in its row use their top edge.
// Reads its row's state cells from column 1 up to and including the cell itself;
// a loop cell is unconstrained.
const insideParityMachine = NFA.encodeSpec({
  startState: { parity: 0, last: null },
  transition: ({ parity }, value) => ({
    parity: parity ^ (usesUp(value) ? 1 : 0),
    last: value,
  }),
  accept: ({ parity, last }) => {
    if (last === IN) return parity === 1;
    if (last === OUT) return parity === 0;
    return true;
  },
}, geometry.numValues);
const insideParity = gridCells.map(cell => new NFA(
  insideParityMachine, 'inside',
  ...graph.row(cell).slice(0, parseCellId(cell).col).map(stateAt)));

// A 2x2 area cannot be entirely one cell type. Reads the four state cells of the
// block and accepts only if two of them differ in type.
const mixedBlockMachine = NFA.encodeSpec({
  startState: { seen: null },
  transition: ({ seen }, value) => {
    if (seen === 'mixed') return { seen: 'mixed' };
    const type = cellType(value);
    if (seen === null) return { seen: type };
    return seen === type ? { seen: type } : { seen: 'mixed' };
  },
  accept: ({ seen }) => seen === 'mixed',
}, geometry.numValues);
const mixedBlocks = layer.makeReplicate(
  new NFA(mixedBlockMachine, 'block-2x2',
    stateLayer.cell(1, 1), stateLayer.cell(1, 2),
    stateLayer.cell(2, 1), stateLayer.cell(2, 2)),
  gridCells.filter(cell => graph.block(cell, 2, 2)).map(stateAt));

// The four circles, from the drawn overlay circles: green (#A3E048) is inside,
// blue (#34BBE6) outside, yellow (#F7D038) on the loop.
const circles = [
  { cell: 'R4C2', type: IN },
  { cell: 'R3C8', type: IN },
  { cell: 'R9C5', type: OUT },
  { cell: 'R8C7', type: LOOP },
];

const circleTypes = circles.map(({ cell, type }) => new Given(
  stateAt(cell), ...(type === LOOP ? LOOP_STATES : [type])));

// A circled digit counts the cells of the circle's own type it sees along the
// four orthogonal rays, itself included, with the other two types blocking. The
// digit is the first segment; each ray away from the circle is its own segment,
// so `blocked` resets at every segment break.
const sightMachine = (targetType) => NFA.encodeSpec({
  startState: { target: null, count: 0, blocked: false },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return { target: state.target, count: state.count, blocked: false };
    }
    if (state.target === null) return { target: value, count: 1, blocked: false };
    if (state.blocked) return state;
    if (cellType(value) !== targetType) {
      return { target: state.target, count: state.count, blocked: true };
    }
    const count = state.count + 1;
    return count > state.target
      ? undefined : { target: state.target, count, blocked: false };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues, { multiSegment: true });

const sightCounts = circles.map(({ cell, type }) => {
  const rays = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    .map(([dR, dC]) => graph.ray(cell, dR, dC).slice(1).map(stateAt))
    .filter(ray => ray.length > 0);
  return new NFA(sightMachine(type), 'sight', [cell], ...rays);
});

return [
  new Shape('9x9'),
  new Given('R1C6', 5),
  new Given('R8C7', 7),
  new Given('R9C5', 2),
  stateLayer,
  ...ringGivens,
  ...stateDomains,
  ...stepRules,
  ...insideParity,
  mixedBlocks,
  ...circleTypes,
  ...sightCounts,
  // Inside cells form one orthogonally connected area; outside cells are
  // orthogonally connected to the grid edge, which is the pinned ring.
  // Together with the 2x2 rule these also force the loop to be a single loop:
  // a second, disjoint loop puts either a second enclosed inside area (the
  // first assertion then fails) or an enclosed outside area cut off from the
  // ring (the second fails), and a loop enclosing no cell at all would need a
  // 2x2 block of loop cells.
  new ConnectedValues('VS', IN),
  new ConnectedValues('VS', OUT),
];
