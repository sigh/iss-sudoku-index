// Title: RAT RUN: One Year Earlier
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=tiZJnr5IH9Q
// Source: https://sudokupad.app/ceyzcgb9os

// Rules encoded here:
//   * Digits 1-9 in every row and column. The rules text names only rows and
//     columns ("Each of the digits 1-9 appeared in each row and column"),
//     never boxes, and the drawn geometry has no box (or other region)
//     dividers -- just the outer grid outline -- so boxes are dropped with
//     NoBoxes(). The stored solution confirms this: its rows and columns are
//     each a permutation of 1-9, but its default 3x3 blocks are not.
//   * Nine rats (one per lettered start cell) each trace a self-avoiding
//     orthogonal path from their own start cell. Together the nine paths
//     visit every cell exactly once -- a partition of the whole grid into
//     nine vertex-disjoint simple paths, each anchored at its own start.
//   * No rat's path repeats a digit.
//   * No rat moves diagonally: the model only ever looks at orthogonal
//     adjacency, so this is true by construction and needs no extra clause.
//   * Every 2x2 area is visited by at least two rats (not all four cells
//     share one label).
//   * No two rats start on the same digit; no two rats end on the same
//     digit (a rat's "end" is the far endpoint of its path, discovered by
//     the solver).
//   * Blackcurrants (black dots) and redcurrants (red dots) sit on edges
//     that a rat's path always crosses ("eaten"): one digit is double the
//     other for a blackcurrant, one odd and one even for a redcurrant.
//   * Grapes (green dots) sit on edges no rat's path ever crosses ("not
//     eaten"): the two digits differ by at least 5.
// The bottom-row outside names (ALBIE, BRUSH, ..., IBBLE) just spell out each
// lettered rat's name and are not encoded -- the digit rules never depend on
// which rat is which, only on the nine start cells and the (solver-found)
// nine end cells.
// metadata.msgcorrect is a post-solve congratulations message revealing that
// one rat (Finkz) happens to visit 1-9 in increasing order; the rules text
// never states this, so it is flavour, not a clue, and is not encoded.
// Nothing else is omitted.
//
// Model: one Var overlay VL holds, per cell, which rat's path owns it
// (1-9, matching the start-cell list below). Since VL spans the whole grid
// and every value 1-9 is used, it is automatically a partition covering
// every cell exactly once.
//
// A path is forced by: (a) ConnectedValues, one call per label, so each
// rat's cells form a single orthogonally-connected region; (b) a degree NFA
// per cell capping same-label orthogonal neighbours at 2; (c) the known
// start cell of each label pinned to exactly one same-label neighbour. A
// connected component with maximum degree 2 is a path or a cycle; forcing
// one member to degree 1 excludes the cycle, so the component is forced to
// be a genuine path with no chords -- which is also why same-label
// orthogonal adjacency IS the path's real edge set, with no separate
// "used edge" Var needed for the fruit/eaten rules below.
//
// A second overlay VEND names, per cell, whether it is the *other* endpoint
// of its rat's path (the one besides the known start): forced by the same
// degree NFA to read 2 exactly where a non-start cell's same-label degree is
// 1, and pinned to 1 (never an end) at every start cell so the two separate
// "no two X share a digit" rules stay apart.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// VL: which rat's path owns this cell (1-9).
const rat = graph.makeOverlay('VL');
// VEND: 1 = not the far end of its rat's path, 2 = is the far end.
const NOT_END = 1;
const IS_END = 2;
const end = graph.makeOverlay('VE');

// The nine rats, in the order named along the bottom outside-clue lane
// (ALBIE .. IBBLE / letters A .. I), each with its drawn start cell.
const RATS = [
  { name: 'ALBIE', start: 'R1C8' },
  { name: 'BRUSH', start: 'R4C2' },
  { name: 'CONKER', start: 'R4C7' },
  { name: 'DYLAN', start: 'R4C8' },
  { name: 'ELBA', start: 'R5C2' },
  { name: 'FINKZ', start: 'R5C5' },
  { name: 'GLITCH', start: 'R8C8' },
  { name: 'HOLLY', start: 'R9C4' },
  { name: 'IBBLE', start: 'R9C5' },
];
const startCells = RATS.map(r => r.start);
const labelOfStart = new Map(RATS.map((r, i) => [r.start, i + 1]));

