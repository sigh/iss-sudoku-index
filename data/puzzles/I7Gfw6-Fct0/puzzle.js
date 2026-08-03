// Title: Reversing Valve
// Author: ViKingPrime
// Video: https://www.youtube.com/watch?v=I7Gfw6-Fct0
// Source: https://app.crackingthecryptic.com/sudoku/9pdTNMfMPF

// Standard sudoku on a 9x9 grid (rows, columns and boxes all-different).
//
// Killer cages: digits in a cage don't repeat, and the cage's small clue is
// the sum of the cage's "values" (see Hot/Cold below), not necessarily its
// digits. Every cage below is two cells sharing a row or a column, so digit
// non-repetition is already forced by the standard row/column rule and needs
// no extra constraint.
//
// Thermometers: the "value" (see Hot/Cold below) strictly increases from the
// bulb to the tip.
//
// Hot/Cold: the grid hides an unmarked set of 9 "Hot" cells and a disjoint
// set of 9 "Cold" cells. Each row, column and box contains exactly one Hot
// cell, and separately exactly one Cold cell; a cell is Hot, Cold, or
// neither. The digits occupying the 9 Hot cells are exactly the digits 1-9
// (each once), and likewise for the 9 Cold cells. A cage or thermometer
// reads a Hot cell's "value" as its digit + 1, a Cold cell's as its digit -
// 1, and an unmarked cell's as its plain digit.
//
// Encoding note: a parallel "role" Var grid records each cell as Hot (1),
// Cold (2) or neither (3, a placeholder with no other meaning) -- domain
// restricted to just those three values. "Exactly one Hot and one Cold per
// row/column/box, the rest neither" is a fixed multiset per group, so
// ContainExact over each row/column/box pins the counts directly; a cell
// holding a single role value is automatically at most one of Hot/Cold.

const graph = cellGraph('9x9');
const role = graph.makeOverlay('VR');
const roleCell = cell => role.at(cell);

const HOT = 1;
const COLD = 2;
const NEITHER = 3;

// Restrict every role cell's domain to {Hot, Cold, Neither}.
const roleDomain = role.makeReplicate(
  new Given(roleCell(graph.cells()[0]), HOT, COLD, NEITHER));

// Each row/column/box holds exactly one Hot, one Cold, and seven Neither.
const roleGroups = graph.rowsColumnsBoxes().map(
  group => new ContainExact(
    [HOT, COLD, ...Array(7).fill(NEITHER)].join('_'), ...role.at(group)));

// Effective value of a cell: its digit, +1 if Hot, -1 if Cold. Every place
// that reads a "value" below scans [role, digit] pairs and folds the shift
// in as soon as the role symbol is read, one cell at a time.
function shiftFromRole(v) {
  if (v === HOT) return 1;
  if (v === COLD) return -1;
  return 0;
}

// One cell contributes two symbols to the cell list passed to the NFA: its
// role, then its digit.
function roleDigitSeq(cells) {
  return cells.flatMap(cell => [roleCell(cell), cell]);
}

// "The 9 Hot cells' digits are exactly 1-9" (and likewise Cold): scan every
// grid cell in order, and every time a cell of the target role is seen,
// require its digit not to have been seen at that role before. Reaching the
// end with all 9 digit-bits set proves the (exactly 9, by the Latin-square
// argument above) role cells cover 1-9 with no repeat.
function roleCoversAllDigitsNFA(targetRole) {
  const spec = NFA.encodeSpec({
    startState: { phase: 'role', bitmask: 0 },
    transition: (state, value) => {
      if (state.phase === 'role') {
        return { phase: 'digit', bitmask: state.bitmask, hot: value === targetRole };
      }
      const bit = 1 << (value - 1);
      if (state.hot) {
        if (state.bitmask & bit) return undefined; // digit already used at this role
        return { phase: 'role', bitmask: state.bitmask | bit };
      }
      return { phase: 'role', bitmask: state.bitmask };
    },
    accept: (state) => state.phase === 'role' && state.bitmask === 0b111111111,
  }, 9);
  return new NFA(spec, 'role-covers-digits', ...roleDigitSeq(graph.cells()));
}

