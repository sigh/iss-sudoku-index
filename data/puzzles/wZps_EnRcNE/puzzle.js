// Title: Rockingham
// Author: damo_89
// Video: https://www.youtube.com/watch?v=wZps_EnRcNE
// Source: https://sudokupad.app/9o9qq364b1

// Mid Loop: draw a single 1-cell-wide loop of orthogonally connected cells
// that does not branch or enter any cell more than once. The loop must pass
// through every given (grey) dot, and each dot must sit in the middle of a
// straight loop segment: the distance from the dot to the next turn along
// the loop must be identical in both directions.
//
// Ambiguous Kropki: digits separated by a grey dot are consecutive or one is
// double the other. Adjacent digits on the loop not separated by a dot must
// NOT be consecutive and must NOT be in a double relationship.
//
// Each cell has a "shape" Var recording which of its four edges the loop
// uses: off, a straight (horizontal/vertical), or one of four corners
// (turns) -- same representation as data/scripts/wendezaune.js. Edge
// agreement between neighbours joins the shapes into loops. Dots force their
// edge into the loop. Because a straight loop segment can never leave the
// row/column it started in (leaving requires a turn), each dot's "equal
// distance to the next turn in both directions" rule is fully local to that
// dot's own row (horizontal dot) or column (vertical dot), so it is encoded
// as one NFA scanning that row/column's nine shape cells.

const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shape = graph.makeOverlay('VS');
const shapeVar = shape.toVar('shape');
const gridCells = graph.cells();

// --- Givens ---
const givens = {
  R1C5: 2, R2C2: 1, R2C8: 9, R3C8: 3, R4C3: 4, R4C6: 7, R5C9: 5,
  R7C2: 8, R7C8: 6,
};

// --- Grey dots: each is the edge between two named cells. ---
const dots = [
  ['R1C1', 'R2C1'], ['R6C1', 'R7C1'], ['R3C1', 'R3C2'], ['R3C2', 'R4C2'],
  ['R2C3', 'R2C4'], ['R1C8', 'R1C9'], ['R4C4', 'R4C5'], ['R4C7', 'R4C8'],
  ['R3C9', 'R4C9'], ['R5C7', 'R5C8'], ['R7C3', 'R7C4'], ['R7C7', 'R8C7'],
  ['R9C3', 'R9C4'], ['R9C7', 'R9C8'],
];
const dotEdgeKey = (a, b) => `${a}|${b}`;
const dotEdges = new Set(dots.map(([a, b]) => dotEdgeKey(a, b)));

// --- Shape domains: a cell may use an edge only if the neighbour exists
// (border restriction), further intersected with any direction a dot on one
// of its edges forces it to use.
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];
const requiredDirs = {}; // cell -> {up,down,left,right} booleans forced by a dot
for (const [a, b] of dots) {
  const { row: ra, col: ca } = parseCellId(a);
  const { row: rb, col: cb } = parseCellId(b);
  requiredDirs[a] = requiredDirs[a] || {};
  requiredDirs[b] = requiredDirs[b] || {};
  if (ra === rb) { // horizontal edge: a is left of b
    requiredDirs[a].right = true;
    requiredDirs[b].left = true;
  } else { // vertical edge: a is above b
    requiredDirs[a].down = true;
    requiredDirs[b].up = true;
  }
}

// --- Edge agreement: neighbours must agree on the shared edge. This is a
// plain binary relation between two shape cells (a Pair), and every
// instance is the same template shifted by a uniform offset (+1 column for
// edge-h, +1 row for edge-v) over shape cells only -- both entirely within
// the VS overlay subgraph -- so each direction is one Replicate.
const edgeAgreeKey = (toB, toA) => Pair.fnToKey((a, b) => toB(a) === toA(b), geometry.numValues);
const edgeRightKey = edgeAgreeKey(usesRight, usesLeft);
const edgeDownKey = edgeAgreeKey(usesDown, usesUp);
const rightBases = gridCells.filter(cell => graph.step(cell, 0, 1));
const downBases = gridCells.filter(cell => graph.step(cell, 1, 0));

