// Title: Loop With A Difference
// Author: Scruffamudda
// Video: https://www.youtube.com/watch?v=Wo-5yBNWunY
// Source: https://app.crackingthecryptic.com/sudoku/J8MMb74TPM

// Standard 9x9 sudoku. Draw a single loop that travels along the grid lines
// (between lattice vertices), does not branch or touch itself, and never
// uses an outer-perimeter edge. A digit in a blue cell equals the number of
// that cell's four corners (grid vertices) touched by the loop. Two cells
// separated by a used loop edge have digits differing by exactly 1.
//
// The loop is modelled as the boundary of a two-coloured (IN/OUT) side per
// cell: an edge between two orthogonal cells is "on the loop" exactly when
// they take different sides. Forcing the outer ring of cells OUT keeps every
// loop edge off the perimeter (an IN border cell would force its outward
// edge, which lies on the perimeter, onto the loop). A single connected IN
// region (ConnectedValues) plus a per-vertex ban on diagonal IN/OUT
// checkerboards (self-touch) plus a global convex/concave vertex count
// (Euler characteristic, forcing zero enclosed holes) together pin the IN
// region to one simple loop boundary.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const IN = 1, OUT = 2;
const side = graph.makeOverlay('VS');
const sideDomain = side.makeReplicate(new Given(side.cells()[0], IN, OUT));

// Outer ring cells can never be IN: see header note.
const borderCells = gridCells.filter(cell => {
  const { row, col } = parseCellId(cell);
  return row === 1 || row === geometry.numRows ||
    col === 1 || col === geometry.numCols;
});
const borderOut = borderCells.map(cell => new Given(side.at(cell), OUT));

// --- Vertex facts. Each interior grid vertex is keyed by the top-left cell
// (r, c) of the 2x2 block of cells meeting there, for r, c in 1..8 (a 9x9
// grid has an 8x8 interior-vertex lattice; every vertex touching the outer
// ring is provably untouched, since the ring is forced OUT -- see below).
const vertexKeys = [];
for (let r = 1; r <= geometry.numRows - 1; r++) {
  for (let c = 1; c <= geometry.numCols - 1; c++) {
    vertexKeys.push(makeCellId(r, c));
  }
}

// touched/convex live only on the 64 interior vertices -- an overlay scoped to
// vertexKeys, rather than the full 81-cell grid, so there is no spare unused
// aux cell left free (which would otherwise multiply "solutions" that are
// identical on the real grid and the loop).
const TOUCH_NO = 1, TOUCH_YES = 2;
const touched = graph.makeOverlay('VT', vertexKeys);
const touchedDomain = touched.makeReplicate(
  new Given(touched.cells()[0], TOUCH_NO, TOUCH_YES));

const CONCAVE = 1, NEUTRAL = 2, CONVEX = 3;
const convex = graph.makeOverlay('VX', vertexKeys);
const convexDomain = convex.makeReplicate(
  new Given(convex.cells()[0], CONCAVE, NEUTRAL, CONVEX));

// Reads the four cells around a vertex (NW, NE, SW, SE), then that vertex's
// "touched" flag, then its convex/concave classification. Rejects a diagonal
// IN/OUT checkerboard (the loop touching itself) outright.
const vertexMachine = NFA.encodeSpec({
  startState: { phase: 'cells', cells: [] },
  transition: (state, value) => {
    if (state.phase === 'done') return state; // absorb any further symbol
    if (state.phase === 'cells') {
      const cells = [...state.cells, value];
      if (cells.length < 4) return { phase: 'cells', cells };
      const [nw, ne, sw, se] = cells;
      const checkerboard =
        (nw === IN && se === IN && ne === OUT && sw === OUT) ||
        (ne === IN && sw === IN && nw === OUT && se === OUT);
      if (checkerboard) return undefined;
      const count = cells.filter(v => v === IN).length;
      return { phase: 'touch', count };
    }
    if (state.phase === 'touch') {
      const expectedTouch =
        (state.count === 0 || state.count === 4) ? TOUCH_NO : TOUCH_YES;
      if (value !== expectedTouch) return undefined;
      return { phase: 'convex', count: state.count };
    }
    // phase === 'convex'
    const expectedConvex =
      state.count === 1 ? CONVEX : (state.count === 3 ? CONCAVE : NEUTRAL);
    return value === expectedConvex ? { phase: 'done' } : undefined;
  },
  accept: (s) => s.phase === 'done',
}, 3); // side/touched/convex aux domains only reach 3, not the full digit range.

