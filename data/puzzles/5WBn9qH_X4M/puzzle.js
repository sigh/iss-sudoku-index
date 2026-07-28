// Title: Teenage Vampire Slayer
// Author: Blobz
// Video: https://www.youtube.com/watch?v=5WBn9qH_X4M
// Source: https://sudokupad.app/blobz/teenage-vampire-slayer

// Normal sudoku rules apply.
//
// There are 9 "vampire" cells (one per row, column, and box) and 9 "victim"
// cells (one per row, column, and box); which cells play which role is not
// given and must be deduced. Vampire and victim digits are each 1-9 once
// each (i.e. taken together the 9 vampire cells form a permutation of 1-9,
// and separately so do the 9 victim cells). For cage and line totals only:
// a vampire cell's value is its own digit plus the digit of the victim cell
// in its box; a victim cell's value is 0; every other cell's value is its
// own digit. Each cage ("grave") sums to the printed total and each 2-cell
// line ("wooden stake") sums to 16 or 17 -- both totals are read against
// this derived value, not the raw digit (cage #2, R2C3+R3C3=20, cannot be
// reached by two raw digits at all, which is itself evidence the totals use
// the derived value). Cages carry no stated no-repeat-digit restriction, so
// they are modelled as plain sums, not killer cages.
//
// Role and value bookkeeping (native ISS constraints have no "conditional
// derived value" primitive, and NFA alphabets are capped at 16 symbols so a
// single 0-18 value overlay doesn't fit):
// - `role` overlay (VR, 1=normal/2=vampire/3=victim) with one ContainExact
//   per row/column/box enforcing exactly one vampire and one victim there.
// - `victimDigit`/`vampireDigit` overlays (VD/VP, one Var per box) capture,
//   via a per-box NFA scanning that box's (digit, role) pairs, the digit of
//   the box's unique victim/vampire cell. AllDifferent over each 9-Var list
//   encodes "digits 1-9 once each" for victims and for vampires respectively.
// - Each cell's derived value is split into two shifted (+1, so 0 is
//   representable) parts that a cage/line sum adds back together:
//   `activeDigit` overlay (VA, own digit unless victim, else 0) and `bonus`
//   overlay (VB, victimDigit-of-box if vampire, else 0). A per-cell NFA ties
//   each to (digit, role) or (role, victimDigit) respectively.

const graph = cellGraph('9x9');

function range(lo, hi) {
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
}

// Widen the alphabet to fit activeDigit/bonus (0-9, encoded as 1-10); box
// tiling still comes from the 9x9 grid, not this range.
const MAX_SHIFTED = 10;
const shape = new Shape('9x9', MAX_SHIFTED);

const roles = graph.makeOverlay('VR');            // per-cell role, 1/2/3
const activeDigit = graph.makeOverlay('VA');      // per-cell, digit unless victim, else 0 (+1 shifted)
const bonus = graph.makeOverlay('VB');            // per-cell, victimDigit-of-box if vampire, else 0 (+1 shifted)
const boxes = graph.boxes();
// One Var per box, keyed by that box's own top-left cell.
const victimDigit = graph.makeOverlay('VD', boxes.map(box => box[0]));
const vampireDigit = graph.makeOverlay('VP', boxes.map(box => box[0]));

const NORMAL = 1, VAMPIRE = 2, VICTIM = 3;

// Restrict the widened grid cells back to real digits (1-9).
const digitGivens = graph.makeReplicate(new Given(graph.cells()[0], ...range(1, 9)));
const roleGivens = roles.makeReplicate(new Given(roles.cells()[0], NORMAL, VAMPIRE, VICTIM));
const victimDigitGivens = boxes.map((box) => new Given(victimDigit.at(box[0]), ...range(1, 9)));
const vampireDigitGivens = boxes.map((box) => new Given(vampireDigit.at(box[0]), ...range(1, 9)));

