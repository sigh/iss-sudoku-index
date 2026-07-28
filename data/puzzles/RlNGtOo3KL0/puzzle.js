// Title: Rainbow Kropki
// Author: LJC
// Video: https://www.youtube.com/watch?v=RlNGtOo3KL0
// Source: https://sudokupad.app/QBNff6rPdR

// Normal 6x6 sudoku (row/column/2x3-box all-different, digits 1-6) is the
// ISS default. Cages contain distinct digits summing to their printed totals.
// No three contiguous row/column cells may have the same parity: an NFA scans
// each row and column, retaining the parity and a same-parity run length capped
// at two. A third cell of that parity rejects the branch.
//
// Each colour has an unknown digit-difference value. Three colours are drawn,
// so three auxiliary Vars, each in the possible 1-5 difference range and
// pairwise distinct, represent their values. Every dot is an Or of the two
// equal-sum orientations of |a-b|=difference.

const CAGES = [
  // Drawn cage cells and their printed totals.
  { cells: ['R1C1', 'R1C2', 'R1C3'], total: 11 },
  { cells: ['R3C4', 'R3C5', 'R4C5', 'R4C4'], total: 18 },
  { cells: ['R5C6', 'R6C6', 'R6C5'], total: 12 },
  { cells: ['R5C3', 'R5C2'], total: 7 },
  { cells: ['R4C1', 'R5C1'], total: 6 },
];
const cages = CAGES.map(cage => new Cage(cage.total, ...cage.cells));

// Dot edges, grouped by their drawn fill colour.
const DOT_GROUPS = {
  red: [
    ['R1C2', 'R1C3'], ['R1C4', 'R1C5'], ['R3C1', 'R3C2'], ['R4C1', 'R5C1'],
  ],
  gold: [
    ['R3C3', 'R3C4'], ['R5C6', 'R6C6'], ['R6C5', 'R6C6'],
  ],
  blue: [['R2C6', 'R3C6'], ['R6C1', 'R6C2']],
};
const COLOURS = Object.keys(DOT_GROUPS);
const differences = new Var('D', 'colour differences', COLOURS.length);
const differenceCell = colour => differences.cell(COLOURS.indexOf(colour) + 1);
const differenceDomains = COLOURS.map(
  colour => new Given(differenceCell(colour), 1, 2, 3, 4, 5));

function differenceEquals(a, b, difference) {
  return new Or([
    new EqualSum([a], [b, difference]),
    new EqualSum([b], [a, difference]),
  ]);
}
const dots = COLOURS.flatMap(colour =>
  DOT_GROUPS[colour].map(([a, b]) => differenceEquals(a, b, differenceCell(colour))));

// State encodes parity*10 + same-parity run length; -1 is the empty scan.
const noTripleParitySpec = NFA.encodeSpec({
  startState: -1,
  transition: (state, value) => {
    const parity = value % 2;
    if (state === -1) return parity * 10 + 1;
    const previousParity = Math.floor(state / 10);
    const runLength = state % 10;
    if (parity === previousParity) {
      const nextRunLength = runLength + 1;
      return nextRunLength >= 3 ? undefined : parity * 10 + nextRunLength;
    }
    return parity * 10 + 1;
  },
  accept: () => true,
}, 6);
const graph = cellGraph('6x6');
const noTripleParity = [
  ...graph.rows().map(
    (cells, index) => new NFA(noTripleParitySpec, `row ${index + 1} parity`, ...cells)),
  ...graph.columns().map(
    (cells, index) => new NFA(noTripleParitySpec, `col ${index + 1} parity`, ...cells)),
];

return [
  new Shape('6x6'),
  ...cages,
  differences,
  ...differenceDomains,
  new AllDifferent(...COLOURS.map(differenceCell)),
  ...dots,
  ...noTripleParity,
];
