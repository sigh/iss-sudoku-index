// Title: ABENNR
// Author: FullDeck and Missing a Few Cards
// Video: https://www.youtube.com/watch?v=F9hDmMzYZn4
// Source: https://sudokupad.app/1uv7hh848p
//
// Standard sudoku. Every grey line is either a Renban line (a non-repeating
// consecutive set, any order) or a Nabner line (no two digits on the line are
// consecutive, regardless of position) -- the drawing does not distinguish
// which, so each line is encoded as Or(Renban, all-pairs-non-consecutive).
// Kropki: one black dot (2:1 ratio) and eight white dots (consecutive);
// undotted adjacent pairs carry no relation. Even/odd cells restrict the
// candidate set directly.

// Each entry is a cell path for one drawn grey line.
const lines = [
  ['R2C1', 'R1C1', 'R1C2', 'R1C3'],
  ['R3C1', 'R3C2', 'R3C3', 'R2C3'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9'],
  ['R3C9', 'R3C8', 'R3C7', 'R2C7'],
  ['R9C7', 'R9C8', 'R9C9', 'R8C9'],
  ['R7C9', 'R7C8', 'R7C7', 'R8C7'],
  ['R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['R8C3', 'R7C3', 'R7C2', 'R7C1'],
  ['R4C7', 'R4C8', 'R4C9', 'R5C9', 'R6C9'],
  ['R4C3', 'R4C2', 'R4C1', 'R5C1', 'R6C1'],
  ['R5C7', 'R6C7', 'R6C8'],
  ['R6C2', 'R6C3', 'R5C3'],
  ['R4C4', 'R4C5', 'R4C6'],
  ['R5C5', 'R5C4', 'R6C4'],
  ['R6C5', 'R6C6', 'R5C6'],
];

// Nabner: no two digits on the line are consecutive, "regardless of their
// position on the line" -- an all-pairs (not just adjacent) relation.
const nabnerKey = Pair.fnToKey((a, b) => Math.abs(a - b) > 1, 9);
const ambiguousLines = lines.map(cells => new Or([
  new Renban(...cells),
  new PairX(nabnerKey, '', ...cells),
]));

// Kropki dots: a solid black dot marks a 2:1 pair, a white dot with a black
// border marks a consecutive pair.
const blackDots = [
  ['R5C5', 'R6C5'],
];
const whiteDots = [
  ['R6C3', 'R7C3'],
  ['R7C6', 'R7C7'],
  ['R1C8', 'R2C8'],
  ['R2C5', 'R3C5'],
  ['R4C4', 'R4C5'],
  ['R1C2', 'R2C2'],
  ['R5C2', 'R6C2'],
  ['R8C2', 'R9C2'],
];

// Even/odd cells: a grey square marks even, a grey circle marks odd.
const evenCells = [
  'R2C2', 'R2C8', 'R1C9', 'R3C3', 'R8C2', 'R9C1', 'R7C7', 'R8C8',
];
const oddCells = [
  'R5C2', 'R5C8', 'R6C3', 'R6C7',
];

return [
  new Shape('9x9'),
  ...ambiguousLines,
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
];