// Exactly one vampire (role 2) and one victim (role 3) cell among each row,
// column, and box's 9 role cells (the remaining 7 are role 1, normal).
const roleDistributionConstraints = graph.rowsColumnsBoxes().map(cells =>
  new ContainExact('1_1_1_1_1_1_1_2_3', ...roles.at(cells)));

// Scans a box's 9 (digit, role) pairs, then the target Var, and accepts iff
// exactly one cell in the box has `targetRole` and its digit equals the
// target. (Role uniqueness per box is also enforced by roleDistribution
// above; this NFA re-checks it defensively so it stays correct standalone.)
function boxRoleDigitSpecFor(targetRole) {
  return NFA.encodeSpec({
    startState: { pairIndex: 0, sub: 'digit', found: undefined, pending: undefined },
    transition: (state, value) => {
      if (state.pairIndex < 9) {
        if (state.sub === 'digit') {
          return { pairIndex: state.pairIndex, sub: 'role', found: state.found, pending: value };
        }
        // sub === 'role'
        if (value === targetRole) {
          if (state.found !== undefined) return undefined; // more than one match
          return { pairIndex: state.pairIndex + 1, sub: 'digit', found: state.pending, pending: undefined };
        }
        return { pairIndex: state.pairIndex + 1, sub: 'digit', found: state.found, pending: undefined };
      }
      // pairIndex === 9: this token is the target Var.
      if (state.found === undefined) return undefined; // no match found
      return value === state.found
        ? { pairIndex: 10, sub: 'done', found: state.found }
        : undefined;
    },
    accept: (state) => state.sub === 'done',
  }, 9); // tokens are only ever digits (1-9) or the role marker (1-3)
}

function interleaveDigitsRoles(cells) {
  return cells.flatMap(cell => [cell, roles.at(cell)]);
}

const boxVictimDigitNFAs = boxes.map((box, i) => new NFA(
  boxRoleDigitSpecFor(VICTIM), `victim-digit-box${i + 1}`,
  ...interleaveDigitsRoles(box), victimDigit.at(box[0]),
));
const boxVampireDigitNFAs = boxes.map((box, i) => new NFA(
  boxRoleDigitSpecFor(VAMPIRE), `vampire-digit-box${i + 1}`,
  ...interleaveDigitsRoles(box), vampireDigit.at(box[0]),
));

// "digits 1-9 once each" for the 9 victims, and separately for the 9
// vampires (one box-indexed Var list is exactly the 9 victims/vampires,
// since there is exactly one of each per box).
const victimDigitsAllDifferent = new AllDifferent(...boxes.map(box => victimDigit.at(box[0])));
const vampireDigitsAllDifferent = new AllDifferent(...boxes.map(box => vampireDigit.at(box[0])));

// activeDigit = role==VICTIM ? 0 : digit, shifted +1 (range 1-10).
const activeDigitSpec = NFA.encodeSpec({
  startState: { sub: 'digit' },
  transition: (state, value) => {
    if (state.sub === 'digit') return { sub: 'role', digit: value };
    if (state.sub === 'role') {
      const expected = value === VICTIM ? 0 : state.digit;
      return { sub: 'value', expected };
    }
    // sub === 'value'
    return value === state.expected + 1 ? { sub: 'done' } : undefined;
  },
  accept: (state) => state.sub === 'done',
}, MAX_SHIFTED);

// bonus = role==VAMPIRE ? victimDigit-of-box : 0, shifted +1 (range 1-10).
const bonusSpec = NFA.encodeSpec({
  startState: { sub: 'role' },
  transition: (state, value) => {
    if (state.sub === 'role') return { sub: 'victim', role: value };
    if (state.sub === 'victim') {
      const expected = state.role === VAMPIRE ? value : 0;
      return { sub: 'value', expected };
    }
    // sub === 'value'
    return value === state.expected + 1 ? { sub: 'done' } : undefined;
  },
  accept: (state) => state.sub === 'done',
}, MAX_SHIFTED);

