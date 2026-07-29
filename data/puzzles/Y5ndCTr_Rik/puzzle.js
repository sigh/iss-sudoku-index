// Title: Millstone
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=Y5ndCTr_Rik
// Source: https://sudokupad.app/james-sinclair/millstone-v3

// The grid uses digits 0-9. Each row, column, and box contains all ten once,
// with one two-digit cell. VS is that cell's second digit, or sentinel 10.
// VH/VL split a cell value as 9*VH+VL so values through 17 fit the alphabet.
// Cage digits are distinct; arrows sum cell values; shaded squares are even.
// Omitted: all cage-product clues and their global consecutive-pair rule.

const shape = new Shape('9x9', '0-15');
const SENTINEL = 10;
const graph = cellGraph(shape);
const cells = graph.cells();
const VS = graph.makeOverlay('VS');
const VH = graph.makeOverlay('VH');
const VL = graph.makeOverlay('VL');
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// Each interleaved house sees every real digit exactly once. With nine primary
// cells, that also forces exactly one non-sentinel VS cell in every house.
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

// Tie each primary/second-digit pair to its split effective cell value.
const valueSpec = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, x) => {
    if (s.k === 0) return x <= 9 ? { k: 1, a: x } : undefined;
    if (s.k === 1) return x === SENTINEL || x <= 9
      ? { k: 2, value: x === SENTINEL ? s.a : s.a + x } : undefined;
    if (s.k === 2) return x <= 1 ? { k: 3, value: s.value, high: x } : undefined;
    if (s.k === 3) return x === s.value - 9 * s.high ? { done: true } : undefined;
    return undefined;
  },
  accept: s => s.done === true,
}, shape);

// A two-digit cell is unordered. Keeping its smaller digit in VS removes only
// that artificial representation symmetry.
const canonicalPair = Pair.fnToKey((a, b) => b === SENTINEL || b < a, shape);
const distinctCageSpec = NFA.encodeSpec({
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
  accept: s => !s.second,
}, shape);

const houses = graph.rowsColumnsBoxes().map((house, i) =>
  new NFA(houseSpec, `schrodinger-house-${i + 1}`,
    ...house.flatMap(cell => [cell, VS.at(cell)])));
const valueTies = cells.map(cell =>
  new NFA(valueSpec, 'cell-value', cell, VS.at(cell), VH.at(cell), VL.at(cell)));
const canonicalPairs = cells.map(cell => new Pair(canonicalPair, 'canonical-pair', cell, VS.at(cell)));

// Cage cell lists are transcribed from the drawn cage outlines; no-total and
// single-cell cages remain present because their digit membership is semantic.
const CAGES = [
  ['R1C3', 'R1C4'], ['R2C5', 'R2C6'], ['R1C6', 'R1C7', 'R1C8'],
  ['R3C1', 'R4C1', 'R5C1', 'R5C2'], ['R4C2'], ['R3C4', 'R4C4'],
  ['R4C7', 'R4C8'], ['R6C7', 'R6C8'], ['R7C6', 'R7C7', 'R8C6'],
  ['R8C7', 'R8C8'], ['R8C2', 'R9C1', 'R9C2'], ['R7C2', 'R7C3'],
  ['R7C1', 'R8C1'], ['R8C3', 'R9C3'],
];
const cageDigits = CAGES.map((cage, i) =>
  new NFA(distinctCageSpec, `cage-digits-${i + 1}`,
    ...cage.flatMap(cell => [cell, VS.at(cell)])));

// A value-based arrow is linear once every cell value is represented by VH/VL.
const valueSum = (target, arms) => new Sum(0,
  ...arms.flatMap(cell => [[VH.at(cell), 9], VL.at(cell)]),
  [VH.at(target), -9], [VL.at(target), -1]);
const arrows = [
  valueSum('R4C5', ['R3C6', 'R2C6']),
  // The R4C1 circle has three separately drawn arrows; each arm sums to it.
  valueSum('R4C1', ['R3C1']),
  valueSum('R4C1', ['R5C2']),
  valueSum('R4C1', ['R4C2', 'R5C3']),
  valueSum('R6C8', ['R6C7']),
  valueSum('R1C6', ['R1C7', 'R1C8']),
];
const evenValue = Pair.fnToKey((high, low) => (9 * high + low) % 2 === 0, shape);
const shadedSquares = ['R7C3', 'R8C1', 'R3C4', 'R4C7'].map(cell =>
  new Pair(evenValue, 'even-value', VH.at(cell), VL.at(cell)));

return [
  shape,
  VS.toVar('second digit'), VH.toVar('value high'), VL.toVar('value low'),
  graph.makeReplicate(new Given(cells[0], ...range(0, 9))),
  VS.makeReplicate(new Given(VS.at(cells[0]), ...range(0, 10))),
  VH.makeReplicate(new Given(VH.at(cells[0]), 0, 1)),
  VL.makeReplicate(new Given(VL.at(cells[0]), ...range(0, 8)), VL.at(cells)),
  ...houses, ...valueTies, ...canonicalPairs, ...cageDigits, ...arrows, ...shadedSquares,
];
