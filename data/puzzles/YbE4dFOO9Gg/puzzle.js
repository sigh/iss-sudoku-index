// Title: Schrodinger's Foggy Rationale
// Author: gdc
// Video: https://www.youtube.com/watch?v=YbE4dFOO9Gg
// Source: https://app.crackingthecryptic.com/z9zt7a8ery

// Digits 0-9 occur once in every row, column, and box, with one two-digit
// S-cell per house. VS is its second digit, or sentinel 10 otherwise; VH/VL
// encode each clue value as 9*VH+VL. Black dots join values in a 1:2 ratio.
// Fog and the FOGLIGHT reveal marker are UI-only.

const shape = new Shape('9x9', '0-15');
const SENTINEL = 10;
const graph = cellGraph(shape);
const cells = graph.cells();
const VS = graph.makeOverlay('VS');
const VH = graph.makeOverlay('VH');
const VL = graph.makeOverlay('VL');
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// An interleaved house sees all ten real digits exactly once, so its nine
// primary cells force exactly one non-sentinel second digit.
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

// Scan primary digit, second digit, value high, value low; the latter two
// represent the ordinary digit or the sum of the S-cell's two digits.
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

// This removes only the artificial ordering of an S-cell's two stored digits.
const canonicalPair = Pair.fnToKey((a, b) => b === SENTINEL || b < a, shape);

// A dot's four states are the high/low parts of its two cell values.
const ratioSpec = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, x) => {
    if (s.k === 0) return x <= 1 ? { k: 1, high: x } : undefined;
    if (s.k === 1) return x <= 8 ? { k: 2, a: 9 * s.high + x } : undefined;
    if (s.k === 2) return x <= 1 ? { k: 3, a: s.a, high: x } : undefined;
    if (s.k === 3) {
      const b = 9 * s.high + x;
      return s.a === 2 * b || b === 2 * s.a ? { done: true } : undefined;
    }
    return undefined;
  },
  accept: s => s.done === true,
}, shape);

const houses = graph.rowsColumnsBoxes().map((house, i) =>
  new NFA(houseSpec, `schrodinger-house-${i + 1}`,
    ...house.flatMap(cell => [cell, VS.at(cell)])));
const valueTies = cells.map(cell =>
  new NFA(valueSpec, 'cell-value', cell, VS.at(cell), VH.at(cell), VL.at(cell)));
const canonicalPairs = cells.map(cell =>
  new Pair(canonicalPair, 'canonical-pair', cell, VS.at(cell)));

// Each pair is a black dot in the source payload.
const DOTS = [
  ['R5C4', 'R6C4'], ['R6C6', 'R6C5'], ['R4C5', 'R4C6'],
  ['R5C5', 'R5C4'], ['R5C5', 'R4C5'], ['R4C4', 'R4C3'],
  ['R5C3', 'R4C3'], ['R4C1', 'R4C2'], ['R5C8', 'R5C7'],
  ['R5C8', 'R6C8'], ['R6C8', 'R6C9'], ['R7C9', 'R6C9'],
  ['R7C8', 'R7C9'], ['R7C8', 'R8C8'], ['R4C8', 'R3C8'],
  ['R3C9', 'R3C8'], ['R2C9', 'R3C9'], ['R4C2', 'R3C2'],
  ['R3C2', 'R3C3'], ['R3C3', 'R2C3'], ['R6C3', 'R6C2'],
  ['R7C3', 'R6C3'], ['R7C4', 'R7C3'], ['R8C4', 'R7C4'],
  ['R4C6', 'R3C6'], ['R6C6', 'R7C6'], ['R7C7', 'R7C6'],
  ['R9C5', 'R9C4'], ['R3C7', 'R3C6'], ['R3C5', 'R3C6'],
  ['R3C7', 'R2C7'],
];
const dots = DOTS.map(([a, b], i) =>
  new NFA(ratioSpec, `black-dot-${i + 1}`, VH.at(a), VL.at(a), VH.at(b), VL.at(b)));

return [
  shape,
  VS.toVar('second digit'), VH.toVar('value high'), VL.toVar('value low'),
  graph.makeReplicate(new Given(cells[0], ...range(0, 9))),
  VS.makeReplicate(new Given(VS.at(cells[0]), ...range(0, 10))),
  VH.makeReplicate(new Given(VH.at(cells[0]), 0, 1)),
  VL.makeReplicate(new Given(VL.at(cells[0]), ...range(0, 8)), VL.at(cells)),
  ...houses, ...valueTies, ...canonicalPairs, ...dots,
];
