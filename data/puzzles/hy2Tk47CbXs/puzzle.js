// Title: Bloodcursed Arrows
// Author: ViKingPrime
// Video: https://www.youtube.com/watch?v=hy2Tk47CbXs
// Source: https://app.crackingthecryptic.com/sudoku/h6Mddj29b8

// Normal sudoku rules apply. For each of the 18 arrows the arm cells sum to
// the bulb cell -- with a per-cell modifier below, which the rules state for
// "Arrows/Circles" together, so it applies to the bulb's own reading too, not
// only the arm. There are 9 Vampire cells (one per row/column/box, digits a
// set of 1-9) and 9 Prey cells (same placement and digit-set rule); a cell
// holds at most one of these roles. Wherever a cell takes part in an arrow
// (bulb or arm): a Prey cell contributes 0 instead of its digit; a Vampire
// cell contributes its own digit plus the digit of its box's Prey cell; an
// unmarked cell contributes its own digit as normal.
//
// Role state per cell (Var overlay 'VR'): 1 = unmarked, 2 = Vampire,
// 3 = Prey. Chosen arbitrarily; only used internally by the NFAs below.

const graph = cellGraph('9x9');
const roles = graph.makeOverlay('VR');
const role = cell => roles.at(cell);

const NONE = 1, VAMPIRE = 2, PREY = 3;

// ---- Placement: exactly one Vampire and one Prey cell (and seven unmarked)
// per row, column and box. ContainExact's required counts already sum to 9,
// so together with the domain restriction below they pin the full row/col/box
// multiset -- this is "each row, column and box contains exactly one Vampire
// cell" and the same sentence for Prey, in one constraint per group.
const roleDomain = roles.makeReplicate(new Given(role(graph.cells()[0]), NONE, VAMPIRE, PREY));
const placement = [
  ...graph.rows(),
  ...graph.columns(),
  ...graph.boxes(),
].map(cells => new ContainExact('1_1_1_1_1_1_1_2_3', ...roles.at(cells)));

// ---- Selector NFAs: given a 9-cell group with exactly one member holding
// `targetRole` (guaranteed by `placement` above), pin an aux Var to that
// member's digit. Scans [auxVar, digit1, role1, digit2, role2, ...]: the
// aux Var is read first (state.target), then each (digit, role) pair; the
// first role seen equal to targetRole must carry a digit equal to the aux
// Var, and `found` must end true (exactly one such pair, per `placement`).
function selectorSpec(targetRole) {
  return NFA.encodeSpec({
    startState: { stage: 'target' },
    transition(state, value) {
      if (state.stage === 'target') return { stage: 'digit', target: value, found: false };
      if (state.stage === 'digit') return { ...state, stage: 'role', pending: value };
      // state.stage === 'role'
      if (value !== targetRole) return { stage: 'digit', target: state.target, found: state.found };
      if (state.found || state.pending !== state.target) return undefined;
      return { stage: 'digit', target: state.target, found: true };
    },
    accept: (state) => state.stage === 'digit' && state.found,
  }, 9);
}
const VAMPIRE_SELECTOR = selectorSpec(VAMPIRE);
const PREY_SELECTOR = selectorSpec(PREY);
const selectorScan = cells => cells.flatMap(cell => [cell, role(cell)]);

// One Var per row holding that row's Vampire cell's digit, and one Var per
// box holding that box's Prey cell's digit (the latter is also the "Prey
// cell in the same box" the arrow modifier below looks up).
const vampireDigitByRow = new Var('VV', 'digit of the row Vampire cell', 9);
const preyDigitByBox = new Var('VP', 'digit of the box Prey cell', 9);

const rowSelectors = graph.rows().map((cells, i) =>
  new NFA(VAMPIRE_SELECTOR, 'row Vampire digit', vampireDigitByRow.cell(i + 1), ...selectorScan(cells)));
const boxSelectors = graph.boxes().map((cells, i) =>
  new NFA(PREY_SELECTOR, 'box Prey digit', preyDigitByBox.cell(i + 1), ...selectorScan(cells)));