// Fruit-marked edges, transcribed from the drawn edge circles (colour is the
// fruit: black = blackcurrant, red = redcurrant, lightgreen = grape).
const BLACKCURRANTS = [
  ['R7C1', 'R8C1'], ['R4C1', 'R5C1'], ['R1C5', 'R1C6'], ['R2C6', 'R3C6'],
  ['R3C6', 'R3C7'], ['R9C8', 'R9C9'], ['R8C9', 'R9C9'], ['R9C1', 'R9C2'],
  ['R2C3', 'R2C4'],
];
const REDCURRANTS = [
  ['R6C1', 'R7C1'], ['R7C8', 'R8C8'], ['R9C2', 'R9C3'],
];
const GRAPES = [
  ['R1C7', 'R1C8'], ['R4C5', 'R4C6'], ['R4C1', 'R4C2'], ['R5C3', 'R5C4'],
  ['R8C2', 'R9C2'],
];

// --- Pin the nine start cells' labels, and their VEND to "not an end". ---
const starts = RATS.map(r =>
  new Given(rat.at(r.start), labelOfStart.get(r.start)));
const startsNotEnds = startCells.map(cell => new Given(end.at(cell), NOT_END));

// --- No two rats start on the same digit. ---
const distinctStarts = new AllDifferent(...startCells);

// --- Each rat's cells form one connected region: a path partition. ---
const connectivity = RATS.map((r, i) => new ConnectedValues('VL', i + 1));

// --- Degree machines. ---
// Start cells: read the cell's own label, then its neighbours' labels;
// accept iff exactly one neighbour shares the label (so the start really is
// one endpoint, and every rat's path holds at least 2 cells).
const startDegreeMachine = NFA.encodeSpec({
  startState: { phase: 'centre' },
  transition: (state, value) => {
    if (state.phase === 'centre') {
      return { phase: 'nbr', label: value, count: 0 };
    }
    const count = state.count + (value === state.label ? 1 : 0);
    return count > 2 ? undefined : { phase: 'nbr', label: state.label, count };
  },
  accept: (state) => state.phase === 'nbr' && state.count === 1,
}, geometry);
const startDegrees = startCells.map(cell => new NFA(startDegreeMachine, 'start-degree',
  ...rat.at([cell, ...graph.neighbours(cell)])));

// Non-start cells: read VEND first (unambiguous, since it always comes
// before the centre/neighbour run regardless of how many neighbours
// follow), then the cell's own label, then its neighbours' labels. Accept
// iff the same-label neighbour count is <= 2, and VEND correctly reads
// IS_END exactly when that count is 1.
const restDegreeMachine = NFA.encodeSpec({
  startState: { phase: 'vend' },
  transition: (state, value) => {
    if (state.phase === 'vend') return { phase: 'centre', vend: value };
    if (state.phase === 'centre') {
      return { phase: 'nbr', vend: state.vend, label: value, count: 0 };
    }
    const count = state.count + (value === state.label ? 1 : 0);
    return count > 2
      ? undefined
      : { phase: 'nbr', vend: state.vend, label: state.label, count };
  },
  accept: (state) => state.phase === 'nbr' && (
    (state.vend === IS_END && state.count === 1) ||
    (state.vend === NOT_END && state.count === 2)
  ),
}, geometry);
const startSet = new Set(startCells);
const restCells = gridCells.filter(cell => !startSet.has(cell));
const restDegrees = restCells.map(cell => new NFA(restDegreeMachine, 'end-degree',
  ...end.at([cell]), ...rat.at([cell, ...graph.neighbours(cell)])));

// --- Every 2x2 area is visited by at least two rats: not all four cells
// share one label. Reads the four labels in reading order; rejects only
// when all four match. ---
const notAllOneRatMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value];
    if (next.length < 4) return { block: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry);
