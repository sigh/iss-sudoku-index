// Title: Across Roads
// Author: Sotehr
// Video: https://www.youtube.com/watch?v=n80PJ9D5B1Y
// Source: https://sudokupad.app/bg99zmbupy

// Nine non-overlapping 3x3 regions sit somewhere in the 11x11 board; each holds
// 1-9 once each, every cell outside all nine regions has value 0, and no digit
// repeats in any row or column of the board. Green lines: adjacent values differ
// by at least 5. Silver lines: cells equidistant from the line's centre have
// equal values.
//
// Rows and columns of the board repeat the value 0, which a main grid's
// automatic all-different forbids, so the board is Raw: 0 is an outside cell,
// 1-9 a placed digit, and no implicit constraints apply. VP is the 9x9 array
// of candidate 3x3 top-left corners, 1 meaning that region is used.

const BLANK = 0;
const UNUSED = 0;
const SELECTED = 1;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const shape = new Shape('11x11', '0-9', 'Raw');
const boardRef = cellGraph(shape);
const cornerRef = cellGraph('9x9');
const placements = cornerRef.makeOverlay('VP');
const topLefts = cornerRef.cells();
const cells = coordinates => coordinates.map(([row, col]) => makeCellId(row, col));

const blockAt = topLeft => boardRef.block(topLeft, 3, 3);
const selectorsCovering = cell => placements.at(topLefts
  .filter(topLeft => boardRef.block(topLeft, 3, 3).includes(cell)));

const selectedValues = Array(9).fill(SELECTED).join('_');

// A used top-left creates one complete 1-9 region; an unused one has no digit
// effect. Exactly nine top-lefts are used, per ContainExact below.
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

// Per board cell: the first symbol is its own value, which sets the required
// number of covering used regions (0 for a blank, 1 for a digit); the remaining
// symbols are the 0/1 selectors of every 3x3 block containing it, and must sum
// to that number. This enforces coverage of the digits and non-overlap at once.
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
const memberships = boardRef.cells().map(cell => new NFA(
  membershipMachine, 'region membership', cell, ...selectorsCovering(cell)));

// A bitset of the placed digits seen so far: 0 is skipped so it may repeat,
// while a repeated 1-9 is rejected.
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
  ...boardRef.rows().map(row =>
    new NFA(noRepeatedDigitMachine, 'row nonblank digits differ', ...row)),
  ...boardRef.columns().map(column =>
    new NFA(noRepeatedDigitMachine, 'column nonblank digits differ', ...column)),
];

// The line rules are stated over "values", and the rules text defines the value
// of an outside cell as 0, so both line classes are applied to the raw board
// values with no carve-out for blanks.

// Silver line cell orders, transcribed from the four #aaaf strokes.
const SILVER_LINES = [
  [[11, 5], [10, 4], [9, 3], [8, 4], [7, 5], [6, 4], [5, 3]],
  [[1, 7], [2, 8], [3, 9], [4, 8], [5, 7], [6, 8], [7, 9]],
  [[1, 2], [2, 2], [2, 1]],
  [[1, 8], [1, 9], [1, 10], [2, 10]],
];
const silverLines = SILVER_LINES.map(line => new Palindrome(...cells(line)));

// Green line cell orders, transcribed from the thirteen springgreen strokes.
// Two pairs meet at a shared cell (R3C6, R9C6); each is a separate stroke in the
// drawing with its own endpoints, so each stays its own constraint rather than
// being joined into one path.
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
const greenLines = GREEN_LINES.map(line => new Whisper(5, ...cells(line)));

return [
  shape,
  placements.toVar('used 3x3 top-left corners'),
  placements.makeReplicate(new Given(placements.cells()[0], UNUSED, SELECTED)),
  new ContainExact(selectedValues, ...placements.cells()),
  ...regions,
  ...memberships,
  ...rowAndColumnUniqueness,
  ...silverLines,
  ...greenLines,
];
