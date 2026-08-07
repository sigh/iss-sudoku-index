// Title: Fogrotto
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=Dvu3m3GMM0w
// Source: https://app.crackingthecryptic.com/sudoku/77hLMnt2bM

// Rules encoded, in the order they appear in the rules text:
//   * normal sudoku;
//   * every cell is a wall or a cave cell (the VC overlay);
//   * walls are orthogonally connected to the edge of the grid, and the cave
//     is one orthogonally connected area;
//   * no 2x2 area is fully wall or fully cave;
//   * the ten white circles are cave cells, and a circle's value is the number
//     of cave cells seen along its row and column including itself, walls
//     blocking sight;
//   * each cage holds no repeated digit, and its cave cells' values sum to the
//     printed total (two totals are printed as ">= N" and are lower bounds);
//   * one doubler per row, column and box, each digit doubled once, a doubler
//     cell's value being twice its digit for both circles and cage sums.
//
// Not encoded: the fog that hides the grid until digits are placed is solving
// UI, not a rule about the final grid.

const WALL = 1, CAVE = 2;
const PLAIN = 1, DOUBLER = 2;

// Cage cells and totals as drawn. Six cages print the total in their top-left
// cell; the other seven print it in a text label sitting elsewhere inside the
// cage (the rules note a clue need not be in the uppermost or leftmost cell),
// and two of those labels read ">= N" rather than "N".
const cages = [
  { cells: ['R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'], total: 19 },
  { cells: ['R2C6', 'R2C7', 'R2C8'], min: 7 },
  { cells: ['R3C6', 'R3C7', 'R3C8', 'R3C9',
            'R4C6', 'R4C7', 'R4C8', 'R4C9'], min: 34 },
  { cells: ['R5C1', 'R6C1'], total: 7 },
  { cells: ['R5C4', 'R5C5'], total: 18 },
  { cells: ['R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'], total: 11 },
  { cells: ['R6C2', 'R6C3', 'R6C4', 'R7C4', 'R7C5', 'R7C6', 'R7C7'], total: 8 },
  { cells: ['R6C6', 'R6C7', 'R6C8'], total: 28 },
  { cells: ['R7C1', 'R7C2', 'R7C3'], total: 2 },
  { cells: ['R8C1', 'R8C2', 'R9C1', 'R9C2'], total: 33 },
  { cells: ['R8C3', 'R8C4', 'R9C3', 'R9C4'], total: 3 },
  { cells: ['R8C5', 'R8C6', 'R9C5', 'R9C6'], total: 12 },
  { cells: ['R7C8', 'R8C7', 'R8C8', 'R9C7', 'R9C8'], total: 8 },
];
const cageCells = [...new Set(cages.flatMap(c => c.cells))];

// The white circles, from the underlay layer.
const circleCells = [
  'R2C7', 'R3C2', 'R4C9', 'R6C3', 'R6C4', 'R6C7', 'R7C3', 'R9C1', 'R9C2',
  'R9C5',
];

// The alphabet is widened to 0-9 so auxiliary cells can hold 0; the grid's own
// cells are restricted back to 1-9 below.
const SHAPE = new Shape('9x9', '0-9');
const graph = cellGraph(SHAPE);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const cave = graph.makeOverlay('VC');           // WALL / CAVE
const caveVar = cave.toVar('cave');
const dbl = graph.makeOverlay('VD');            // PLAIN / DOUBLER
const cd = graph.makeOverlay('VG', cageCells);  // digit, or 0 in a wall cell
const dx = graph.makeOverlay('VX', cageCells);  // the doubler's second copy

const digitDomain = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));
const caveDomain = cave.makeReplicate(
  new Given(cave.cells()[0], WALL, CAVE));
const dblDomain = dbl.makeReplicate(
  new Given(dbl.cells()[0], PLAIN, DOUBLER));

// --- Wall / cave partition -------------------------------------------------

const caveConnected = new ConnectedValues('VC', CAVE);

// No 2x2 area is fully wall or fully cave: one NFA over a 2x2 block of flags,
// rejecting an all-equal quartet, replicated to every block origin.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = cave.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...cave.at(graph.block(gridCells[0], 2, 2))),
  cave.at(blockOrigins));

