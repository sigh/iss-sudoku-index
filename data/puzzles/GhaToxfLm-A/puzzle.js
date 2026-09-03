// Title: Shima Yuteki
// Author: rockratzero
// Video: https://www.youtube.com/watch?v=GhaToxfLm-A
// Source: https://app.crackingthecryptic.com/xkbz6iw8mm

// Rules encoded below:
//  - Normal sudoku.
//  - Shimaguni: shade an orthogonally connected group of cells inside each
//    dashed cage; two shaded cells may not share a cage border; no two
//    orthogonally touching cages contain the same number of shaded cells.
//  - Circles are unshaded and contain the count of shaded cells in their cage.
//  - A value in a cage's top left sums the digits in that cage's shaded cells.
//    Digits may not repeat in the shaded cells of a cage (unshaded cells are
//    unrestricted).
//  - Digits joined by a black dot are in a 2:1 ratio.
// The rules say a shaded "group" per cage, so every cage has at least one
// shaded cell; the enumeration below drops the empty set on that reading.
// The no-repeat sentence carries no "(if given)" qualifier -- unlike the sum
// sentence it sits beside -- so it is applied to every cage, including the one
// cage that prints no total.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// Shading overlay: one value per grid cell.
const UNSHADED = 1;
const SHADED = 2;
const shade = graph.makeOverlay('VS');

// One cell per cage holding that cage's number of shaded cells.
const counts = new Var('N', 'shaded cells per cage', 16);

// The 16 dashed cages, transcribed from the drawn cage borders; `total` is the
// small number printed in the cage's top-left corner (one cage prints none).
const CAGES = [
  { total: 3, cells: ['R1C1', 'R1C2', 'R2C1'] },
  { total: 13, cells: ['R2C2', 'R3C1', 'R3C2', 'R3C3'] },
  { total: 7, cells: ['R8C9', 'R9C8', 'R9C9'] },
  { total: 7, cells: ['R7C7', 'R7C8', 'R7C9', 'R8C8'] },
  { total: null, cells: ['R1C3', 'R2C3', 'R2C4', 'R3C4', 'R4C4'] },
  { total: 27, cells: ['R6C6', 'R7C6', 'R8C6', 'R8C7', 'R9C7'] },
  { total: 9, cells: ['R4C3', 'R5C3', 'R5C4'] },
  { total: 12, cells: ['R4C1', 'R4C2', 'R5C1', 'R5C2', 'R6C1', 'R6C2'] },
  { total: 15, cells: ['R4C8', 'R4C9', 'R5C8', 'R5C9', 'R6C8', 'R6C9'] },
  { total: 11, cells: ['R4C7', 'R5C6', 'R5C7', 'R6C7'] },
  { total: 15, cells: ['R3C6', 'R4C5', 'R4C6', 'R5C5', 'R6C3', 'R6C4', 'R6C5'] },
  { total: 16, cells: ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R3C7'] },
  { total: 8, cells: ['R2C9', 'R3C8', 'R3C9'] },
  { total: 9, cells: ['R1C4', 'R1C5', 'R1C6', 'R2C5', 'R2C6', 'R3C5'] },
  { total: 19, cells: ['R7C1', 'R7C2', 'R7C3', 'R8C1', 'R9C1', 'R9C2', 'R9C3'] },
  { total: 8, cells: ['R7C4', 'R7C5', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R9C4', 'R9C5', 'R9C6'] },
];

// The drawn circles, one per cage.
const CIRCLES = ['R1C2', 'R1C3', 'R3C3', 'R4C8', 'R1C9', 'R5C5', 'R7C2', 'R7C5'];

const cageOf = new Map();
CAGES.forEach((cage, i) => cage.cells.forEach(cell => cageOf.set(cell, i)));

// Every non-empty orthogonally connected subset of a cage. The enumeration is
// over the whole power set of the drawn cage and filters on connectivity
// alone, so the disjunction below states the shading rule exactly rather than
// selecting among shadings that some other clue already allows.
const connectedSubsets = (cells) => {
  const subsets = [];
  for (let mask = 1; mask < (1 << cells.length); mask++) {
    const subset = cells.filter((_, i) => mask & (1 << i));
    if (graph.connected(subset)) subsets.push(subset);
  }
  return subsets;
};

// One branch per candidate shading of a cage. Inside a branch the shaded set is
// a literal cell list, so the cage's own digit rules are ordinary constraints on
// those cells: `Cage` gives sum-and-distinct where a total is printed, and
// `AllDifferent` gives distinctness alone where none is.
const cageShading = CAGES.map((cage, cageIndex) => new Or(
  connectedSubsets(cage.cells).map(shaded => {
    const isShaded = new Set(shaded);
    const digitRule = cage.total !== null
      ? [new Cage(cage.total, ...shaded)]
      : (shaded.length > 1 ? [new AllDifferent(...shaded)] : []);
    return new And([
      ...cage.cells.map(cell => new Given(
        shade.at(cell), isShaded.has(cell) ? SHADED : UNSHADED)),
      new Given(counts.cell(cageIndex + 1), shaded.length),
      ...digitRule,
    ]);
  })));

// Adjacent cell pairs that straddle a cage border, derived from the cage map.
const borderPairs = graph.cells().flatMap(cell =>
  [graph.step(cell, 0, 1), graph.step(cell, 1, 0)]
    .filter(next => next !== null && cageOf.get(next) !== cageOf.get(cell))
    .map(next => [cell, next]));

// The cage pairs those borders join, deduplicated.
const touchingCages = [...new Map(borderPairs.map(([a, b]) => {
  const pair = [cageOf.get(a), cageOf.get(b)].sort((x, y) => x - y);
  return [pair.join(','), pair];
})).values()];

// The key reads the shading overlay, whose cells take the grid's own 1-9
// range, so it is built from the grid shape.
const noBorderTouch = Pair.fnToKey(
  (a, b) => !(a === SHADED && b === SHADED), shape);

return [
  shape,
  shade.toVar('shading'),
  counts,
  // Every shading cell is one of the two shading states.
  shade.makeReplicate(new Given(shade.cells()[0], UNSHADED, SHADED)),
  ...cageShading,
  ...borderPairs.map(([a, b]) => new Pair(
    noBorderTouch, 'no shaded pair across a cage border',
    shade.at(a), shade.at(b))),
  ...touchingCages.map(([i, j]) => new AllDifferent(
    counts.cell(i + 1), counts.cell(j + 1))),
  ...CIRCLES.map(cell => new Given(shade.at(cell), UNSHADED)),
  ...CIRCLES.map(cell => new SameValues(
    2, cell, counts.cell(cageOf.get(cell) + 1))),
  new BlackDot('R8C4', 'R9C4'),
];
