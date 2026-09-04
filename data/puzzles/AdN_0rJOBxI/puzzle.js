// Title: Area 51
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=AdN_0rJOBxI
// Source: https://sudokupad.app/575wand8lt?setting-nogrid=1

// Rules encoded (the grid starts empty -- no givens, cages or clue geometry;
// every clue is a rule in the text; the payload's 141 line strokes and 6
// underlays are a decorative fence/vignette skin -- faint (45%-opacity or
// less) strokes and background washes covering nearly every interior grid
// edge, which read as template artwork, not drawn clue geometry):
//  1. Latin square: digits 1-5 once each in every row and column (5x5 has no
//     valid square box tiling, so ISS enforces rows/columns only).
//  2. AREA 51: draw a loop along grid edges that does not touch itself,
//     enclosing an "inside" area.
//  3. If a digit N appears anywhere inside the enclosed area, it appears
//     exactly N times inside it.
//  4. The enclosed area's digits sum to 51.

const IN = 1, OUT = 2;   // side-of-loop tokens, distinct from the digit range
const SENTINEL = 0;      // value-copy overlay's "not inside" marker

// Widen the alphabet so 0 is available as the value-copy sentinel; real grid
// cells are restricted back to 1-5 below.
const shape = new Shape('5x5', '0-5');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const digitDomain = graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5));

// --- Enclosure: a grid-edge loop is the boundary of a cell subset, so track
// which side of the loop ("inside"/"outside") each cell is on instead of a
// Var per edge. Pad the layer with a ring of cells fixed OUT: with the ring,
// "outside" reaches the true unbounded exterior the same way "inside" reaches
// itself, so requiring BOTH classes connected on the padded layer forbids a
// doughnut-shaped inside (which would need two loop boundaries, not the
// rules' one loop) with no separate hole-counting machinery.
const side = new Var('S', 'side', '7x7');
const sideAt = (r, c) => side.cell(r, c);          // padded coords, 1..7
const realSide = (r, c) => sideAt(r + 1, c + 1);   // real cell (r,c), 1..5

const sideDomains = [];
for (let r = 1; r <= 7; r++) {
  for (let c = 1; c <= 7; c++) {
    const onRing = r === 1 || r === 7 || c === 1 || c === 7;
    sideDomains.push(onRing
      ? new Given(sideAt(r, c), OUT)
      : new Given(sideAt(r, c), IN, OUT));
  }
}

const insideConnected = new ConnectedValues('VS', IN);
const outsideConnected = new ConnectedValues('VS', OUT);

// No self-touch: forbid a lattice corner whose only two IN cells are its
// diagonal (the other diagonal both OUT). Checked over every corner with four
// real neighbours -- a corner touching the padded ring always has at least
// three OUT neighbours there, so it can never host this pattern.
const noTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => ({ block: [...block, value === IN] }),
  accept: ({ block }) => {
    const [tl, tr, bl, br] = block;
    const diagonalOnly = (tl && br && !tr && !bl) || (tr && bl && !tl && !br);
    return !diagonalOnly;
  },
  maxDepth: 4,
}, geometry);
const noTouches = [];
for (let r = 1; r <= 4; r++) {
  for (let c = 1; c <= 4; c++) {
    noTouches.push(new NFA(noTouchMachine, 'no-touch',
      realSide(r, c), realSide(r, c + 1), realSide(r + 1, c), realSide(r + 1, c + 1)));
  }
}

// --- Value-copy overlay: a cell copies its digit when inside, else holds the
// sentinel 0 (outside the digit range) -- read by native Sum/counting NFAs
// instead of one whole-grid NFA per digit reading (side, digit) directly.
const copy = graph.makeOverlay('VC');
const copyMachine = NFA.encodeSpec({
  startState: { phase: 'side' },
  transition: (state, value) => {
    if (state.phase === 'side') return { phase: 'digit', side: value };
    if (state.phase === 'digit') return { phase: 'copy', side: state.side, digit: value };
    const expected = state.side === IN ? state.digit : SENTINEL;
    return value === expected ? { phase: 'done' } : undefined;
  },
  accept: ({ phase }) => phase === 'done',
}, geometry);
const copyLinks = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(copyMachine, 'value-copy', realSide(row, col), cell, copy.at(cell));
});

// --- Rule 3: for each digit N, it appears 0 or exactly N times among the
// inside cells (read off the value-copy overlay).
const digitCounts = [1, 2, 3, 4, 5].map(n => {
  const machine = NFA.encodeSpec({
    startState: { count: 0 },
    transition: ({ count }, value) => {
      const next = count + (value === n ? 1 : 0);
      return next > n ? undefined : { count: next };
    },
    accept: ({ count }) => count === 0 || count === n,
  }, geometry);
  return new NFA(machine, `count-${n}`, ...copy.cells());
});

// --- Rule 4: the enclosed area sums to 51.
const enclosedSum = new Sum(51, ...copy.cells());

return [
  shape,
  digitDomain,
  side,
  copy.toVar('copy'),
  ...sideDomains,
  insideConnected,
  outsideConnected,
  ...noTouches,
  ...copyLinks,
  ...digitCounts,
  enclosedSum,
];
