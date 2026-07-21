// Title: Kylo Ren
// Author: Melashenkos
// Video: https://www.youtube.com/watch?v=nTU1kgeBTe0
// Source: https://sudokupad.app/cf66mq38as

// The visible 11x11 board allows repeated zeroes, which ISS's main-grid row and
// column houses cannot represent. Store its 121 entries in VA instead: 0 is a
// blank and 1-9 are placed digits. VP is the 9x9 array of possible 3x3 top-left
// corners, with 1 meaning that the corresponding region is selected.

const BLANK = 0;
const UNUSED = 0;
const SELECTED = 1;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const shape = new Shape('1x1', '0-9');
const canvas = cellGraph('11x11');
const answer = canvas.makeOverlay('VA');
const placementGrid = cellGraph('9x9');
const placements = placementGrid.makeOverlay('VP');
const topLefts = placementGrid.cells();
const cells = coordinates => coordinates.map(([row, col]) => makeCellId(row, col));

const blockAt = topLeft => answer.at(canvas.block(topLeft, 3, 3));
const selectorsCovering = cell => placements.at(topLefts
  .filter(topLeft => canvas.block(topLeft, 3, 3).includes(cell)));

const selectedValues = Array(9).fill(SELECTED).join('_');

// A selected top-left creates one complete 1-9 region; an unused top-left has
// no digit effect. Exactly nine selectors are selected below.
const regions = topLefts.map(topLeft => {
  const cells = blockAt(topLeft);
  return new Or([
    new Given(placements.at(topLeft), UNUSED),
    new And([
      new Given(placements.at(topLeft), SELECTED),
      new AllDifferent(...cells),
      ...cells.map(cell => new Given(cell, ...DIGITS)),
    ]),
  ]);
});

// A blank has no selected covering placement; a digit has exactly one. This
// simultaneously enforces region coverage and non-overlap.
const membershipMachine = NFA.encodeSpec({
  startState: { needed: null, count: 0 },
  transition: ({ needed, count }, value) => {
    if (needed === null) {
      return { needed: value === BLANK ? 0 : 1, count: 0 };
    }
    if (value !== UNUSED && value !== SELECTED) return undefined;
    const next = count + value;
    return next <= needed ? { needed, count: next } : undefined;
  },
  accept: ({ needed, count }) => needed !== null && count === needed,
}, shape);
const memberships = canvas.cells().map(cell => new NFA(
  membershipMachine, 'region membership', answer.at(cell), ...selectorsCovering(cell)));

// Ignore repeated zeroes, but reject a second occurrence of any placed digit.
const noRepeatedDigitMachine = NFA.encodeSpec({
  startState: 0,
  transition: (seen, value) => {
    if (value === BLANK) return seen;
    const bit = 1 << (value - 1);
    return seen & bit ? undefined : seen | bit;
  },
  accept: () => true,
}, shape);
const rowAndColumnUniqueness = [
  ...canvas.rows().map(row =>
    new NFA(noRepeatedDigitMachine, 'row nonblank digits differ', ...answer.at(row))),
  ...canvas.columns().map(column =>
    new NFA(noRepeatedDigitMachine, 'column nonblank digits differ', ...answer.at(column))),
];

const RENBANS = [
  [[1, 8], [2, 8], [3, 8], [4, 8]],
  [[5, 8], [6, 8]],
  [[11, 8], [10, 8], [9, 8], [8, 8]],
  // These two strokes intersect at their shared bend and count as one line.
  [[3, 1], [4, 2], [5, 3], [5, 4], [6, 4], [6, 3]],
  [[7, 8], [7, 7], [6, 6]],
  [[10, 3], [9, 4], [8, 4], [7, 4]],
  [[3, 9], [2, 10], [1, 11]],
  [[4, 9], [5, 9], [6, 10]],
  [[3, 10], [4, 11]],
  [[4, 10], [5, 10]],
  [[5, 7], [6, 7]],
];
const renbans = RENBANS.map(line => new Renban(...answer.at(cells(line))));

const CAGES = [
  [3, [[7, 7], [7, 8], [8, 7], [8, 8]]],
  [15, [[4, 7], [4, 8], [5, 7], [5, 8]]],
  [3, [[4, 4], [4, 5], [5, 4], [5, 5]]],
  [11, [[7, 4], [7, 5], [8, 4], [8, 5]]],
  [16, [[2, 9], [2, 10], [3, 9], [3, 10]]],
  [10, [[9, 2], [9, 3], [10, 2], [10, 3]]],
  [9, [[5, 10], [5, 11], [6, 10], [6, 11]]],
];
const cageSums = CAGES.map(([total, cage]) =>
  new Sum(total, ...answer.at(cells(cage))));
const cageNonzeroUniqueness = CAGES.map(([, cage]) => new NFA(
  noRepeatedDigitMachine, 'cage nonblank digits differ', ...answer.at(cells(cage))));

const THERMOS = [
  [[9, 2], [10, 2]],
  [[7, 3], [8, 3]],
  [[9, 9], [9, 10], [8, 9]],
  [[4, 3], [3, 3]],
];
const thermos = THERMOS.map(line => new Thermo(...answer.at(cells(line))));

return [
  shape,
  new Given('R1C1', BLANK), // Pin the otherwise-unused ISS main-grid cell.
  answer.toVar('11x11 answer, row-major; 0 is blank'),
  placements.toVar('selected 3x3 top-left corners'),
  placements.makeReplicate(new Given(placements.cells()[0], UNUSED, SELECTED)),
  new SearchPriority(100, ...placements.cells()),
  new ContainExact(selectedValues, ...placements.cells()),
  new Given(answer.at(makeCellId(6, 3)), 4),
  ...regions,
  ...memberships,
  ...rowAndColumnUniqueness,
  ...renbans,
  ...cageSums,
  ...cageNonzeroUniqueness,
  ...thermos,
];
