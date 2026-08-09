// Title: Kylo Ren
// Author: Melashenkos
// Video: https://www.youtube.com/watch?v=nTU1kgeBTe0
// Source: https://sudokupad.app/cf66mq38as

// Rules encoded here:
//   Deconstruction: nine non-overlapping 3x3 regions are hidden in the 11x11
//   board; each holds 1-9, no value repeats in a row, column or region, and a
//   cell outside every region has value 0.
//   Kylo Renban: values on a purple line are a consecutive non-repeating set,
//   in any order; intersecting lines count as one line.
//   Killer cages: values sum to the corner total, and non-zero values may not
//   repeat in a cage.
//   Thermometers: values increase from the bulb.
// Nothing is omitted.
//
// The board's rows repeat the value 0, so the 11x11 board is Raw: an ordinary
// main grid (R1C1..R11C11) with no implicit constraints, 0 for a cell outside
// every region and 1-9 for a placed digit. VP is a second 9x9 group of the 81
// possible 3x3 top-left corners, 1 meaning that region is selected.

const BLANK = 0;
const UNUSED = 0;
const SELECTED = 1;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const shape = new Shape('11x11', '0-9', 'Raw');
const canvas = cellGraph(shape);
const placementGrid = cellGraph('9x9');
const placements = placementGrid.makeOverlay('VP');
const topLefts = placementGrid.cells();
const cells = coordinates => coordinates.map(([row, col]) => makeCellId(row, col));

const blockAt = topLeft => canvas.block(topLeft, 3, 3);
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
// simultaneously enforces region coverage and non-overlap. The first symbol is
// the board value, which sets the required count; the rest are its covering
// selectors, which are summed.
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
  membershipMachine, 'region membership', cell, ...selectorsCovering(cell)));

// Ignore repeated zeroes, but reject a second occurrence of any placed digit.
// The state is a bitmask of the digits seen so far.
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
    new NFA(noRepeatedDigitMachine, 'row nonblank digits differ', ...row)),
  ...canvas.columns().map(column =>
    new NFA(noRepeatedDigitMachine, 'column nonblank digits differ', ...column)),
];

// Drawn purple lines.
const RENBANS = [
  [[1, 8], [2, 8], [3, 8], [4, 8]],
  [[5, 8], [6, 8]],
  [[11, 8], [10, 8], [9, 8], [8, 8]],
  // Two drawn strokes, R3C1-R4C2-R5C3-R5C4 and R6C4-R6C3, both run to the grid
  // corner between R5C3, R5C4, R6C3 and R6C4, so they intersect and the rules
  // make them one line.
  [[3, 1], [4, 2], [5, 3], [5, 4], [6, 4], [6, 3]],
  [[7, 8], [7, 7], [6, 6]],
  [[10, 3], [9, 4], [8, 4], [7, 4]],
  [[3, 9], [2, 10], [1, 11]],
  [[4, 9], [5, 9], [6, 10]],
  [[3, 10], [4, 11]],
  [[4, 10], [5, 10]],
  [[5, 7], [6, 7]],
];
const renbans = RENBANS.map(line => new Renban(...cells(line)));

// Drawn cages, total then cells.
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
  new Sum(total, ...cells(cage)));
const cageNonzeroUniqueness = CAGES.map(([, cage]) => new NFA(
  noRepeatedDigitMachine, 'cage nonblank digits differ', ...cells(cage)));

// Drawn grey thermometers, bulb (the circle underlay) first.
const THERMOS = [
  [[9, 2], [10, 2]],
  [[7, 3], [8, 3]],
  [[9, 9], [9, 10], [8, 9]],
  [[4, 3], [3, 3]],
];
const thermos = THERMOS.map(line => new Thermo(...cells(line)));

return [
  shape,
  placements.toVar('selected 3x3 top-left corners'),
  placements.makeReplicate(new Given(placements.cells()[0], UNUSED, SELECTED)),
  new ContainExact(selectedValues, ...placements.cells()),
  new Given('R6C3', 4),
  ...regions,
  ...memberships,
  ...rowAndColumnUniqueness,
  ...renbans,
  ...cageSums,
  ...cageNonzeroUniqueness,
  ...thermos,
];
