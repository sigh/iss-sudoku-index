// Title: Fogrotto
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=Dvu3m3GMM0w
// Source: https://app.crackingthecryptic.com/sudoku/77hLMnt2bM

// Rules encoded: standard sudoku; a wall/cave partition of the grid (VC
// overlay) where the cave is one orthogonally-connected region and no 2x2
// block is all-wall or all-cave; ten cells given as cave cells (white
// circles); a doubler (VD overlay) appearing exactly once per row/column/box
// that counts double for cage sums; and 13 cages (all-different, no repeats)
// whose total counts only the cave cells, doubler cells counted twice, wall
// cells contributing 0 -- two cage totals are "at least" rather than exact.
//
// OMITTED: the circles' own rule -- each circled cell's digit must equal the
// (doubler-weighted) count of cave cells visible along its row and column,
// including itself, with walls blocking sight. Encoded and validated against
// small fixtures in isolation, but the combination of any few circles'
// equations together with the true solution digits has no satisfying
// wall/doubler assignment under this reading, even before cages are added.
//
// OMITTED: "walls are orthogonally connected to the edge of the grid" (no
// wall cell is enclosed by cave with no path to the border). ISS's
// ConnectedValues only proves a single connected region for one value set;
// asserting it on WALL too would be a *stronger* claim than the rule (it
// would forbid two separate wall regions that each independently reach the
// border, which the rule allows), so it is left unencoded.
//
// The fog/reveal mechanic is solving UI, not a final-grid rule, and is not
// encoded.

const WALL = 1, CAVE = 2;
const PLAIN = 1, DOUBLER = 2;

// Cage cells, from the payload's cage geometry. Two totals ("at least") come
// from a text overlay near the cage rather than the cage's own total field.
const cages = [
  { cells: ['R8C1', 'R9C1', 'R9C2', 'R8C2'], total: 33 },
  { cells: ['R7C1', 'R7C2', 'R7C3'], total: 2 },
  { cells: ['R8C3', 'R9C3', 'R9C4', 'R8C4'], total: 3 },
  { cells: ['R8C5', 'R9C5', 'R9C6', 'R8C6'], total: 12 },
  { cells: ['R8C7', 'R9C7', 'R9C8', 'R8C8', 'R7C8'], total: 8 },
  { cells: ['R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'], total: 11 },
  { cells: ['R5C4', 'R5C5'], total: 18 },
  { cells: ['R6C2', 'R6C3', 'R6C4', 'R7C4', 'R7C5', 'R7C6', 'R7C7'], total: 8 },
  { cells: ['R6C6', 'R6C7', 'R6C8'], total: 28 },
  { cells: ['R5C1', 'R6C1'], total: 7 },
  { cells: ['R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'], total: 19 },
  { cells: ['R2C6', 'R2C7', 'R2C8'], min: 7 },
  { cells: ['R3C6', 'R4C6', 'R3C7', 'R4C7', 'R3C8', 'R4C8', 'R3C9', 'R4C9'], min: 34 },
];
const cageCells = [...new Set(cages.flatMap(c => c.cells))];

// White-circle cells (underlay layer): given cave cells with a self-clued
// vision count.
const circleCells = [
  'R2C7', 'R3C2', 'R4C9', 'R6C3', 'R6C4', 'R6C7', 'R7C3', 'R9C1', 'R9C2', 'R9C5',
];

// Widen to 10 values (0-9): 0 is only used by the cave-digit / doubler-extra
// helper overlays below (see "Cage sums" section); real grid digits and the
// wall/cave/doubler flags are restricted back to their true ranges.
const SHAPE = new Shape('9x9', '0-9');
const graph = cellGraph(SHAPE);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const cave = graph.makeOverlay('VC');       // WALL/CAVE per cell
const dbl = graph.makeOverlay('VD');        // PLAIN/DOUBLER per cell
const cd = graph.makeOverlay('VG', cageCells);  // cave-gated digit (0 if wall)
const dx = graph.makeOverlay('VX', cageCells);  // extra digit if that cell is the doubler