// ---- "A set of the digits 1-9": each Var group of 9 (one per row for
// Vampire, one per box for Prey) must hold each digit exactly once.
const vampireAllDifferent = new AllDifferent(
  ...Array.from({ length: 9 }, (_, i) => vampireDigitByRow.cell(i + 1)));
const preyAllDifferent = new AllDifferent(
  ...Array.from({ length: 9 }, (_, i) => preyDigitByBox.cell(i + 1)));

// ---- Arrows: [bulb, ...arm cells], transcribed from the drawn arrow paths
// -- each arrow's first cell is its bulb/circle.
const ARROWS = [
  ['R2C8', 'R2C7', 'R3C7'],
  ['R3C9', 'R2C9', 'R1C9', 'R1C8', 'R1C7'],
  ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
  ['R7C3', 'R8C2', 'R9C2', 'R9C1'],
  ['R7C1', 'R8C1', 'R7C2', 'R8C3'],
  ['R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R7C4', 'R7C5', 'R7C6'],
  ['R3C3', 'R2C3'],
  ['R3C3', 'R3C2', 'R3C1', 'R2C1'],
  ['R9C9', 'R8C9'],
  ['R9C9', 'R8C8', 'R8C9'],
  ['R9C5', 'R8C5'],
  ['R9C5', 'R9C4', 'R8C4'],
  ['R5C2', 'R6C2'],
  ['R1C6', 'R2C5', 'R1C4'],
  ['R5C7', 'R6C7'],
  ['R4C4', 'R3C5', 'R4C6'],
  ['R6C6', 'R5C5', 'R4C4'],
  ['R3C8', 'R3C7', 'R3C6', 'R3C5', 'R3C4', 'R3C3'],
];

function boxIndex(cellId) {
  const { row, col } = parseCellId(cellId);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1;
}

// The rules give the modifier for "Arrows/Circles" together, so the bulb's
// own reading is modified exactly like an arm cell's -- not just compared
// against as a plain digit. Scans one (digit, role, box-Prey-digit) triple
// per cell, bulb first, each producing its contribution (own digit if
// unmarked, 0 if Prey, digit + box-Prey-digit if Vampire). The bulb's
// contribution is subtracted, every arm cell's is added, and the total must
// land on exactly 0. Contributions are never negative, so once the running
// difference is positive it can only stay positive -- a dead branch, kept
// small instead of tracking the bulb and arm totals as separate fields.
const arrowSumSpec = NFA.encodeSpec({
  startState: { phase: 0, isFirst: true, diff: 0 },
  transition(state, value) {
    if (state.phase === 0) return { ...state, phase: 1, pendingDigit: value };
    if (state.phase === 1) {
      // Canonicalize to the 3-way role bucket immediately -- storing the raw
      // 1-9 value here would triple the reachable states for no purpose,
      // since only "is it Vampire / is it Prey / neither" is ever inspected.
      const pendingRole = value === VAMPIRE ? VAMPIRE : value === PREY ? PREY : NONE;
      return { ...state, phase: 2, pendingRole };
    }
    // state.phase === 2: value is this cell's box's Prey digit.
    const { isFirst, diff, pendingDigit, pendingRole } = state;
    const contribution =
      pendingRole === PREY ? 0 :
      pendingRole === VAMPIRE ? pendingDigit + value :
      pendingDigit;
    const newDiff = isFirst ? -contribution : diff + contribution;
    if (newDiff > 0) return undefined;
    return { phase: 0, isFirst: false, diff: newDiff };
  },
  accept: (state) => state.phase === 0 && !state.isFirst && state.diff === 0,
}, 9);

function triple(cell) {
  return [cell, role(cell), preyDigitByBox.cell(boxIndex(cell))];
}

const arrows = ARROWS.map(([bulb, ...arm]) => {
  const scan = [...triple(bulb), ...arm.flatMap(triple)];
  return new NFA(arrowSumSpec, 'arrow', ...scan);
});

return [
  new Shape('9x9'),
  roles.toVar('Vampire/Prey role'),
  vampireDigitByRow,
  preyDigitByBox,
  roleDomain,
  ...placement,
  ...rowSelectors,
  ...boxSelectors,
  vampireAllDifferent,
  preyAllDifferent,
  ...arrows,
];
