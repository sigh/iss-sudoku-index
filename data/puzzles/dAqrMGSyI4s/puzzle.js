// Title: Lupin's Loop 4 - Surrounded
// Author: Rab3aron
// Video: https://www.youtube.com/watch?v=dAqrMGSyI4s
// Source: https://sudokupad.app/0do1zxouyi

// Normal sudoku. A greater-than symbol points at the smaller number. Draw two
// orthogonal metro-line loops that never branch, cross, or overlap themselves or
// each other; they close into two loops, one lying entirely inside the other.
// Thick black walls cannot be crossed. Every station lies on a loop, and all cells
// on the same loop share one parity (the two loops may differ). A red sensor's
// digit = number of cells visited by either loop in the 3x3 box centred on it. A
// station's digit = the total number of stations holding that digit. The mirror
// cell (R4C1) is treated with the opposite of its real parity.
//
// Model: a wendezaune-style "shape" Var per cell records which of
// its four edges a loop uses (off / straight / one of four turns). Edge agreement
// between neighbours stitches the shapes into a disjoint union of orthogonal
// cycles -- which automatically enforces no-branch / no-cross / no-overlap and
// degree-2. Walls, station-on-loop, per-loop parity (propagated along loop
// edges, mirror-flipped at R4C1), sensor counts and the counting-station rule are
// domain restrictions / local NFAs / native constraints. NOT enforced locally:
// "exactly two loops" and "one loop lies inside the other" are global-topological
// and are omitted (partial encoding).

// Shape codes stored in each VS cell.
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

const constraints = [new Shape('9x9'), shape.toVar('shape')];
const add = (...c) => constraints.push(...c);
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];

// --- Clue reconstruction from the decode. ---
const stations = ['R9C8', 'R8C7', 'R7C5', 'R8C2', 'R6C6', 'R4C9', 'R1C7', 'R2C3', 'R5C8'];
const sensors = ['R3C8', 'R3C6', 'R4C5', 'R6C5', 'R7C3', 'R4C2'];
const MIRROR = 'R4C1';
// Walls: adjacent cell pairs the loop may not cross (left/top cell first).
const walls = [
  ['R7C2', 'R7C3'],   // vertical wall (horizontal neighbours)
  ['R8C4', 'R9C4'],   // horizontal wall (vertical neighbours)
  ['R5C1', 'R6C1'],
  ['R8C7', 'R8C8'],
  ['R3C1', 'R3C2'],
];

// --- Shape domains: forbid edges that leave the grid or cross a wall; stations
// may not be OFF (they must lie on a loop). ---
const forbidden = new Map(gridCells.map(c => [c, new Set()]));
for (const cell of gridCells) {
  const { row, col } = parseCellId(cell);
  const f = forbidden.get(cell);
  if (row === 1) f.add('U');
  if (row === geometry.numRows) f.add('D');
  if (col === 1) f.add('L');
  if (col === geometry.numCols) f.add('R');
}
for (const [a, b] of walls) {
  const ra = parseCellId(a), rb = parseCellId(b);
  if (ra.row === rb.row) { forbidden.get(a).add('R'); forbidden.get(b).add('L'); }
  else { forbidden.get(a).add('D'); forbidden.get(b).add('U'); }
}
const stationSet = new Set(stations);
const shapeOrigin = shape.cells()[0];
add(new Replicate([new Given(shapeOrigin, ...ALL_SHAPES)],
  Replicate.encodeTargetCells(shape.cells(), shapeOrigin, shape), shapeOrigin));
for (const cell of gridCells) {
  const f = forbidden.get(cell);
  const allowed = ALL_SHAPES.filter(s =>
    !(f.has('U') && usesUp(s)) && !(f.has('D') && usesDown(s)) &&
    !(f.has('L') && usesLeft(s)) && !(f.has('R') && usesRight(s)) &&
    !(stationSet.has(cell) && s === OFF));
  if (allowed.length !== ALL_SHAPES.length) add(new Given(shapeCell(cell), ...allowed));
}

// --- Edge agreement: neighbours agree on the shared edge, so used edges are
// mutual and every non-OFF cell has degree exactly two (=> loops). ---
const edgeAgree = (toB, toA) => NFA.encodeSpec({
  startState: { aUses: null },
  transition: ({ aUses }, value) => aUses === null
    ? { aUses: toB(value) }
    : (aUses === toA(value) ? { done: true } : undefined),
  accept: ({ done }) => done === true,
}, geometry.numValues);
const edgeRight = edgeAgree(usesRight, usesLeft);
const edgeDown = edgeAgree(usesDown, usesUp);
const rightTargets = gridCells.filter(cell => graph.step(cell, 0, 1)).map(shapeCell);
const downTargets = gridCells.filter(cell => graph.step(cell, 1, 0)).map(shapeCell);
add(new Replicate([new NFA(edgeRight, 'edge-h', shapeCell('R1C1'), shapeCell('R1C2'))],
  Replicate.encodeTargetCells(rightTargets, shapeCell('R1C1'), shape), shapeCell('R1C1')));
add(new Replicate([new NFA(edgeDown, 'edge-v', shapeCell('R1C1'), shapeCell('R2C1'))],
  Replicate.encodeTargetCells(downTargets, shapeCell('R1C1'), shape), shapeCell('R1C1')));

// --- Per-loop parity: two cells joined by a loop edge share parity. The mirror
// cell contributes its opposite parity. Reads [shapeA, digitA, digitB]. ---
const isMirror = cell => cell === MIRROR;
const parityEdge = (toB, aMirror, bMirror) => NFA.encodeSpec({
  startState: { phase: 'shape' },
  transition: (state, value) => {
    if (state.phase === 'shape') return { phase: 'digitA', joined: toB(value) };
    if (state.phase === 'digitA') {
      const pa = (value % 2) ^ (aMirror ? 1 : 0);
      return { phase: 'digitB', joined: state.joined, pa };
    }
    if (!state.joined) return { done: true };
    const pb = (value % 2) ^ (bMirror ? 1 : 0);
    return state.pa === pb ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);

for (const cell of gridCells) {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  if (right) {
    add(new NFA(parityEdge(usesRight, isMirror(cell), isMirror(right)),
      'par-h', shapeCell(cell), cell, right));
  }
  if (down) {
    add(new NFA(parityEdge(usesDown, isMirror(cell), isMirror(down)),
      'par-v', shapeCell(cell), cell, down));
  }
}

// --- Sensors: the sensor's own digit = number of on-loop (non-OFF) cells in the
// 3x3 box centred on it. Reads [sensorDigit, shape x9]. ---
const sensorMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value !== OFF ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
for (const s of sensors) {
  const box = graph.block(graph.step(s, -1, -1), 3, 3);
  add(new NFA(sensorMachine, 'sensor', s, ...box.map(shapeCell)));
}

// --- A station's digit = total stations holding that digit. ---
add(new CountingCircles(...stations));

// --- Greater-than symbols (point at the smaller number). ---
add(new GreaterThan('R6C3', 'R6C4'));
add(new GreaterThan('R1C4', 'R1C5'));
add(new GreaterThan('R2C9', 'R2C8'));

return constraints;
