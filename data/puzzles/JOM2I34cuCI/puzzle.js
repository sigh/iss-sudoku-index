// Title: Orchid
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=JOM2I34cuCI
// Source: https://sudokupad.app/lj4chf65ci

// The visible 11x11 board allows repeated blanks, which ISS's main-grid row and
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

const blockAt = topLeft => answer.at(canvas.block(topLeft, 3, 3));
const selectorsCovering = cell => placements.at(topLefts
  .filter(topLeft => canvas.block(topLeft, 3, 3).includes(cell)));

const selectedValues = [SELECTED, SELECTED, SELECTED, SELECTED, SELECTED,
  SELECTED, SELECTED, SELECTED, SELECTED].join('_');

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

// Scan one answer cell followed by all placements that cover it. A blank has no
// selected covering placement; a digit has exactly one. This simultaneously
// enforces coverage and the non-overlap rule.
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

// Each tuple is [total, first row, first column, row step, column step]. Rays
// include their first cells and continue to the edge of the 11x11 canvas.
const DIAGONALS = [
  [18, 1, 4, 1, -1],
  [3, 1, 5, 1, -1],
  [27, 1, 6, 1, -1],
  [6, 1, 7, 1, -1],
  [8, 6, 1, 1, 1],
  [11, 6, 11, -1, -1],
  [14, 1, 9, 1, -1],
  [22, 7, 1, 1, 1],
  [29, 4, 1, 1, 1],
  [13, 8, 1, 1, 1],
  [17, 1, 10, 1, -1],
  [33, 5, 11, 1, -1],
  [30, 1, 3, 1, 1],
];
const diagonalSums = DIAGONALS.map(([total, row, col, dRow, dCol]) =>
  new Sum(total, ...answer.at(canvas.ray(makeCellId(row, col), dRow, dCol))));

return [
  shape,
  new Given('R1C1', BLANK), // Pin the otherwise-unused ISS main-grid cell.
  answer.toVar('11x11 answer, row-major; 0 is blank'),
  placements.toVar('selected 3x3 top-left corners'),
  placements.makeReplicate(new Given(placements.cells()[0], UNUSED, SELECTED)),
  new ContainExact(selectedValues, ...placements.cells()),
  ...regions,
  ...memberships,
  ...rowAndColumnUniqueness,
  ...diagonalSums,
];
