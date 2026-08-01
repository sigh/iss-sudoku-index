// Title: Dark Magic
// Author: Giesmania
// Video: https://www.youtube.com/watch?v=U152erYxYh8
// Source: https://sudokupad.app/bhxcnaf8gg

// Nine non-overlapping 3x3 boxes are placed on the 11x11 canvas. VA stores the
// visible answer (0 for blank); VP selects the 9x9 array of possible box
// top-left corners. Every non-corner selected box is a magic square. The two
// thermometers, dots, diagonal sums, given, and blue diagonal are the drawn
// clues. Nothing is omitted.

const BLANK = 0;
const UNUSED = 0;
const SELECTED = 1;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// The main ISS grid is an inert 1x1 placeholder. The displayed canvas needs
// repeated blanks, so the source answer instead lives in the 11x11 VA group.
const shape = new Shape('1x1', '0-9');
const canvas = cellGraph('11x11');
const answer = canvas.makeOverlay('VA');
const placementGrid = cellGraph('9x9');
const placements = placementGrid.makeOverlay('VP');
const topLefts = placementGrid.cells();

const blockAt = topLeft => answer.at(canvas.block(topLeft, 3, 3));
const selectorsCovering = cell => placements.at(topLefts.filter(topLeft =>
  canvas.block(topLeft, 3, 3).includes(cell)));
const isCanvasCorner = cell => ['R1C1', 'R1C9', 'R9C1', 'R9C9'].includes(cell);
const cellsAt = coordinates => answer.at(coordinates.map(([row, col]) => makeCellId(row, col)));

// A selected top-left creates one complete 1-9 region. Every non-corner region
// also has equal sums on its three rows, three columns, and two diagonals.
const regions = topLefts.map(topLeft => {
  const cells = blockAt(topLeft);
  const rows = [cells.slice(0, 3), cells.slice(3, 6), cells.slice(6, 9)];
  const cols = [[cells[0], cells[3], cells[6]], [cells[1], cells[4], cells[7]],
    [cells[2], cells[5], cells[8]]];
  const diagonals = [[cells[0], cells[4], cells[8]], [cells[2], cells[4], cells[6]]];
  const boxRules = [new AllDifferent(...cells), ...cells.map(cell => new Given(cell, ...DIGITS))];
  if (!isCanvasCorner(topLeft)) boxRules.push(new EqualSum(...rows, ...cols, ...diagonals));
  return new Or([
    new Given(placements.at(topLeft), UNUSED),
    new And([new Given(placements.at(topLeft), SELECTED), ...boxRules]),
  ]);
});

// Scan an answer cell followed by every possible box that covers it. A blank is
// covered zero times; a digit is covered exactly once. This also forbids overlap.
const membershipMachine = NFA.encodeSpec({
  startState: { needed: null, count: 0 },
  transition: ({ needed, count }, value) => {
    if (needed === null) return { needed: value === BLANK ? 0 : 1, count: 0 };
    if (value !== UNUSED && value !== SELECTED) return undefined;
    const next = count + value;
    return next <= needed ? { needed, count: next } : undefined;
  },
  accept: ({ needed, count }) => needed !== null && count === needed,
}, shape);
const memberships = canvas.cells().map(cell => new NFA(
  membershipMachine, 'region membership', answer.at(cell), ...selectorsCovering(cell)));

// Blanks may repeat; placed digits may not repeat in any canvas row, column, or
// the blue main diagonal.
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
  ...canvas.rows().map(row => new NFA(noRepeatedDigitMachine,
    'row nonblank digits differ', ...answer.at(row))),
  ...canvas.columns().map(column => new NFA(noRepeatedDigitMachine,
    'column nonblank digits differ', ...answer.at(column))),
];
// The drawn thin blue stroke runs corner-to-corner through these eleven cells.
const blueDiagonal = cellsAt([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6],
  [7, 7], [8, 8], [9, 9], [10, 10], [11, 11]]);

const ratioKey = ratio => Pair.fnToKey((a, b) =>
  a !== BLANK && b !== BLANK && (a === ratio * b || b === ratio * a), shape);

return [
  shape,
  new Given('R1C1', BLANK),
  answer.toVar('11x11 answer, row-major; 0 is blank'),
  placements.toVar('selected 3x3 top-left corners'),
  placements.makeReplicate(new Given(placements.cells()[0], UNUSED, SELECTED)),
  new ContainExact(Array(9).fill(SELECTED).join('_'), ...placements.cells()),
  ...regions,
  ...memberships,
  ...rowAndColumnUniqueness,
  new Given(cellsAt([[6, 6]])[0], 5),
  new Thermo(...cellsAt([[1, 1], [2, 2], [3, 3], [3, 4]])),
  new Thermo(...cellsAt([[11, 7], [10, 6], [9, 6], [10, 7], [9, 7]])),
  new Pair(ratioKey(4), 'ratio 4', ...cellsAt([[10, 9], [11, 9]])),
  new Pair(ratioKey(3), 'ratio 3', ...cellsAt([[9, 9], [10, 9]])),
  new WhiteDot(...cellsAt([[5, 5], [6, 5]])),
  new WhiteDot(...cellsAt([[9, 3], [10, 3]])),
  new Sum(6, ...cellsAt([[1, 6], [2, 7], [3, 8], [4, 9], [5, 10], [6, 11]])),
  new Sum(22, ...cellsAt([[2, 11], [3, 10], [4, 9], [5, 8], [6, 7], [7, 6],
    [8, 5], [9, 4], [10, 3], [11, 2]])),
  new NFA(noRepeatedDigitMachine, 'blue diagonal nonblank digits differ', ...blueDiagonal),
];