// A cage's small-clue total, expressed over effective values rather than
// digits: fold each cell's role-shift into a running sum, and accept only
// at the target total.
function cageTotalNFA(total, cells) {
  const spec = NFA.encodeSpec({
    startState: { phase: 'role', sum: 0 },
    transition: (state, value) => {
      if (state.phase === 'role') {
        return { phase: 'digit', sum: state.sum, shift: shiftFromRole(value) };
      }
      const sum = state.sum + value + state.shift;
      // Effective values only add (min contribution is digit 1, Cold: 0), so
      // once the running sum passes the target it can never come back down;
      // kill that branch now instead of letting it climb forever.
      if (sum > total) return undefined;
      return { phase: 'role', sum };
    },
    accept: (state) => state.phase === 'role' && state.sum === total,
  }, 9);
  return new NFA(spec, 'cage-total', ...roleDigitSeq(cells));
}

// A thermometer's strictly-increasing rule, expressed over effective values:
// track the previous cell's effective value (or null at the bulb) and
// reject a non-increase.
function increasingThermoNFA(cells) {
  const spec = NFA.encodeSpec({
    startState: { phase: 'role', prev: null },
    transition: (state, value) => {
      if (state.phase === 'role') {
        return { phase: 'digit', prev: state.prev, shift: shiftFromRole(value) };
      }
      const eff = value + state.shift;
      if (state.prev !== null && eff <= state.prev) return undefined;
      return { phase: 'role', prev: eff };
    },
    accept: (state) => state.phase === 'role',
  }, 9);
  return new NFA(spec, 'thermo-increasing', ...roleDigitSeq(cells));
}

// Cages: [total, cellA, cellB]. Every entry is a 2-cell cage whose top-left
// cell carries the small clue, transcribed from the drawn cages.
const cages = [
  [17, 'R8C6', 'R9C6'],
  [13, 'R1C6', 'R2C6'],
  [7, 'R1C4', 'R2C4'],
  [11, 'R8C4', 'R9C4'],
  [12, 'R3C1', 'R3C2'],
  [6, 'R3C8', 'R3C9'],
  [14, 'R4C8', 'R4C9'],
  [8, 'R4C1', 'R4C2'],
  [5, 'R1C8', 'R1C9'],
  [14, 'R2C8', 'R2C9'],
  [8, 'R2C1', 'R2C2'],
  [11, 'R1C1', 'R1C2'],
  [16, 'R6C1', 'R6C2'],
  [10, 'R6C8', 'R6C9'],
  [15, 'R7C1', 'R7C2'],
];

// Thermometers, bulb cell first, transcribed from the drawn lines: each
// line's circle bulb marker coincides exactly with its first waypoint, and
// SudokuPad thermometer waypoints are bulb-first by convention.
const thermos = [
  ['R7C4', 'R6C4', 'R5C4', 'R4C4', 'R3C4'],
  ['R7C5', 'R6C5', 'R5C5', 'R4C5', 'R3C5'],
  ['R7C6', 'R6C6', 'R5C6', 'R4C6', 'R3C6'],
  ['R9C5', 'R8C5'],
  ['R8C8', 'R8C9'],
  ['R8C2', 'R8C1'],
];

return [
  new Shape('9x9'),
  role.toVar('cell role (1 = Hot, 2 = Cold, 3 = neither)'),
  roleDomain,
  ...roleGroups,
  roleCoversAllDigitsNFA(HOT),
  roleCoversAllDigitsNFA(COLD),
  ...cages.map(([total, ...cells]) => cageTotalNFA(total, cells)),
  ...thermos.map(cells => increasingThermoNFA(cells)),
];