const vertexRules = vertexKeys.map(key => {
  const { row: r, col: c } = parseCellId(key);
  const nw = key, ne = makeCellId(r, c + 1),
    sw = makeCellId(r + 1, c), se = makeCellId(r + 1, c + 1);
  return new NFA(vertexMachine, 'vertex',
    ...side.at([nw, ne, sw, se]), touched.at(key), convex.at(key));
});

// Single connected IN region (the loop's interior).
const connected = new ConnectedValues('VS', IN);

// Euler characteristic: for a single connected region with H holes, sum over
// all vertices of (convex ? +1 : concave ? -1 : 0) == 4*(1 - H). Requiring
// the sum equal 4 forces H = 0, i.e. no enclosed hole -- so IN's boundary is
// exactly one simple loop, not several. Stored convex values are CONCAVE=1,
// NEUTRAL=2, CONVEX=3, so the literal sum is 2*count + (real score); real
// score 4 over 64 vertices means literal target 2*64 + 4.
const holeFree = new Sum(
  2 * vertexKeys.length + 4, ...convex.at(vertexKeys));

// --- Blue cell corner-count clue. Each blue cell's digit equals how many of
// its 4 corners are touched by the loop. A corner beyond the 8x8 interior
// vertex lattice sits on the outer ring, which is forced OUT on both sides,
// so it is always untouched and simply omitted from the read list below
// (never a relaxation: those corners provably never touch the loop).
const blueCells = [
  'R1C7', 'R2C1', 'R2C5', 'R3C1', 'R3C2', 'R3C6', 'R3C8', 'R4C2',
  'R5C3', 'R5C8', 'R6C4', 'R7C3', 'R7C4', 'R7C6', 'R7C8', 'R8C2',
];
function cellCorners(cellId) {
  const { row: r, col: c } = parseCellId(cellId);
  const candidates = [
    [r - 1, c - 1], [r - 1, c], [r, c - 1], [r, c],
  ];
  return candidates
    .filter(([vr, vc]) =>
      vr >= 1 && vr <= geometry.numRows - 1 &&
      vc >= 1 && vc <= geometry.numCols - 1)
    .map(([vr, vc]) => makeCellId(vr, vc));
}

const cornerCountMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === TOUCH_YES ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);

const blueRules = blueCells.map(cell => new NFA(cornerCountMachine, 'corner-count',
  cell, ...touched.at(cellCorners(cell))));

// --- Difference-by-1 across a used loop edge. Reads (sideA, digitA, sideB,
// digitB); the pair is only constrained when the shared edge is on the loop
// (the two cells take different sides).
const diffAcrossMachine = NFA.encodeSpec({
  startState: { phase: 'sideA' },
  transition: (state, value) => {
    if (state.phase === 'sideA') return { phase: 'digitA', sideA: value };
    if (state.phase === 'digitA') {
      return { phase: 'sideB', sideA: state.sideA, digitA: value };
    }
    if (state.phase === 'sideB') {
      return {
        phase: 'digitB',
        differs: state.sideA !== value,
        digitA: state.digitA,
      };
    }
    if (state.phase === 'digitB') {
      if (!state.differs) return { phase: 'done' };
      return Math.abs(state.digitA - value) === 1
        ? { phase: 'done' } : undefined;
    }
    return state; // phase === 'done': absorb any further symbol
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);

const diffRules = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  const rules = [];
  if (right) {
    rules.push(new NFA(diffAcrossMachine, 'diff-h',
      side.at(cell), cell, side.at(right), right));
  }
  if (down) {
    rules.push(new NFA(diffAcrossMachine, 'diff-v',
      side.at(cell), cell, side.at(down), down));
  }
  return rules;
});

return [
  new Shape('9x9'),
  side.toVar('side'),
  touched.toVar('touched'),
  convex.toVar('convex'),
  sideDomain,
  ...borderOut,
  touchedDomain,
  convexDomain,
  ...vertexRules,
  connected,
  holeFree,
  ...blueRules,
  ...diffRules,
];
