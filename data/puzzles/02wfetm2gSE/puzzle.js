// Title: Building The Unknown
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=02wfetm2gSE
// Source: https://app.crackingthecryptic.com/sudoku/Pr2DghHMj9

// Rules encoded here, in full:
//  * Normal sudoku: rows, columns, 3x3 boxes.
//  * Ten killer cages, each anchored at a fixed corner cell (the payload's
//    dotted squares). A cage's own extent and shape are unknown: any
//    orthogonally-connected set of cells, its corner being the topmost cell
//    of the set (leftmost breaking ties). Cages may not overlap; a cell may
//    lie in no cage at all. Digits repeat neither within a cage nor (as
//    always) within a row/column/box.
//  * All ten cages share one total, itself unknown.
//  * Nine outside-grid clues: the sum of the digits inside killer cages, for
//    one named row or column (cells outside every cage do not contribute).
//    Un-clued rows/columns carry no such constraint.

// Cage membership is unknown, so every cell carries a label naming which
// cage (if any) it belongs to: NONE, or 1-10 for the ten corner markers
// below, numbered in reading order. A label is tied to its own drawn corner
// marker, so this numbering carries no symmetry to pin -- each label's
// identity is fixed by which corner cell it is forced onto.
const ANCHORS = [
  { id: 1, cell: 'R1C3' },
  { id: 2, cell: 'R3C7' },
  { id: 3, cell: 'R4C3' },
  { id: 4, cell: 'R4C5' },
  { id: 5, cell: 'R5C1' },
  { id: 6, cell: 'R5C7' },
  { id: 7, cell: 'R6C8' },
  { id: 8, cell: 'R7C5' },
  { id: 9, cell: 'R8C5' },
  { id: 10, cell: 'R9C1' },
];
const NONE = 11;
const numValues = NONE;

const OUTSIDE_CLUES = [
  { lane: 'row', index: 4, target: 43 },
  { lane: 'row', index: 6, target: 28 },
  { lane: 'row', index: 8, target: 10 },
  { lane: 'row', index: 9, target: 20 },
  { lane: 'col', index: 2, target: 16 },
  { lane: 'col', index: 3, target: 6 },
  { lane: 'col', index: 4, target: 10 },
  { lane: 'col', index: 5, target: 39 },
  { lane: 'col', index: 9, target: 10 },
];

const GIVENS = [
  new Given('R2C9', 8),
  new Given('R3C8', 3),
  new Given('R3C9', 7),
];

const shape = new Shape('9x9', numValues);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const vc = graph.makeOverlay('VC');

// Grid cells keep the widened alphabet only structurally; every one is
// restricted straight back down to real digits 1-9.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Reading-order position, for the corner rule below.
const readingPos = (cell) => {
  const { row, col } = parseCellId(cell);
  return row * 100 + col;
};
const anchorsByPos = ANCHORS.slice().sort((a, b) => readingPos(a.cell) - readingPos(b.cell));

// Corner rule ("topmost cell first, leftmost breaking ties"): a cell may only
// carry cage i's label if it is not reading-order-before cage i's own corner
// cell. Anchor positions are fixed, so this is a plain per-cell domain
// restriction -- no search needed to find it.
const domainGivens = gridCells.map((cell) => {
  const pos = readingPos(cell);
  const allowed = anchorsByPos.filter((a) => readingPos(a.cell) <= pos).map((a) => a.id);
  return new Given(vc.at(cell), NONE, ...allowed);
});
// Each corner cell belongs to its own cage (merges with the restriction
// above via Given's value-intersection).
const anchorGivens = ANCHORS.map((a) => new Given(vc.at(a.cell), a.id));

// One connected region per cage label; the corner cell (always labelled)
// keeps every region non-empty.
const connectivity = ANCHORS.map((a) => new ConnectedValues('VC', a.id));

