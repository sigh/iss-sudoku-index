// Title: Schrodinger's Killer
// Author: starwarigami
// Video: https://www.youtube.com/watch?v=NmvvCcwONwc
// Source: https://app.crackingthecryptic.com/sudoku/hJ3qL9nN4Q

// Digits 0-9 (ten of them) once each per row/column/box, spread over the nine
// cells of each: one cell per house (the Schrodinger cell) holds a
// superposition of two different digits, so the house's nine visible values
// plus that cell's second digit cover all ten. Every Schrodinger cell's
// unordered digit pair is unique grid-wide. No two Schrodinger cells share a
// row, column or diagonal (a Queen's move). The per-house digit-coverage scan
// below already forces exactly one Schrodinger cell per row and per column
// (pigeonhole on all ten digits), so only the diagonal case needs its own
// constraint. Cage cells may not repeat a digit -- read literally, so a
// Schrodinger cell's *two* digits must each differ from the rest of its cage
// -- and must sum to the printed total, with a Schrodinger cell contributing
// the average of its two digits to that total.
//
// VS stores a cell's second digit, or SENTINEL (10, one above the top digit)
// for an ordinary cell. To keep every printed total an integer even when a
// Schrodinger cell's pair sums to an odd number (a `.5` total), every cage
// constraint below is built on *double* the printed total against each
// cell's doubled contribution (2x an ordinary digit, or the pair's sum for
// that box's Schrodinger cell) -- split as 10*VH + VL since the doubled
// contribution can reach 18, past ISS's 16-value alphabet limit.

const shape = new Shape('9x9', '0-10');
const SENTINEL = 10;
const graph = cellGraph(shape);
const cells = graph.cells();
const VS = graph.makeOverlay('VS');
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// Provenance: the 18 drawn killer cages (a further 4 source entries are
// title/author/rules/empty metadata stubs, not cages). Cell order matches
// the source; total is the printed corner value.
const CAGES = [
  { cells: ['R1C1', 'R1C2', 'R1C3', 'R2C3', 'R2C4', 'R2C5'], total: 33 },
  { cells: ['R2C2', 'R2C1', 'R3C1', 'R3C2', 'R3C3', 'R4C1'], total: 27.5 },
  { cells: ['R1C4', 'R1C5', 'R1C6'], total: 8 },
  { cells: ['R2C6', 'R3C6', 'R3C5'], total: 20 },
  { cells: ['R3C4', 'R4C4', 'R5C4', 'R6C4'], total: 9 },
  { cells: ['R4C5', 'R5C5'], total: 16.5 },
  { cells: ['R4C6', 'R4C7'], total: 1.5 },
  { cells: ['R1C7', 'R2C7', 'R3C7', 'R2C8', 'R3C8', 'R1C8'], total: 28 },
  { cells: ['R1C9', 'R2C9', 'R3C9'], total: 15 },
  { cells: ['R4C8', 'R5C8', 'R6C8', 'R7C8'], total: 25 },
  { cells: ['R4C9', 'R5C9', 'R6C9'], total: 13 },
  { cells: ['R5C6', 'R6C6', 'R6C5'], total: 15 },
  { cells: ['R7C9', 'R8C9', 'R9C9'], total: 9 },
  { cells: ['R7C7', 'R8C7', 'R9C7', 'R8C8', 'R9C8'], total: 25 },
  { cells: ['R7C6', 'R8C6', 'R9C6'], total: 16 },
  { cells: ['R7C3', 'R8C3', 'R8C4', 'R8C5'], total: 18 },
  { cells: ['R6C2', 'R7C2', 'R7C1', 'R8C1', 'R8C2', 'R9C1', 'R9C2', 'R9C3'], total: 36 },
  { cells: ['R4C2', 'R5C2', 'R5C1', 'R6C1', 'R4C3', 'R5C3', 'R6C3'], total: 32 },
];
const VALUE_CELLS = [...new Set(CAGES.flatMap(c => c.cells))];
const VH = graph.makeOverlay('VH', VALUE_CELLS); // doubled cell value = 10*VH + VL
const VL = graph.makeOverlay('VL', VALUE_CELLS); // (only needed on cage cells)

// Each house reads primary, second, primary, second, ... . Seeing all ten
// digits exactly once forces exactly one non-sentinel second digit per house
// -- the box's Schrodinger cell, by pigeonhole.
const houseSpec = NFA.encodeSpec({
  startState: { mask: 0, second: false },
  transition: (s, x) => {
    if (!s.second) {
      if (x > 9) return undefined; // a primary digit is never the sentinel
      const bit = 1 << x;
      return s.mask & bit ? undefined : { mask: s.mask | bit, second: true };
    }
    if (x === SENTINEL) return { mask: s.mask, second: false };
    if (x > 9) return undefined;
    const bit = 1 << x;
    return s.mask & bit ? undefined : { mask: s.mask | bit, second: false };
  },
  accept: s => !s.second && s.mask === 1023,
}, shape);

// A Schrodinger pair is unordered; storing its smaller digit in VS removes
// the otherwise artificial swap symmetry between the grid digit and VS.
const canonical = Pair.fnToKey((a, b) => b === SENTINEL || b < a, shape);

// Grid-wide scan for one candidate unordered pair (lo, hi): accepts unless
// two different Schrodinger cells both hold that pair.
function pairSpec(lo, hi) {
  return NFA.encodeSpec({
    startState: { primary: null, count: 0 },
    transition: (s, x) => {
      if (s.primary === null) return { primary: x, count: s.count };
      const match = x !== SENTINEL && Math.min(s.primary, x) === lo && Math.max(s.primary, x) === hi;
      return s.count + (match ? 1 : 0) > 1 ? undefined : { primary: null, count: s.count + (match ? 1 : 0) };
    },
    accept: s => s.primary === null,
  }, shape);
}