function boxOf(cell) {
  return boxes.find(box => box.includes(cell));
}

const activeDigitNFAs = graph.cells().map(cell => new NFA(
  activeDigitSpec, `active-digit-${cell}`,
  cell, roles.at(cell), activeDigit.at(cell),
));
const bonusNFAs = graph.cells().map(cell => new NFA(
  bonusSpec, `bonus-${cell}`,
  roles.at(cell), victimDigit.at(boxOf(cell)[0]), bonus.at(cell),
));

// Cages ("graves"): sum to the printed total, read against the derived
// value. Cell coordinates and totals transcribed from the drawn cage
// geometry.
const cages = [
  [['R1C2', 'R2C2'], 3],
  [['R3C1', 'R3C2'], 4],
  [['R2C3', 'R3C3'], 20],
  [['R1C4', 'R2C4'], 6],
  [['R1C5', 'R1C6'], 13],
  [['R2C5', 'R2C6'], 6],
  [['R2C7', 'R3C7'], 6],
  [['R2C8', 'R3C8'], 18],
  [['R4C8', 'R4C9'], 3],
  [['R4C5', 'R4C6'], 19],
  [['R4C3', 'R5C3'], 2],
  [['R6C2', 'R6C3'], 7],
  [['R6C1', 'R7C1'], 19],
  [['R8C1', 'R8C2'], 11],
  [['R9C1', 'R9C2'], 5],
  [['R9C3', 'R9C4'], 5],
  [['R8C6', 'R9C6'], 14],
  [['R8C7', 'R8C8'], 1],
  [['R8C9', 'R9C9'], 12],
  [['R7C5', 'R7C6'], 2],
  [['R6C5', 'R6C6'], 7],
  [['R5C4', 'R6C4'], 3],
  [['R5C7', 'R6C7'], 23],
];

// derived value = (activeDigit - 1) + (bonus - 1), so a sum of `total` over
// the cage needs the two shifted overlays to sum to total + 2*cellCount.
const cageConstraints = cages.map(([cells, total]) =>
  new Sum(total + 2 * cells.length, ...activeDigit.at(cells), ...bonus.at(cells)));

// Wooden stakes: 2-cell lines summing to 16 or 17, read against the derived
// value. Cell coordinates transcribed from the drawn line geometry.
const lines = [
  ['R3C3', 'R3C4'],
  ['R1C8', 'R2C9'],
  ['R4C5', 'R5C6'],
  ['R4C8', 'R5C7'],
  ['R6C7', 'R7C8'],
  ['R9C7', 'R9C8'],
  ['R7C4', 'R8C4'],
  ['R7C3', 'R8C3'],
  ['R5C1', 'R5C2'],
];
const lineConstraints = lines.map(cells => new Or([
  new Sum(16 + 2 * cells.length, ...activeDigit.at(cells), ...bonus.at(cells)),
  new Sum(17 + 2 * cells.length, ...activeDigit.at(cells), ...bonus.at(cells)),
]));

return [
  shape,
  new Given('R4C1', 1),
  new Given('R4C2', 6),
  new Given('R6C8', 1),
  new Given('R6C9', 7),
  digitGivens,
  roles.toVar('vampire/victim role'),
  roleGivens,
  victimDigit.toVar('per-box victim digit'),
  ...victimDigitGivens,
  vampireDigit.toVar('per-box vampire digit'),
  ...vampireDigitGivens,
  activeDigit.toVar('per-cell active digit'),
  bonus.toVar('per-cell vampire bonus'),
  ...roleDistributionConstraints,
  ...boxVictimDigitNFAs,
  ...boxVampireDigitNFAs,
  victimDigitsAllDifferent,
  vampireDigitsAllDifferent,
  ...activeDigitNFAs,
  ...bonusNFAs,
  ...cageConstraints,
  ...lineConstraints,
];
