// Title: Foggy Banren
// Author: Darth Paradox
// Video: https://www.youtube.com/watch?v=11ycmkh_xB8
// Source: https://sudokupad.app/2s9gi1de7p

// Encodes the 0-9 Schrodinger-cell Sudoku, value-based arrows, X/V, and the
// grey-square parity clue. Omitted: the four thick coloured Renban loops.
// VS stores a cell's second digit, or sentinel 10 when the cell is ordinary.
// VH/VL store its value as 9*VH + VL, so the possible S-cell value 17 fits
// despite ISS's 16-value alphabet limit.

const shape = new Shape('9x9', '0-15');
const SENTINEL = 10;
const graph = cellGraph(shape);
const cells = graph.cells();
const VS = graph.makeOverlay('VS');
const VH = graph.makeOverlay('VH');
const VL = graph.makeOverlay('VL');
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// Each house reads primary, second, primary, second, ... .  Seeing all ten
// digits exactly once forces exactly one non-sentinel second digit per house.
const houseSpec = NFA.encodeSpec({
  startState: { mask: 0, second: false },
  transition: (s, x) => {
    if (!s.second) {
      if (x > 9) return undefined;
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

// This ties the two digits to the split effective value used by value clues.
const valueSpec = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, x) => {
    if (s.k === 0) return x <= 9 ? { k: 1, a: x } : undefined;
    if (s.k === 1) return x === SENTINEL || x <= 9 ? { k: 2, value: x === SENTINEL ? s.a : s.a + x } : undefined;
    if (s.k === 2) return x <= 1 ? { k: 3, value: s.value, high: x } : undefined;
    if (s.k === 3) return x === s.value - 9 * s.high ? { done: true } : undefined;
    return undefined;
  },
  accept: s => s.done === true,
}, shape);

// An S-cell pair is unordered; storing its smaller digit in VS removes the
// otherwise artificial swap symmetry. A pair-specific scan forbids duplicate
// unordered pairs among the selected S-cells.
const canonical = Pair.fnToKey((a, b) => b === SENTINEL || b < a, shape);
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

const allInterleaved = cells.flatMap(cell => [cell, VS.at(cell)]);
const houses = graph.rowsColumnsBoxes().map((house, i) =>
  new NFA(houseSpec, `schrodinger-house-${i + 1}`, ...house.flatMap(cell => [cell, VS.at(cell)])));
const valueTies = cells.map(cell => new NFA(valueSpec, 'cell-value', cell, VS.at(cell), VH.at(cell), VL.at(cell)));
const canonicalPairs = cells.map(cell => new Pair(canonical, 'canonical-pair', cell, VS.at(cell)));
const pairDistinct = [];
for (let lo = 0; lo <= 9; lo++) for (let hi = lo + 1; hi <= 9; hi++)
  pairDistinct.push(new NFA(pairSpec(lo, hi), `pair-${lo}-${hi}`, ...allInterleaved));

const valueSum = (target, arms) => new Sum(0,
  ...arms.flatMap(cell => [[VH.at(cell), 9], VL.at(cell)]),
  [VH.at(target), -9], [VL.at(target), -1]);
const arrows = [
  ['R8C2', ['R7C3', 'R6C4', 'R7C5', 'R8C4', 'R9C3']],
  ['R4C1', ['R5C1', 'R6C1', 'R6C2', 'R6C3', 'R6C4']],
  ['R5C3', ['R4C3', 'R4C4', 'R4C5', 'R5C4']],
  ['R3C7', ['R3C6', 'R2C7', 'R1C6', 'R1C5']],
].map(([target, arms]) => valueSum(target, arms));
const xv = [
  new Sum(10, [VH.at('R9C5'), 9], VL.at('R9C5'), [VH.at('R9C6'), 9], VL.at('R9C6')),
  new Sum(5, [VH.at('R3C8'), 9], VL.at('R3C8'), [VH.at('R3C9'), 9], VL.at('R3C9')),
];
const evenValue = Pair.fnToKey((high, low) => (9 * high + low) % 2 === 0, shape);

return [
  shape,
  VS.toVar('second digit'), VH.toVar('value high'), VL.toVar('value low'),
  graph.makeReplicate(new Given(cells[0], ...range(0, 9))),
  VS.makeReplicate(new Given(VS.at(cells[0]), ...range(0, 10))),
  VH.makeReplicate(new Given(VH.at(cells[0]), 0, 1)),
  VL.makeReplicate(new Given(VL.at(cells[0]), ...range(0, 8)), VL.at(cells)),
  ...houses, ...valueTies, ...canonicalPairs, ...pairDistinct,
  ...arrows, ...xv,
  new Pair(evenValue, 'even-value', VH.at('R6C3'), VL.at('R6C3')),
];