// Ties a cage cell's (grid digit, second digit) to its doubled contribution
// to a cage total: 2x the grid digit for an ordinary cell, or the pair's sum
// for that box's Schrodinger cell (its average taken over 2, so doubling
// gives the pair's sum directly) -- split high/low, base 10.
const valueSpec = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, x) => {
    if (s.k === 0) return x > 9 ? undefined : { k: 1, digit: x };
    if (s.k === 1) {
      if (x > 9 && x !== SENTINEL) return undefined;
      return { k: 2, raw: x === SENTINEL ? 2 * s.digit : s.digit + x };
    }
    if (s.k === 2) return x === Math.floor(s.raw / 10) ? { k: 3, low: s.raw % 10 } : undefined;
    if (s.k === 3) return x === s.low ? { done: true } : undefined;
    return undefined;
  },
  accept: s => s.done === true,
}, shape);

// No-repeat scan over one cage's interleaved (grid digit, second digit)
// cells: rejects a repeated digit, treating SENTINEL as "no second digit"
// (skipped, not counted) so an ordinary cage cell contributes one digit and
// that box's Schrodinger cell (if present in the cage) contributes two.
const cageDistinctSpec = NFA.encodeSpec({
  startState: { mask: 0 },
  transition: (s, x) => {
    if (x === SENTINEL) return s;
    const bit = 1 << x;
    return s.mask & bit ? undefined : { mask: s.mask | bit };
  },
  accept: () => true,
}, shape);

const allInterleaved = cells.flatMap(cell => [cell, VS.at(cell)]);
const houses = graph.rowsColumnsBoxes().map((house, i) =>
  new NFA(houseSpec, `schrodinger-house-${i + 1}`, ...house.flatMap(cell => [cell, VS.at(cell)])));
const canonicalPairs = cells.map(cell => new Pair(canonical, 'canonical-pair', cell, VS.at(cell)));
const pairDistinct = [];
for (let lo = 0; lo <= 9; lo++) for (let hi = lo + 1; hi <= 9; hi++)
  pairDistinct.push(new NFA(pairSpec(lo, hi), `pair-${lo}-${hi}`, ...allInterleaved));

// Queen's move: no two Schrodinger cells share a diagonal. (Row/column
// sharing is already excluded above -- see the header comment.) VF marks a
// cell 1 if it is a Schrodinger cell, 0 otherwise; a diagonal group of length
// L then needs at most one VF=1, expressed as an equality with a slack Var
// absorbing the 0-or-1 gap (Sum(1, ...VF, slack), slack in [0, L-1]).
// Diagonal groups are derived from cell coordinates, not hand-enumerated.
const VF = graph.makeOverlay('VF');
const isSchrodingerFlag = Pair.fnToKey((vs, f) => (vs === SENTINEL) === (f === 0), shape);
const schrodingerFlags = cells.map(cell => new Pair(isSchrodingerFlag, 'schrodinger-flag', VS.at(cell), VF.at(cell)));

const diagGroups = new Map();
for (const cell of cells) {
  const { row, col } = parseCellId(cell);
  for (const key of [`d${row - col}`, `a${row + col}`]) {
    if (!diagGroups.has(key)) diagGroups.set(key, []);
    diagGroups.get(key).push(cell);
  }
}
const longDiagGroups = [...diagGroups.values()].filter(group => group.length >= 2);
const diagSlack = new Var('QD', 'diagonal at-most-one-Schrodinger slack', longDiagGroups.length);
const queenDiagonals = longDiagGroups.map((group, i) => [
  new Given(diagSlack.cells()[i], ...range(0, group.length - 1)),
  new Sum(1, ...VF.at(group), diagSlack.cells()[i]),
]).flat();

const valueTies = VALUE_CELLS.map(cell =>
  new NFA(valueSpec, 'cage-cell-doubled-value', cell, VS.at(cell), VH.at(cell), VL.at(cell)));
const cageNoRepeats = CAGES.map((cage, i) =>
  new NFA(cageDistinctSpec, `cage-${i + 1}-no-repeat`, ...cage.cells.flatMap(cell => [cell, VS.at(cell)])));
const cageSums = CAGES.map(cage =>
  new Sum(Math.round(cage.total * 2), ...cage.cells.flatMap(cell => [[VH.at(cell), 10], [VL.at(cell), 1]])));

return [
  shape,
  VS.toVar('second Schrodinger digit'),
  VF.toVar('is-Schrodinger-cell flag'),
  VH.toVar('doubled cage-cell value, high digit (base 10)'),
  VL.toVar('doubled cage-cell value, low digit (base 10)'),
  diagSlack,
  graph.makeReplicate(new Given(cells[0], ...range(0, 9))),
  VS.makeReplicate(new Given(VS.at(cells[0]), ...range(0, 10))),
  VF.makeReplicate(new Given(VF.at(cells[0]), 0, 1)),
  VH.makeReplicate(new Given(VH.at(VALUE_CELLS[0]), 0, 1)),
  VL.makeReplicate(new Given(VL.at(VALUE_CELLS[0]), ...range(0, 9))),
  ...houses,
  ...canonicalPairs,
  ...pairDistinct,
  ...schrodingerFlags,
  ...queenDiagonals,
  ...valueTies,
  ...cageNoRepeats,
  ...cageSums,
];
