// Title: Fifteen Cages
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=VQs72Is9GxA
// Source: https://sudokupad.app/james-sinclair/fifteen-cages

// Normal Sudoku rules apply. The 15 drawn cages have distinct digits; displayed
// totals are included below, and each same-sized pair has unequal totals. Shaded
// circles are odd and each drawn black dot is a 1:2 ratio. Fog is a UI mechanic.

// The drawn cage cells and their printed totals; null means no total is printed.
const cages = [
  { sum: 15, cells: ['R7C6', 'R8C3', 'R8C4', 'R8C5', 'R8C6'] },
  { sum: 15, cells: ['R7C7', 'R8C7', 'R9C7', 'R9C8'] },
  { sum: 15, cells: ['R7C8', 'R8C8'] },
  { sum: 15, cells: ['R7C9', 'R8C9', 'R9C9'] },
  { sum: 8, cells: ['R7C2', 'R8C2'] },
  { sum: 10, cells: ['R6C1', 'R7C1'] },
  { sum: 17, cells: ['R6C8', 'R6C9'] },
  { sum: 17, cells: ['R5C7', 'R5C8', 'R6C7'] },
  { sum: 8, cells: ['R5C2', 'R5C3', 'R6C3'] },
  { sum: 17, cells: ['R4C3', 'R4C4', 'R5C4', 'R5C5', 'R6C4'] },
  { sum: 17, cells: ['R3C7', 'R3C8', 'R3C9', 'R4C9'] },
  { sum: null, cells: ['R1C3', 'R1C4', 'R2C4'] },
  { sum: null, cells: ['R3C2', 'R4C2'] },
  { sum: null, cells: ['R7C3', 'R7C4'] },
  { sum: 9, cells: ['R1C8', 'R1C9'] },
];

// A state stores the first cage's running total, then the difference between
// the two cage totals. Equal final totals are rejected. The two input segments
// always have the same length, as required by the rule.
const unequalTotalMachine = (size) => NFA.encodeSpec({
  startState: { pos: 0, value: 0 },
  transition: ({ pos, value }, digit) => {
    if (pos < size) return { pos: pos + 1, value: value + digit };
    return { pos: pos + 1, value: value - digit };
  },
  accept: ({ pos, value }) => pos === 2 * size && value !== 0,
  maxDepth: 2 * size,
}, 9);

const sameSizePairs = cages.flatMap((cage, index) =>
  cages.slice(index + 1)
    .filter(other => other.cells.length === cage.cells.length)
    .map(other => [cage, other]));

const cageConstraints = cages.map(({ sum, cells }) =>
  sum === null ? new AllDifferent(...cells) : new Cage(sum, ...cells));

const unequalCageTotals = sameSizePairs.map(([first, second]) =>
  new NFA(unequalTotalMachine(first.cells.length), 'unequal cage totals',
    ...first.cells, ...second.cells));

// The shaded circles in the source are at R4C4 and R4C8.
const oddCircles = [
  new Given('R4C4', 1, 3, 5, 7, 9),
  new Given('R4C8', 1, 3, 5, 7, 9),
];

// Black dots transcribed from the source drawing.
const blackDots = [
  ['R9C4', 'R9C5'], ['R8C5', 'R9C5'], ['R8C2', 'R8C1'],
  ['R3C9', 'R4C9'], ['R5C7', 'R4C7'], ['R4C2', 'R5C2'],
  ['R2C6', 'R3C6'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...cageConstraints,
  ...unequalCageTotals,
  ...oddCircles,
  ...blackDots,
];