const blockStarts = gridCells.filter(cell => graph.block(cell, 2, 2));
const twoRatsPerBlock = rat.makeReplicate(
  new NFA(notAllOneRatMachine, 'not-one-rat',
    ...rat.at(graph.block(gridCells[0], 2, 2))),
  rat.at(blockStarts));

// --- No repeated digit within a rat's own path: one bitmask-scanning
// machine per rat, reading (label, digit) pairs over the whole grid in
// reading order and rejecting a repeated digit among cells matching that
// rat's own label. ---
const digitScanCells = gridCells.flatMap(cell => [rat.at(cell), cell]);
const noRepeatMachine = (label) => NFA.encodeSpec({
  startState: { mask: 0, phase: 'label', active: false },
  transition: (state, value) => {
    if (state.phase === 'label') {
      return { mask: state.mask, phase: 'digit', active: value === label };
    }
    if (!state.active) return { mask: state.mask, phase: 'label', active: false };
    const bit = 1 << (value - 1);
    if (state.mask & bit) return undefined;
    return { mask: state.mask | bit, phase: 'label', active: false };
  },
  accept: () => true,
  maxDepth: gridCells.length * 2,
}, geometry);
const noRepeatsPerPath = RATS.map((r, i) =>
  new NFA(noRepeatMachine(i + 1), `no-repeat-${r.name}`, ...digitScanCells));

// --- No two rats end on the same digit: one bitmask-scanning machine over
// the whole grid, reading (VEND, digit) pairs, rejecting a repeated digit
// among cells whose VEND reads IS_END. Any two IS_END cells necessarily
// belong to different rats (each rat has exactly one), so no per-rat split
// is needed here. ---
const endScanCells = gridCells.flatMap(cell => [end.at(cell), cell]);
const noRepeatEndsMachine = NFA.encodeSpec({
  startState: { mask: 0, phase: 'vend', active: false },
  transition: (state, value) => {
    if (state.phase === 'vend') {
      return { mask: state.mask, phase: 'digit', active: value === IS_END };
    }
    if (!state.active) return { mask: state.mask, phase: 'vend', active: false };
    const bit = 1 << (value - 1);
    if (state.mask & bit) return undefined;
    return { mask: state.mask | bit, phase: 'vend', active: false };
  },
  accept: () => true,
  maxDepth: gridCells.length * 2,
}, geometry);
const distinctEnds = new NFA(noRepeatEndsMachine, 'no-repeat-ends', ...endScanCells);

// --- Fruits: a marked edge's two cells always relate one way in label
// (same rat = eaten, different rats = not eaten) and always relate one way
// in digit, regardless of eaten-ness (the rules state the digit relation as
// a bare fact about the marker, and the "all eaten"/"none eaten" clauses
// pin which marker forces which label relation).
const parityKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), geometry);
const grapeKey = Pair.fnToKey((a, b) => Math.abs(a - b) >= 5, geometry);

const blackcurrants = BLACKCURRANTS.flatMap(([a, b]) => [
  new SameValues(2, ...rat.at([a, b])),
  new BlackDot(a, b),
]);
const redcurrants = REDCURRANTS.flatMap(([a, b]) => [
  new SameValues(2, ...rat.at([a, b])),
  new Pair(parityKey, 'redcurrant-parity', a, b),
]);
const grapes = GRAPES.flatMap(([a, b]) => [
  new AllDifferent(...rat.at([a, b])),
  new Pair(grapeKey, 'grape-diff5', a, b),
]);

return [
  new Shape('9x9'),
  new NoBoxes(),
  rat.toVar('rat'),
  end.toVar('end'),
  ...starts,
  ...startsNotEnds,
  distinctStarts,
  ...connectivity,
  ...startDegrees,
  ...restDegrees,
  twoRatsPerBlock,
  ...noRepeatsPerPath,
  distinctEnds,
  ...blackcurrants,
  ...redcurrants,
  ...grapes,
];