// "Walls are orthogonally connected to the edge of the grid" says no wall
// component is sealed off by the cave, i.e. the cave has no holes. For a cave
// that is one connected area, that is exactly the Euler-characteristic
// identity for a set with 8-connected components and a 4-connected complement:
// summing a local weight over the 10x10 lattice corners gives
// 4 * (cave components - enclosed wall components), so the sum must be 4.
// At a corner, over its four surrounding cells (off-grid cells are wall), the
// weight is +1 for one cave cell, -1 for three, -2 for two cave cells placed
// diagonally, and 0 otherwise.
const CORNER_OFFSET = 2;    // weights are -2..+1; cells hold weight + offset
const corners = new Var('E', 'cave corner weight', '10x10');
const outside = new Var('O', 'off-grid cell', 1);
const outsideCell = outside.cell(1);

const cornerWeightMachine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: (state, value) => {
    if (state.done === true) return undefined;   // the weight cell is last
    if (state.seen.length < 4) {
      if (value !== WALL && value !== CAVE) return undefined;
      return { seen: [...state.seen, value] };
    }
    const [tl, tr, bl, br] = state.seen.map(v => v === CAVE ? 1 : 0);
    const count = tl + tr + bl + br;
    const diagonal = (tl && br) || (tr && bl);
    const weight = count === 1 ? 1
      : count === 3 ? -1
        : (count === 2 && diagonal) ? -2 : 0;
    return value === weight + CORNER_OFFSET ? { done: true } : undefined;
  },
  accept: (state) => state.done === true,
}, geometry);

// Lattice corner (r, c) for r, c in 1..10 sits above-left of grid cell RrCc.
const latticeIndices = Array.from({ length: 10 }, (_, i) => i + 1);
const cornerAt = (r, c) => {
  const inGrid = (row, col) => row >= 1 && row <= 9 && col >= 1 && col <= 9;
  const window = [[r - 1, c - 1], [r - 1, c], [r, c - 1], [r, c]].map(
    ([row, col]) => inGrid(row, col)
      ? caveVar.cell(row, col) : outsideCell);
  return {
    cell: corners.cell(r, c),
    rule: new NFA(cornerWeightMachine, 'corner-weight',
      ...window, corners.cell(r, c)),
  };
};
const cornerRules = latticeIndices.flatMap(
  r => latticeIndices.map(c => cornerAt(r, c)));
const noEnclosedWalls = new Sum(
  4 + CORNER_OFFSET * cornerRules.length, ...cornerRules.map(c => c.cell));

const circleGivens = circleCells.map(cell => new Given(cave.at(cell), CAVE));

// --- Doubler ---------------------------------------------------------------

// Nine flag cells valued PLAIN(1)/DOUBLER(2) sum to 10 iff exactly one of them
// is the doubler.
const doublerCounts = dbl.rowsColumnsBoxes().map(house => new Sum(10, ...house));

// "Each digit is doubled once": with one doubler per row, the nine doublers'
// digits are all different. VR holds row r's doubler digit; the machine reads
// that digit, then the row as (flag, digit) pairs, and requires any cell
// flagged DOUBLER to carry it.
const doublerDigits = new Var('R', 'doubler digit by row', 9);
const doublerDigitMachine = NFA.encodeSpec({
  startState: { target: null, checking: null },
  transition: (state, value) => {
    if (state.target === null) return { target: value, checking: null };
    if (state.checking === null) {
      return { target: state.target, checking: value === DOUBLER };
    }
    if (state.checking && value !== state.target) return undefined;
    return { target: state.target, checking: null };
  },
  accept: (state) => state.checking === null,
}, geometry);
const doublerDigitTies = graph.rows().map((row, i) => new NFA(
  doublerDigitMachine, 'doubler-digit', doublerDigits.cell(i + 1),
  ...row.flatMap(cell => [dbl.at(cell), cell])));
const doublerDigitsDistinct = new AllDifferent(...doublerDigits.cells());

// --- Circles ---------------------------------------------------------------

