// Title: Birdcage
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=afq1e2QsfxI
// Source: https://sudokupad.app/james-sinclair/birdcage

// Rules:
// Normal sudoku rules apply, and all clues are standard.
// Renban lines: digits form a non-repeating set of consecutive digits, in
// any order.
// Nabner lines: digits form a non-repeating set, and no two digits on the
// same line are consecutive (regardless of position on the line) -- encoded
// per line as AllDifferent + a PairX forbidding a consecutive pair between
// any two of the line's cells.
// Odd cells (shaded circle): the digit is odd.
// Ratio pairs (black dot): the two digits are in a 1:2 ratio.
//
// Each 2x2 corner Renban box is drawn in the source as two crossing paths
// over the same 4 cells (a duplicate stroke layer forming a box outline for
// visual effect) -- encoded once per box.

// Renban regions: the four 2x2 corner boxes, then the two center lines.
const renbanRegions = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2'],
  ['R1C8', 'R1C9', 'R2C8', 'R2C9'],
  ['R8C1', 'R8C2', 'R9C1', 'R9C2'],
  ['R8C8', 'R8C9', 'R9C8', 'R9C9'],
  ['R6C5', 'R6C6', 'R5C6'],
  ['R5C4', 'R5C5', 'R4C6'],
];

// Nabner lines, from the source's `nabner` array.
const nabnerLines = [
  ['R7C2', 'R7C3', 'R8C3'],
  ['R8C7', 'R7C7', 'R7C8'],
  ['R2C7', 'R3C7', 'R3C8'],
  ['R3C2', 'R3C3', 'R2C3'],
  ['R5C3', 'R6C3', 'R7C4'],
  ['R3C5', 'R3C6', 'R4C7'],
  ['R8C5', 'R7C6', 'R6C7', 'R5C8'],
];

// Odd cells, from the source's `odd` array.
const oddCells = ['R5C6', 'R1C1', 'R2C2'];

// Ratio (black dot) pairs, from the source's `ratio` array.
const ratioPairs = [
  ['R7C2', 'R7C3'],
  ['R2C7', 'R3C7'],
  ['R8C5', 'R9C5'],
  ['R4C8', 'R5C8'],
];

const notConsecutive = PairX.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

const renban = renbanRegions.map((cells) => new Renban(...cells));

const nabner = nabnerLines.flatMap((cells) => [
  new AllDifferent(...cells),
  new PairX(notConsecutive, 'not consecutive', ...cells),
]);

const odd = oddCells.map((cell) => new Given(cell, 1, 3, 5, 7, 9));

const ratio = ratioPairs.map((cells) => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...renban,
  ...nabner,
  ...odd,
  ...ratio,
];
