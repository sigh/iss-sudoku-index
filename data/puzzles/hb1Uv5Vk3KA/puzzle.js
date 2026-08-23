// Title: Parity Sums
// Author: Dying Flutchman
// Video: https://www.youtube.com/watch?v=hb1Uv5Vk3KA
// Source: https://app.crackingthecryptic.com/sudoku/hTHqF2DP3b

// Rules encoded here:
//   * Normal sudoku.
//   * Every cell belongs to the maximal orthogonally-connected group of
//     cells sharing its own parity (all-odd or all-even); a group can be a
//     single cell or span multiple boxes, and can repeat digits.
//   * A corner clue gives the sum of every cell in the parity group
//     containing the cell it is drawn against.
//   * A black dot marks an adjacent pair in a 1:2 ratio. Not every such pair
//     is dotted, so no negative (all-dots-shown) rule applies -- only the
//     two drawn dots are constrained.
// Nothing is omitted.
//
// Model: parity-group membership is not a free choice -- it is the
// connected-component structure induced by the solved digits' own parity.
// For each corner clue this is modelled with a dedicated cell-sized overlay
// whose value at a cell is one of four codes: {ODD_IN, EVEN_IN, ODD_OUT,
// EVEN_OUT}, the pairing of (this cell's own digit parity) and (whether this
// cell belongs to that clue's parity group). Three per-clue rules pin the
// codes to exactly the clue's maximal same-parity component:
//   1. a Pair per cell forces the code's parity half to equal the digit's
//      actual parity, always (whether IN or OUT);
//   2. a Pair per grid edge forbids two adjacent codes that disagree with
//      component maximality: two IN cells of different parity, or an IN
//      cell adjacent to a same-parity OUT cell (an omitted cell the group
//      should have reached);
//   3. ConnectedValues over the two *_IN codes forces the IN cells (forced
//      non-empty by the clue cell itself) into one connected region -- which
//      the edge rule above then pins to be maximal.
// The clue's own sum is a single NFA scanning every grid cell's (digit, own
// code) pair in order, accumulating the digit only where the code is an IN
// variant, capped at sum+1 to keep the state count small.

const CLUES = [ // cell nearest each drawn corner-sum clue
  { cell: 'R2C8', sum: 25 },
  { cell: 'R2C9', sum: 12 },
  { cell: 'R4C3', sum: 35 },
  { cell: 'R4C7', sum: 22 },
  { cell: 'R6C9', sum: 14 },
  { cell: 'R8C8', sum: 40 },
  { cell: 'R9C9', sum: 23 },
  { cell: 'R8C6', sum: 87 },
  { cell: 'R7C5', sum: 10 },
  { cell: 'R7C2', sum: 16 },
];

// The two drawn black (Kropki) dots.
const BLACK_DOTS = [
  ['R4C1', 'R4C2'],
  ['R5C3', 'R5C4'],
];

const graph = cellGraph('9x9');
const gridCells = graph.cells();
// Left-edge (row < 9) and top-edge (col < 9) cells: the origin of every
// vertical and horizontal grid edge, one entry per pair.
const downEdgeOrigins = gridCells.filter(c => parseCellId(c).row < 9);
const rightEdgeOrigins = gridCells.filter(c => parseCellId(c).col < 9);

const ODD_IN = 1, EVEN_IN = 2, ODD_OUT = 3, EVEN_OUT = 4;
const isIn = v => v === ODD_IN || v === EVEN_IN;
const parityIsOdd = v => v === ODD_IN || v === ODD_OUT;

// Rule 1: the code's parity half always matches the cell's actual digit
// parity, whether the cell is IN or OUT of this clue's group.
const parityLinkKey = Pair.fnToKey(
  (digit, code) => (digit % 2 === 1) === parityIsOdd(code), 9);

// Rule 2: adjacent codes may not disagree with maximal same-parity grouping:
// two different-parity IN cells can't be adjacent, and an IN cell can't sit
// next to a same-parity OUT cell (that cell belongs in the group too).
const edgeRuleKey = Pair.fnToKey((a, b) => {
  const aIn = isIn(a), bIn = isIn(b);
  const sameParity = parityIsOdd(a) === parityIsOdd(b);
  if (aIn && bIn && !sameParity) return false;
  if (aIn && !bIn && sameParity) return false;
  if (bIn && !aIn && sameParity) return false;
  return true;
}, 9);

// One NFA per clue: reads every grid cell's (digit, own code) in order and
// sums the digit wherever the code is an IN variant.
const sumSpec = sum => NFA.encodeSpec({
  startState: { phase: 0, total: 0, pending: 0 },
  transition: (state, value) => state.phase === 0
    ? { phase: 1, total: state.total, pending: value }
    : {
      phase: 0,
      total: isIn(value) ? Math.min(state.total + state.pending, sum + 1) : state.total,
      pending: 0,
    },
  accept: state => state.phase === 0 && state.total === sum,
}, 9);

const parityGroupClue = ({ cell: clueCell, sum }, index) => {
  // Var prefixes must be 'V' + upper-case letters only (no digits), so each
  // clue's overlay gets its own letter: A for clue 0, B for clue 1, etc.
  const prefix = 'V' + String.fromCharCode(65 + index);
  const group = graph.makeOverlay(prefix);

  // Every cell may hold any of the 4 codes; Givens intersect, so the
  // tighter clue-cell override below narrows just that one cell to an IN
  // code. Stamped as one Replicate template over the whole group instead of
  // 81 individual Givens.
  const domainReplicate = group.makeReplicate(
    new Given(group.at(gridCells[0]), ODD_IN, EVEN_IN, ODD_OUT, EVEN_OUT));
  const clueGiven = new Given(group.at(clueCell), ODD_IN, EVEN_IN);

  // Rule 1. Replicate requires every cell in a template to belong to one
  // cell group, but this Pair spans the grid and the overlay, so it is
  // listed per cell rather than stamped.
  const parityLinks = gridCells.map(
    c => new Pair(parityLinkKey, `parity-link-${prefix}`, c, group.at(c)));

  // Rule 2, stamped as two Replicate templates (horizontal and vertical
  // offsets) instead of 144 individual Pairs.
  const edgeReplicates = [
    group.makeReplicate(
      new Pair(edgeRuleKey, `parity-edge-${prefix}`, group.at('R1C1'), group.at('R1C2')),
      group.at(rightEdgeOrigins)),
    group.makeReplicate(
      new Pair(edgeRuleKey, `parity-edge-${prefix}`, group.at('R1C1'), group.at('R2C1')),
      group.at(downEdgeOrigins)),
  ];

  const stream = gridCells.flatMap(c => [c, group.at(c)]);
  const sumNfa = new NFA(sumSpec(sum), `parity-sum-${prefix}`, ...stream);

  return [
    group.toVar(`parity group for ${clueCell}`),
    domainReplicate,
    clueGiven,
    ...parityLinks,
    ...edgeReplicates,
    new ConnectedValues(prefix, [ODD_IN, EVEN_IN]),
    sumNfa,
  ];
};

return [
  new Shape('9x9'),

  ...CLUES.flatMap(parityGroupClue),

  ...BLACK_DOTS.map(([a, b]) => new BlackDot(a, b)),
];
