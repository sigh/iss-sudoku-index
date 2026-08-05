// Title: Schrodinger Sodkuro
// Author: Ichtues
// Video: https://www.youtube.com/watch?v=ynkKQZlkCaY
// Source: https://app.crackingthecryptic.com/sudoku/qQbmM7j4dM

// Digits 0-9 occur once in every row, column, and box, with one two-digit
// S-cell per house. An S-cell spells the rightward or downward Kakuro total;
// numeric outside clues run from the edge to the first S-cell. R2C1 is even.
// The drawn labels "<3" and "<2" are omitted: the rules only define numbers.

const shape = new Shape('9x9', '0-15');
const SENTINEL = 10;
const graph = cellGraph(shape);
const cells = graph.cells();
const VS = graph.makeOverlay('VS');
const VH = graph.makeOverlay('VH');
const VL = graph.makeOverlay('VL');
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// In every house, primary/second pairs contain each real digit 0-9 once;
// sentinel means the cell has no second digit.
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

// VH/VL hold 9*VH+VL, the ordinary digit or an S-cell's two-digit sum.
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

// Store S-cell pairs in descending order only to remove artificial swap symmetry.
const canonicalPair = Pair.fnToKey((a, b) => b === SENTINEL || b < a, shape);
const houses = graph.rowsColumnsBoxes().map((house, i) => new NFA(houseSpec, `schrodinger-house-${i + 1}`, ...house.flatMap(cell => [cell, VS.at(cell)])));
const valueTies = cells.map(cell => new NFA(valueSpec, 'cell-value', cell, VS.at(cell), VH.at(cell), VL.at(cell)));
const canonicalPairs = cells.map(cell => new Pair(canonicalPair, 'canonical-pair', cell, VS.at(cell)));

const valueTerms = (ray, coefficient = 1) => ray.flatMap(cell => [[VH.at(cell), 9 * coefficient], [VL.at(cell), coefficient]]);
const twoDigitTotal = (a, b, ray) => [
  new Sum(0, ...valueTerms(ray), [a, -10], [b, -1]),
  new Sum(0, ...valueTerms(ray), [a, -1], [b, -10]),
];
// A selected S-cell may clue either ray. Later S-cells contribute both digits.
const sClue = cell => new Or([
  new Given(VS.at(cell), SENTINEL),
  ...twoDigitTotal(cell, VS.at(cell), graph.ray(cell, 0, 1).slice(1)),
  ...twoDigitTotal(cell, VS.at(cell), graph.ray(cell, 1, 0).slice(1)),
]);

// Each numeric outside-clue lane is transcribed from its drawn text box.
const outsideClue = (total, ray) => new Or(ray.map((cell, i) => new And([
  new Given(VS.at(cell), ...range(0, 9)),
  ...ray.slice(0, i).map(previous => new Given(VS.at(previous), SENTINEL)),
  new Sum(total, ...ray.slice(0, i)),
])));
const OUTSIDE = [
  [35, graph.ray('R1C1', 1, 0)], [34, graph.ray('R1C4', 1, 0)],
  [33, graph.ray('R1C5', 1, 0)], [35, graph.ray('R1C8', 1, 0)],
  [29, graph.ray('R1C1', 0, 1)], [3, graph.ray('R4C1', 0, 1)],
  [35, graph.ray('R5C1', 0, 1)],
];

return [
  shape,
  VS.toVar('second digit'), VH.toVar('value high'), VL.toVar('value low'),
  graph.makeReplicate(new Given(cells[0], ...range(0, 9))),
  VS.makeReplicate(new Given(VS.at(cells[0]), ...range(0, 10))),
  VH.makeReplicate(new Given(VH.at(cells[0]), 0, 1)),
  VL.makeReplicate(new Given(VL.at(cells[0]), ...range(0, 8)), VL.at(cells)),
  ...houses, ...valueTies, ...canonicalPairs,
  ...cells.map(sClue), ...OUTSIDE.map(([total, ray]) => outsideClue(total, ray)),
  new Given('R2C1', 0, 2, 4, 6, 8),
];
