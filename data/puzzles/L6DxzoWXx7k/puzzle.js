// Title: Schrodinger's Zipperlein
// Author: gdc
// Video: https://www.youtube.com/watch?v=L6DxzoWXx7k
// Source: https://sudokupad.app/kknb9z9cjy

// The grid uses digits 0-9, once per row, column, and box; each house has one
// two-digit cell. VS stores its second digit, or sentinel 10 for an ordinary
// cell. VH/VL split a cell's digit sum as 9*VH + VL. Lavender zippers equate
// every opposite pair's digit sum to the circled centre's digit sum. Fog and
// the FOGLIGHT marker are UI-only and are not final-grid constraints.

const shape = new Shape('9x9', '0-15');
const SENTINEL = 10;
const graph = cellGraph(shape);
const cells = graph.cells();
const VS = graph.makeOverlay('VS');
const VH = graph.makeOverlay('VH');
const VL = graph.makeOverlay('VL');
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// Each house scans primary, second, primary, second, ... . It must see every
// real digit 0-9 exactly once, forcing one non-sentinel second digit per house.
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

// This four-cell machine ties a cell's two stored digits to its split sum.
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

// A two-digit cell is unordered; this removes only the artificial digit-order symmetry.
const canonicalPair = Pair.fnToKey((a, b) => b === SENTINEL || b < a, shape);
const houses = graph.rowsColumnsBoxes().map((house, i) =>
  new NFA(houseSpec, `schrodinger-house-${i + 1}`,
    ...house.flatMap(cell => [cell, VS.at(cell)])));
const valueTies = cells.map(cell =>
  new NFA(valueSpec, 'cell-value', cell, VS.at(cell), VH.at(cell), VL.at(cell)));
const canonicalPairs = cells.map(cell =>
  new Pair(canonicalPair, 'canonical-pair', cell, VS.at(cell)));

// Ordered paths are transcribed from the lavender strokes and their circled middles.
const ZIPPER_PATHS = [
  ['R4C4', 'R3C4', 'R3C5', 'R4C5', 'R4C4'],
  ['R2C6', 'R3C6', 'R3C5', 'R3C4', 'R2C4', 'R2C5', 'R1C5'],
  ['R1C4', 'R1C3', 'R2C3', 'R3C3', 'R2C3', 'R2C2', 'R1C2'],
  ['R1C2', 'R2C2', 'R3C2'],
  ['R5C7', 'R5C8', 'R4C8', 'R3C8', 'R2C9', 'R3C9', 'R3C8'],
  ['R7C7', 'R6C7', 'R6C8'],
  ['R1C6', 'R2C7', 'R1C7', 'R2C7', 'R1C8'],
  ['R8C4', 'R8C5', 'R9C5'],
  ['R7C8', 'R8C8', 'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R6C9'],
  ['R6C6', 'R7C6', 'R7C5'],
  ['R8C6', 'R7C6', 'R7C5'],
];
const valueTerms = (cell, coefficient = 1) => [[VH.at(cell), 9 * coefficient], [VL.at(cell), coefficient]];
const zippers = ZIPPER_PATHS.flatMap(path => {
  const middle = path[(path.length - 1) / 2];
  return path.slice(0, (path.length - 1) / 2).map((cell, i) =>
    new Sum(0, ...valueTerms(cell), ...valueTerms(path[path.length - 1 - i]), ...valueTerms(middle, -1)));
});

return [
  shape,
  VS.toVar('second digit'), VH.toVar('value high'), VL.toVar('value low'),
  graph.makeReplicate(new Given(cells[0], ...range(0, 9))),
  VS.makeReplicate(new Given(VS.at(cells[0]), ...range(0, 10))),
  VH.makeReplicate(new Given(VH.at(cells[0]), 0, 1)),
  VL.makeReplicate(new Given(VL.at(cells[0]), ...range(0, 8)), VL.at(cells)),
  new Given('R4C3', 4),
  ...houses, ...valueTies, ...canonicalPairs, ...zippers,
];
