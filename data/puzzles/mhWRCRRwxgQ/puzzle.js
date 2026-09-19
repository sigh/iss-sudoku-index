// Title: Dual Summits
// Author: Vythic
// Video: https://www.youtube.com/watch?v=mhWRCRRwxgQ
// Source: https://sudokupad.app/0o34f0060w
//
// Normal sudoku rules, plus two killer cages, six thermometers, twelve white
// dots, and two hidden "Summit" lines that cover every non-cage cell.
//
// A Summit line's cells are not drawn (except for six short tip pieces): the
// solver must discover the two lines itself. Each cell is on-line or in a
// cage, never both, and the two lines partition every on-line cell into
// exactly two orthogonally-connected groups.
//
// Omitted: the ascending/descending-with-reversal digit rule along each
// line, and which of the two cells in each visible tip piece is the genuine
// tip. A same-label group here is only known to be connected, not which of
// its adjacent same-label pairs are the line's own edges (as opposed to two
// branches of the same tree incidentally touching); the digit rule holds
// only over the real edges, so it is not encoded over mere same-label
// adjacency.

const NONE = 1, LINE_A = 2, LINE_B = 3;   // values held by the label overlay

const graph = cellGraph('9x9');
const line = graph.makeOverlay('VS');     // one label cell per grid cell
const allCells = graph.cells();

// --- Killer cages (drawn cage cells; not on a line). ---
const cageBig = ['R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C4', 'R6C5', 'R6C6'];
const cageSmall = ['R4C2'];
const cageCells = [...cageBig, ...cageSmall];
const cages = [
  new Cage(35, ...cageBig),
  new Cage(8, ...cageSmall),
];

// --- Label domain: every cell is NONE (cage) or on one of the two lines. ---
// Stamp the full {NONE, LINE_A, LINE_B} domain over every label cell, then
// narrow: cage cells to NONE, every other cell to {LINE_A, LINE_B} (never
// NONE, per "every digit is on a blue line except for digits in a cage").
const nonCageCells = allCells.filter(c => !cageCells.includes(c));
const origin = line.cells()[0];
const labelDomain = [
  line.makeReplicate(new Given(origin, NONE, LINE_A, LINE_B)),
  ...cageCells.map(c => new Given(line.at(c), NONE)),
  line.makeReplicate(new Given(line.at(nonCageCells[0]), LINE_A, LINE_B), line.at(nonCageCells)),
  // Symmetry break: the two lines are interchangeable (nothing names "line
  // one" vs "line two"), so swapping every LINE_A<->LINE_B label describes
  // the identical pair of physical lines. Pin the canonical first on-line
  // cell in reading order to LINE_A so the solver does not double-count.
  new Given(line.at('R1C1'), LINE_A),
];

// --- Exactly two lines: each label forms one connected region. ---
const connectivity = [
  new ConnectedValues('VS', LINE_A),
  new ConnectedValues('VS', LINE_B),
];

// --- No line travels through an entire 2x2 cluster: no 2x2 block of cells
// is entirely one (non-NONE) label. Reads the four label cells of a block,
// top-left, top-right, bottom-left, bottom-right; once all four agree on a
// real line label the block is rejected, and any block that disagrees or
// touches NONE is accepted outright.
const monoBlockMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value];
    if (next.length < 4) return { block: next };
    const allSameLine = next.every(v => v === next[0]) && next[0] !== NONE;
    return allSameLine ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, 9);
// Every 2x2 block is a fixed shift of any other, so one Replicate stamps the
// same NFA template (built over the first block, top-left R1C1) onto every
// valid block's top-left cell instead of building 64 separate NFAs.
const monoBlockTargets = allCells.filter(c => graph.block(c, 2, 2));
const monoBlockOrigin = monoBlockTargets[0];
const monoBlockTemplate = new NFA(monoBlockMachine, 'no-summit-2x2',
  ...line.at(graph.block(monoBlockOrigin, 2, 2)));
const monoBlockConstraints = [
  line.makeReplicate([monoBlockTemplate], line.at(monoBlockTargets)),
];

// --- Visible blue-line pieces: each pair of cells is confirmed to be on the
// same line (which line, and which end is the drawn tip, is not encoded).
// SameValues with as many sets as cells makes every set a singleton, so
// "each set holds the same values" is exactly "every cell is equal".
const visiblePiecePairs = [
  ['R5C7', 'R6C7'], ['R1C1', 'R1C2'], ['R7C6', 'R7C7'],
  ['R5C4', 'R5C5'], ['R2C1', 'R2C2'], ['R5C2', 'R6C2'],
];
const visiblePieceConstraints = visiblePiecePairs.map(([a, b]) =>
  new SameValues(2, line.at(a), line.at(b)));

// --- Thermometers: increasing bulb to tip, and every cell on one same line.
const thermometers = [
  ['R2C8', 'R3C8', 'R2C7'],
  ['R8C5', 'R8C6'],
  ['R4C1', 'R5C1'],
  ['R2C4', 'R2C5'],
  ['R9C1', 'R9C2', 'R8C1'],
  ['R3C2', 'R4C3', 'R3C4', 'R3C3'],
];
const thermoConstraints = thermometers.flatMap(cells => [
  new Thermo(...cells),
  new SameValues(cells.length, ...line.at(cells)),
]);

// --- White dots: separate lines, and consecutive digits. The label domain on
// every white-dot cell is already restricted to {LINE_A, LINE_B} (never
// NONE), so "separate lines" over just these two cells is exactly
// AllDifferent.
const whiteDots = [
  ['R5C8', 'R5C9'], ['R7C1', 'R7C2'], ['R8C4', 'R9C4'], ['R6C7', 'R6C8'],
  ['R7C6', 'R8C6'], ['R7C3', 'R8C3'], ['R7C2', 'R7C3'], ['R6C2', 'R6C3'],
  ['R2C6', 'R3C6'], ['R2C4', 'R3C4'], ['R2C1', 'R3C1'], ['R2C7', 'R3C7'],
];
const whiteDotConstraints = whiteDots.flatMap(([a, b]) => [
  new WhiteDot(a, b),
  new AllDifferent(line.at(a), line.at(b)),
]);

return [
  new Shape('9x9'),
  line.toVar('summit'),
  ...labelDomain,
  ...connectivity,
  ...monoBlockConstraints,
  ...visiblePieceConstraints,
  ...thermoConstraints,
  ...whiteDotConstraints,
  ...cages,
];