// Segment 0 is the circled cell's digit and doubler flag, which give the value
// it must show; each later segment is one ray of wall/cave flags read outward
// from the circle. The count starts at the circled cell itself, so the outward
// segments must supply value - 1 more cave cells; a segment stops counting at
// its first wall.
const visionMachine = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    // The first segment is the circled cell itself, never a break.
    if (state.phase === 'digit') {
      if (value === SEGMENT_BREAK) return undefined;
      return { phase: 'flag', digit: value };
    }
    if (state.phase === 'flag') {
      if (value === SEGMENT_BREAK) return undefined;
      const shown = state.digit * (value === DOUBLER ? 2 : 1);
      if (shown < 1) return undefined;
      return { remaining: shown - 1, blocked: false };
    }
    if (value === SEGMENT_BREAK) {
      return { remaining: state.remaining, blocked: false };
    }
    if (state.blocked) return state;
    if (value === WALL) return { remaining: state.remaining, blocked: true };
    if (state.remaining <= 0) return undefined;
    return { remaining: state.remaining - 1, blocked: false };
  },
  accept: (state) => state.remaining === 0,
}, geometry, { multiSegment: true });

const RAY_DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const visionRules = circleCells.map(cell => {
  const rays = RAY_DIRECTIONS
    .map(([dR, dC]) => cave.at(graph.ray(cell, dR, dC).slice(1)))
    .filter(ray => ray.length);
  return new NFA(visionMachine, 'circle-vision',
    [cell, dbl.at(cell)], ...rays);
});

// --- Cages -----------------------------------------------------------------

const cageAllDifferent = cages.map(c => new AllDifferent(...c.cells));

// A cage cell contributes its digit once if it is cave (VG) and a second time
// if it is also the doubler (VX), so VG + VX is 0, the digit, or twice it.
const caveDigitMachine = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'cave', digit: value };
    if (state.phase === 'cave') {
      return { expected: value === CAVE ? state.digit : 0 };
    }
    return value === state.expected ? { done: true } : undefined;
  },
  accept: (state) => state.done === true,
}, geometry);
const caveDigitTies = cageCells.map(cell => new NFA(
  caveDigitMachine, 'cave-digit', cell, cave.at(cell), cd.at(cell)));

const doubledDigitMachine = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'cave', digit: value };
    if (state.phase === 'cave') {
      return { phase: 'flag', digit: value === CAVE ? state.digit : 0 };
    }
    if (state.phase === 'flag') {
      return { expected: value === DOUBLER ? state.digit : 0 };
    }
    return value === state.expected ? { done: true } : undefined;
  },
  accept: (state) => state.done === true,
}, geometry);
const doubledDigitTies = cageCells.map(cell => new NFA(
  doubledDigitMachine, 'doubled-digit',
  cell, cave.at(cell), dbl.at(cell), dx.at(cell)));

const cageSums = cages.filter(c => c.total !== undefined).map(
  c => new Sum(c.total, ...cd.at(c.cells), ...dx.at(c.cells)));

// A ">= N" cage subtracts a two-cell slack read as tens and ones, so the slack
// spans 0-99; the largest overshoot either cage admits is 61 - 34 = 27 (eight
// distinct digits, two of them doubled).
const minCageParts = cages.filter(c => c.min !== undefined).map((c, i) => {
  const slack = new Var('K' + String.fromCharCode(65 + i), `slack ${i}`, 2);
  const [tens, ones] = slack.cells();
  return {
    slack,
    sum: new Sum(c.min, ...cd.at(c.cells), ...dx.at(c.cells),
      [tens, -10], [ones, -1]),
  };
});

return [
  SHAPE,
  digitDomain,
  caveVar,
  caveDomain,
  dbl.toVar('doubler'),
  dblDomain,
  cd.toVar('cave digit'),
  dx.toVar('doubled digit'),
  corners,
  outside,
  new Given(outsideCell, WALL),
  doublerDigits,
  caveConnected,
  noMono2x2,
  ...cornerRules.map(c => c.rule),
  noEnclosedWalls,
  ...circleGivens,
  ...doublerCounts,
  ...doublerDigitTies,
  doublerDigitsDistinct,
  ...visionRules,
  ...cageAllDifferent,
  ...caveDigitTies,
  ...doubledDigitTies,
  ...cageSums,
  ...minCageParts.flatMap(({ slack, sum }) => [slack, sum]),
];