// --- Ambiguous-Kropki digit rule along loop edges: reads [shapeA, digitA,
// digitB]; `toB` says whether A uses the edge to B (edge agreement
// guarantees B agrees). When joined, the dot/no-dot relation must hold;
// unjoined pairs are unconstrained.
const relHolds = (a, b) => Math.abs(a - b) === 1 || a === 2 * b || b === 2 * a;
const relEdge = (toB, requireRel) => NFA.encodeSpec({
  startState: { phase: 'shape' },
  transition: (state, value) => {
    if (state.phase === 'shape') return { phase: 'digitA', joined: toB(value) };
    if (state.phase === 'digitA') return { phase: 'digitB', joined: state.joined, digitA: value };
    if (!state.joined) return { done: true };
    return relHolds(state.digitA, value) === requireRel ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const dotRight = relEdge(usesRight, true), dotDown = relEdge(usesDown, true);
const noDotRight = relEdge(usesRight, false), noDotDown = relEdge(usesDown, false);

// --- Mid-loop symmetry: for each dot, the run of consecutive straight
// (HORIZ, for a horizontal dot; VERT, for a vertical dot) cells extending
// from the dot's edge must be equally long on both sides. Scans the full
// row (horizontal dot) or column (vertical dot) of nine shape cells, in
// order, tracking the left-side run ending at the dot's first cell and the
// right-side run starting at the dot's second cell (frozen once a non-
// straight cell is hit, or at the far end of the row/column).
const memo = (fn) => { const m = new Map(); return k => (m.has(k) ? m : m.set(k, fn(k))).get(k); };
const straightSymmetryMachine = memo((key) => {
  const [p, straightCode, n] = key.split(':').map(Number);
  return NFA.encodeSpec({
    startState: { idx: 1, leftRun: 0, leftDist: null, rightRun: 0, rightDist: null },
    transition: (state, value) => {
      let { idx, leftRun, leftDist, rightRun, rightDist } = state;
      // Freeze once the whole row/column has been read: the accept check
      // only depends on leftDist/rightDist, so absorb any further symbols
      // (the compiler explores paths past the true 9-symbol input; without
      // this the idx/run counters would grow without bound).
      if (idx > n) return state;
      const straight = value === straightCode;
      if (idx <= p) {
        leftRun = straight ? leftRun + 1 : 0;
        if (idx === p) leftDist = leftRun;
      } else if (idx === p + 1) {
        rightRun = straight ? 1 : 0;
        if (!straight) rightDist = 0;
      } else if (rightDist === null) {
        if (straight) rightRun = rightRun + 1;
        else rightDist = rightRun;
      }
      return { idx: idx + 1, leftRun, leftDist, rightRun, rightDist };
    },
    accept: (state) => {
      const finalRight = state.rightDist === null ? state.rightRun : state.rightDist;
      return state.leftDist === finalRight;
    },
  }, geometry.numValues);
});

return [
  new Shape('9x9'),
  shapeVar,
  // --- Global connectivity: the non-OFF (on-loop) cells must form one
  // connected cell region. Sound to add (a genuine single loop is always
  // cell-connected) but only cell connectivity, not loop-edge connectivity --
  // see the "Deliberate omission" note below for why this narrows, but does not
  // close, the single-loop gap for this shape-Var + edge-agreement encoding.
  new ConnectedValues('VS', [HORIZ, VERT, UL, UR, DL, DR]),
  // --- Givens ---
  ...Object.entries(givens).map(([cell, d]) => new Given(cell, d)),
  // --- Shape domains
  ...gridCells.map(cell => {
    const { row, col } = parseCellId(cell);
    let allowed = ALL_SHAPES.filter(s =>
      !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
      !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s)));
    const req = requiredDirs[cell];
    if (req) {
      if (req.up) allowed = allowed.filter(usesUp);
      if (req.down) allowed = allowed.filter(usesDown);
      if (req.left) allowed = allowed.filter(usesLeft);
      if (req.right) allowed = allowed.filter(usesRight);
    }
    return new Given(shape.at(cell), ...allowed);
  }),
  // --- Edge agreement
  shape.makeReplicate(
    new Pair(edgeRightKey, 'edge-h', shape.at('R1C1'), shape.at('R1C2')),
    shape.at(rightBases)),
  shape.makeReplicate(
    new Pair(edgeDownKey, 'edge-v', shape.at('R1C1'), shape.at('R2C1')),
    shape.at(downBases)),
  // --- Ambiguous-Kropki digit rule
  ...gridCells.flatMap(cell => {
    const right = graph.step(cell, 0, 1);
    const down = graph.step(cell, 1, 0);
    const result = [];
    if (right) {
      const machine = dotEdges.has(dotEdgeKey(cell, right)) ? dotRight : noDotRight;
      result.push(new NFA(machine, 'kropki-h', shape.at(cell), cell, right));
    }
    if (down) {
      const machine = dotEdges.has(dotEdgeKey(cell, down)) ? dotDown : noDotDown;
      result.push(new NFA(machine, 'kropki-v', shape.at(cell), cell, down));
    }
    return result;
  }),
  // --- Mid-loop symmetry
  ...dots.flatMap(([a, b]) => {
    const { row: ra, col: ca } = parseCellId(a);
    const { row: rb, col: cb } = parseCellId(b);
    if (ra === rb) { // horizontal dot: scan row ra, columns 1..9
      const rowCells = [];
      for (let c = 1; c <= geometry.numCols; c++) rowCells.push(shapeVar.cell(ra, c));
      return new NFA(straightSymmetryMachine(`${ca}:${HORIZ}:${geometry.numCols}`), 'dot-mid-h', ...rowCells);
    } else { // vertical dot: scan column ca, rows 1..9
      const colCells = [];
      for (let r = 1; r <= geometry.numRows; r++) colCells.push(shapeVar.cell(r, ca));
      return new NFA(straightSymmetryMachine(`${ra}:${VERT}:${geometry.numRows}`), 'dot-mid-v', ...colCells);
    }
  }),
];
