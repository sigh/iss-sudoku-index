// Title: Across Roads
// Author: Sotehr
// Video: https://www.youtube.com/watch?v=n80PJ9D5B1Y
// Source: https://sudokupad.app/bg99zmbupy

// Nine non-overlapping 3x3 regions sit somewhere in the 11x11 grid; each holds
// 1-9 once, cells outside every region are 0, and nonzero digits do not repeat
// in any row or column. The visible 11x11 board allows repeated zeroes, which
// ISS's main-grid row/column houses cannot represent, so the 121 entries live
// in VA instead (0 is blank, 1-9 are placed digits). VP is the 9x9 array of
// possible 3x3 top-left corners, with 1 meaning that region is selected.

const BLANK = 0;
const UNUSED = 0;
const SELECTED = 1;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const shape = new Shape('1x1', '0-9');
const canvas = cellGraph('11x11');
const answer = canvas.makeOverlay('VA');
const answerVar = answer.toVar('11x11 answer, row-major; 0 is blank');
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
  const blockCells = blockAt(topLeft);
  return new Or([
    new Given(placements.at(topLeft), UNUSED),
    new And([
      new Given(placements.at(topLeft), SELECTED),
      new AllDifferent(...blockCells),
      ...blockCells.map(cell => new Given(cell, ...DIGITS)),
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

// Silver lines: cells equidistant from the line's centre have equal values.
// Palindrome's built-in semantics (cell[i] == cell[n-1-i]) are exactly this
// rule; the value being compared is whatever VA holds, including a blank 0 --
// the rules define "value" for outside-region cells as 0, so a silver line
// through a blank forces its mirrored cell blank too.
const SILVER_LINES = [
  [[11, 5], [10, 4], [9, 3], [8, 4], [7, 5], [6, 4], [5, 3]],
  [[1, 7], [2, 8], [3, 9], [4, 8], [5, 7], [6, 8], [7, 9]],
  [[1, 2], [2, 2], [2, 1]],
  [[1, 8], [1, 9], [1, 10], [2, 10]],
];
const silverLines = SILVER_LINES.map(line => new Palindrome(...answer.at(cells(line))));

// Green lines: adjacent values along the line differ by at least 5, again
// over whatever VA holds (a blank 0 counts as its defined value). Two pairs of
// these lines cross at a shared cell (drawn as separate stroke entries in the
// source, so kept as separate constraints) rather than joining into one path.
const GREEN_LINES = [
  [[1, 6], [2, 6], [3, 6], [4, 6], [5, 6]],
  [[3, 8], [3, 7], [3, 6], [3, 5], [3, 4]],
  [[7, 6], [8, 6], [9, 6], [10, 6], [11, 6]],
  [[9, 8], [9, 7], [9, 6], [9, 5], [9, 4]],
  [[5, 5], [6, 6], [7, 7]],
  [[11, 10], [10, 10], [10, 11]],
  [[5, 4], [4, 3], [5, 2], [6, 3], [7, 4]],
  [[7, 8], [8, 9], [7, 10], [6, 9], [5, 8]],
  [[4, 9], [4, 10], [5, 11]],
  [[8, 3], [8, 2], [7, 1]],
  [[3, 3], [2, 4], [1, 5]],
  [[11, 7], [10, 8], [9, 9]],
  [[11, 4], [11, 3], [11, 2], [10, 2]],
];
const greenLines = GREEN_LINES.map(line => new Whisper(5, ...answer.at(cells(line))));

return [
  shape,
  new Given('R1C1', BLANK), // Pin the otherwise-unused ISS main-grid cell.
  answerVar,
  placements.toVar('selected 3x3 top-left corners'),
  placements.makeReplicate(new Given(placements.cells()[0], UNUSED, SELECTED)),
  new SearchPriority(100, ...placements.cells()),
  new ContainExact(selectedValues, ...placements.cells()),
  ...regions,
  ...memberships,
  ...rowAndColumnUniqueness,
  ...silverLines,
  ...greenLines,
];