const digitDomain = graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));
const caveDomain = cave.makeReplicate(new Given(cave.cells()[0], WALL, CAVE));
const dblDomain = dbl.makeReplicate(new Given(dbl.cells()[0], PLAIN, DOUBLER));

// --- Wall/cave partition ---------------------------------------------------

// Cave is one orthogonally-connected region (the "walls reach the border"
// half of the rule is the omission noted above).
const caveConnected = new ConnectedValues('VC', CAVE);

// No 2x2 block is all-wall or all-cave (same construction as xin_yang_v2.js's
// noMono2x2: read a 2x2 block's four flags and reject an all-equal quartet).
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = cave.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2', ...cave.at(graph.block(gridCells[0], 2, 2))),
  cave.at(blockOrigins));

// Circles are cave cells (their own vision-count rule is omitted -- see
// header).
const circleGivens = circleCells.map(cell => new Given(cave.at(cell), CAVE));

// --- Doubler -----------------------------------------------------------

// Exactly one doubler per house: 9 flag cells valued PLAIN(1)/DOUBLER(2) sum
// to 10 iff exactly one of them is DOUBLER.
const doublerCounts = dbl.rowsColumnsBoxes()
  .map(house => new Sum(10, ...house));

// --- Cages -----------------------------------------------------------------

const cageAllDifferent = cages.map(c => new AllDifferent(...c.cells));

// Per cage cell: cave-gated digit (cd = digit if cave else 0), then that
// gated digit again if the cell is also the doubler (dx). cd + dx is the
// cell's effective contribution to a cage total: 0 (wall), digit (plain
// cave), or 2*digit (doubled cave).
const caveDigitMachine = NFA.encodeSpec({
  startState: { stage: 'digit' },
  transition: (state, value) => {
    if (state.stage === 'digit') return { stage: 'cave', digit: value };
    if (state.stage === 'cave') {
      return { stage: 'result', expected: value === CAVE ? state.digit : 0 };
    }
    return value === state.expected ? { stage: 'done' } : undefined;
  },
  accept: (state) => state.stage === 'done',
}, geometry);
const caveDigitTies = cageCells.map(cell => new NFA(
  caveDigitMachine, 'cave-digit', cell, cave.at(cell), cd.at(cell)));

const doublerExtraMachine = NFA.encodeSpec({
  startState: { stage: 'base' },
  transition: (state, value) => {
    if (state.stage === 'base') return { stage: 'flag', base: value };
    if (state.stage === 'flag') {
      return { stage: 'result', expected: value === DOUBLER ? state.base : 0 };
    }
    return value === state.expected ? { stage: 'done' } : undefined;
  },
  accept: (state) => state.stage === 'done',
}, geometry);
const doublerExtraTies = cageCells.map(cell => new NFA(
  doublerExtraMachine, 'doubler-extra', cd.at(cell), dbl.at(cell), dx.at(cell)));

const exactCages = cages.filter(c => c.total !== undefined);
const minCages = cages.filter(c => c.min !== undefined);

const cageSums = exactCages.map(c => new Sum(
  c.total, ...cd.at(c.cells), ...dx.at(c.cells)));

// "At least" cages: a 2-cell tens/ones slack (each 0-9, so 0-99 combined)
// turns contribution >= min into contribution - slack == min.
const minCageParts = minCages.map((c, i) => {
  const slack = new Var('K' + String.fromCharCode(65 + i), `cage min slack ${i}`, 2);
  const [tens, ones] = slack.cells();
  return {
    slack,
    sum: new Sum(c.min, ...cd.at(c.cells), ...dx.at(c.cells), [tens, -10], [ones, -1]),
  };
});

return [
  SHAPE,
  digitDomain,
  cave.toVar('cave'),
  caveDomain,
  dbl.toVar('doubler'),
  dblDomain,
  cd.toVar('cave digit'),
  dx.toVar('doubler extra'),
  caveConnected,
  noMono2x2,
  ...circleGivens,
  ...doublerCounts,
  ...cageAllDifferent,
  ...caveDigitTies,
  ...doublerExtraTies,
  ...cageSums,
  ...minCageParts.flatMap(({ slack, sum }) => [slack, sum]),
];