// Digit-uniqueness inside a discovered cage: scan the whole grid reading
// [label, digit] pairs, and track which digits have been seen among cells
// carrying this one cage's label as a 9-bit mask. Any label distinct from the
// mask field keeps the state small (about 1.5k reachable states), instead of
// one machine per (cage, digit) pair.
const cageDigitsNFA = (id) => NFA.encodeSpec({
  startState: { phase: 'label', mask: 0 },
  transition: (state, value) => {
    if (state.phase === 'label') {
      return { phase: 'digit', mask: state.mask, mine: value === id };
    }
    if (!state.mine) return { phase: 'label', mask: state.mask };
    // A label cell's alphabet nominally spans 1-11; only 1-9 is ever a real
    // digit read (the rest is restricted away by `digitDomain`). Reject the
    // unreachable 10/11 case immediately so the compiler does not carry the
    // wider alphabet into the mask, which would blow the state cap.
    if (value > 9) return undefined;
    const bit = 1 << (value - 1);
    if (state.mask & bit) return undefined;
    return { phase: 'label', mask: state.mask | bit };
  },
  accept: (state) => state.phase === 'label',
}, numValues);
const digitRules = ANCHORS.map((a) => new NFA(
  cageDigitsNFA(a.id), `cage ${a.id} digits distinct`,
  ...gridCells.flatMap((cell) => [vc.at(cell), cell])));

// Shared cage total: rather than hold each cage's total in a Var (it can
// reach 45, past the 16-value cap), compare cage 1's total against each
// other cage's with a running-difference machine -- add the digit when the
// label is cage 1, subtract it when the label is the other cage, and accept
// iff the difference is back to zero. Nine such pairwise machines (cage 1 vs
// each of 2-10) force all ten totals equal by transitivity.
//
// Compiling explores every abstract label/digit sequence, not just ones
// consistent with the rest of the encoding, so the running difference must
// be clamped or it ranges +-9*81. Any grid that also satisfies the two
// cages' own digit-uniqueness machines keeps each side's running total, and
// so the difference, inside [-45, 45] at every prefix (a distinct-digit
// cage's partial sum is a subset sum of 1-9, never more than 45); clamping
// one step outside that band merges only trajectories no real solution
// visits, so it cannot manufacture or hide a real zero.
const clampDiff = (d) => Math.max(-46, Math.min(46, d));
const equalTotalNFA = (idA, idB) => NFA.encodeSpec({
  startState: { phase: 'label', diff: 0 },
  transition: (state, value) => {
    if (state.phase === 'label') {
      const which = value === idA ? 'A' : value === idB ? 'B' : null;
      return { phase: 'digit', diff: state.diff, which };
    }
    if (state.which && value > 9) return undefined;  // unreachable, see cageDigitsNFA
    if (state.which === 'A') return { phase: 'label', diff: clampDiff(state.diff + value) };
    if (state.which === 'B') return { phase: 'label', diff: clampDiff(state.diff - value) };
    return { phase: 'label', diff: state.diff };
  },
  accept: (state) => state.phase === 'label' && state.diff === 0,
}, numValues);
const totalRules = ANCHORS.slice(1).map((a) => new NFA(
  equalTotalNFA(ANCHORS[0].id, a.id), `cage 1 total = cage ${a.id} total`,
  ...gridCells.flatMap((cell) => [vc.at(cell), cell])));

// Outside clues: sum the digit at every cell of the named row/column whose
// label is not NONE, clamped past the target so the state stays bounded.
const outsideSumNFA = (target) => NFA.encodeSpec({
  startState: { phase: 'label', sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'label') {
      return { phase: 'digit', sum: state.sum, mine: value !== NONE };
    }
    if (state.mine && value > 9) return undefined;  // unreachable, see cageDigitsNFA
    const sum = state.mine ? Math.min(state.sum + value, target + 1) : state.sum;
    return { phase: 'label', sum };
  },
  accept: (state) => state.phase === 'label' && state.sum === target,
}, numValues);
const outsideRules = OUTSIDE_CLUES.map(({ lane, index, target }) => {
  const cells = lane === 'row' ? graph.row(index) : graph.column(index);
  return new NFA(
    outsideSumNFA(target), `outside sum ${lane} ${index} = ${target}`,
    ...cells.flatMap((cell) => [vc.at(cell), cell]));
});

return [
  shape,
  ...GIVENS,
  digitDomain,
  vc.toVar('cage'),
  ...domainGivens,
  ...anchorGivens,
  ...connectivity,
  ...digitRules,
  ...totalRules,
  ...outsideRules,
];
