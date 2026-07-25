// Title: It Takes Two
// Author: ChinStrap and Calvinball
// Video: https://www.youtube.com/watch?v=qHQB2p4LFlA
// Source: https://sudokupad.app/nlvnqdwjsr

// Normal sudoku applies to the grid's DIGITS (row/column/box all-different).
// Every cell also has a VALUE, used only by the cage and Nabner rules below:
// a cell's value equals its digit, except that Touching Twos overrides it.
//
// Touching Twos: any cell orthogonally adjacent to a cell whose DIGIT is 2
// has its VALUE forced to 2, regardless of what its own digit is.
//
// Killer cages: cage cells have distinct DIGITS; a cage's printed total is
// the sum of its cells' VALUES (which may repeat, unlike the digits).
//
// Nabner lines (yellow): no two cells anywhere on a line -- not just
// neighbouring ones -- share or are consecutive in VALUE.
//
// The digit/value split is the puzzle's stated mechanic ("Digits may not
// repeat in a cage, but values may"; Touching Twos names "digit 2" for the
// trigger and "value of 2" for the response) -- it is not a relaxation.

const graph = cellGraph('9x9');

// Killer cages: cells + printed total, from the drawn cage geometry.
const cages = [
  { cells: ['R1C2', 'R2C1', 'R2C2', 'R2C3', 'R3C2'], total: 13 },
  { cells: ['R4C3', 'R5C3'], total: 9 },
  { cells: ['R5C1', 'R5C2', 'R6C1', 'R7C1', 'R8C1'], total: 25 },
  { cells: ['R7C2', 'R8C2', 'R9C1', 'R9C2'], total: 8 },
  { cells: ['R1C9', 'R2C9'], total: 12 },
  { cells: ['R1C6', 'R1C8', 'R2C6', 'R2C7', 'R2C8', 'R3C5', 'R3C6', 'R4C5', 'R4C6'], total: 17 },
  { cells: ['R6C4', 'R6C5', 'R6C6'], total: 9 },
  { cells: ['R6C7', 'R6C8', 'R6C9'], total: 11 },
  { cells: ['R8C9', 'R9C8', 'R9C9'], total: 15 },
];

// Nabner lines: each line is drawn twice (a white #FFFFFF outline plus a
// yellow #eae86f fill covering the same edges) -- encoded once.
const nabnerLines = [
  ['R1C3', 'R1C4', 'R2C4', 'R3C4', 'R3C3'],
  ['R6C3', 'R7C3'],
  ['R7C5', 'R7C6', 'R8C7', 'R9C6'],
  ['R4C7', 'R5C7', 'R5C8'],
];

// Only cage and Nabner cells need a value; derive the set rather than
// re-listing it.
const valueCells = [...new Set([
  ...cages.flatMap(c => c.cells),
  ...nabnerLines.flat(),
])];

const values = graph.makeOverlay('VV', valueCells);
const value = cell => values.at(cell);

// Touching Twos, per value cell: an NFA reads the cell's own digit then each
// orthogonal neighbour's digit (segment 1), then the cell's value (segment 2,
// one cell). It accepts iff value == 2 when some neighbour's digit == 2,
// else value == the cell's own digit. `pastBreak` distinguishes the final
// (value) read from the neighbour-digit reads that precede it.
const touchingTwosSpec = NFA.encodeSpec({
  startState: { own: null, any2: false, pastBreak: false, result: undefined },
  transition: (state, v) => {
    if (v === SEGMENT_BREAK) return { ...state, pastBreak: true };
    if (!state.pastBreak) {
      return state.own === null
        ? { ...state, own: v }
        : { ...state, any2: state.any2 || v === 2 };
    }
    return { ...state, result: v === (state.any2 ? 2 : state.own) };
  },
  accept: (state) => state.result === true,
}, 9, { multiSegment: true });

const touchingTwos = valueCells.map(cell => new NFA(
  touchingTwosSpec, 'touching twos',
  [cell, ...graph.neighbours(cell)],
  [value(cell)],
));

// Killer cages: digits distinct within the cage; values sum to the total.
const cageConstraints = cages.flatMap(({ cells, total }) => [
  new AllDifferent(...cells),
  new Sum(total, ...values.at(cells)),
]);

// Nabner: every pair of cells on the line (not just adjacent ones) must
// differ by more than 1 in value.
const nabnerKey = PairX.fnToKey((a, b) => a !== b && Math.abs(a - b) !== 1, 9);
const nabnerConstraints = nabnerLines.map(
  (cells, i) => new PairX(nabnerKey, `nabner ${i + 1}`, ...values.at(cells)));

return [
  new Shape('9x9'),
  values.toVar('value'),
  ...touchingTwos,
  ...cageConstraints,
  ...nabnerConstraints,
];
