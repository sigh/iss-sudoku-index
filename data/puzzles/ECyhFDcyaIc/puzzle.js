// Title: My Original Reality Show Entertainment
// Author: Chip Sounder
// Video: https://www.youtube.com/watch?v=ECyhFDcyaIc
// Source: https://sudokupad.app/u3wks9egf5

// Normal sudoku rules apply (rows, columns, and 3x3 boxes).
// - Outside clues give the sandwich sum: the sum of the digits strictly
//   between the 1 and the 9 in that row.
// - Cells joined by a white dot are consecutive (Kropki white dot).
// - Cells joined by a black dot are in a 1:2 ratio (Kropki black dot).
// - Adjacent digits along a green line must differ by at least 5.
// - Adjacent digits along a red line must alternate parity (one odd, one
//   even).
// - Digits in a dotted killer cage do not repeat and sum to the total shown
//   in the cage's top-left corner.
// - The grey line is a palindrome: it reads the same forwards and backwards.

const greenLines = [
  ['R1C4', 'R1C5'],
  ['R1C6', 'R1C7'],
  ['R1C8', 'R1C9'],
  ['R5C1', 'R5C2'],
  ['R5C3', 'R5C4'],
  ['R5C5', 'R5C6'],
  ['R9C1', 'R9C2'],
];

const redLines = [
  ['R3C4', 'R3C5'],
  ['R3C6', 'R3C7'],
  ['R7C3', 'R7C4'],
  ['R7C8', 'R7C9'],
  ['R9C8', 'R9C9'],
];

const whiteDots = [
  ['R1C1', 'R1C2'],
  ['R1C2', 'R1C3'],
  ['R1C3', 'R1C4'],
  ['R3C1', 'R3C2'],
  ['R3C2', 'R3C3'],
  ['R3C3', 'R3C4'],
  ['R3C8', 'R3C9'],
  ['R5C7', 'R5C8'],
  ['R5C8', 'R5C9'],
  ['R7C1', 'R7C2'],
  ['R7C5', 'R7C6'],
  ['R7C6', 'R7C7'],
  ['R9C3', 'R9C4'],
  ['R9C5', 'R9C6'],
  ['R9C6', 'R9C7'],
];

const blackDots = [
  ['R2C7', 'R2C8'],
  ['R2C8', 'R2C9'],
  ['R6C3', 'R6C4'],
  ['R8C3', 'R9C3'],
  ['R8C7', 'R9C7'],
  ['R8C4', 'R8C5'],
];

const greenKey = Pair.fnToKey((a, b) => Math.abs(a - b) >= 5, 9);
const redKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);

return [
  new Shape('9x9'),

  // Outside sandwich sum clues (sum of digits strictly between 1 and 9).
  new Sandwich('R1,1', 10),
  new Sandwich('R5,1', 20),
  new Sandwich('R8,1', 2),

  // Killer cages (distinct digits, given sum).
  new Cage(24, 'R8C1', 'R8C2', 'R9C2', 'R9C3'),
  new Cage(7, 'R8C7', 'R8C8'),

  // Kropki dots.
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),

  // Difference >= 5 (green) and alternating parity (red) lines.
  ...greenLines.map(cells => new Pair(greenKey, 'Green', ...cells)),
  ...redLines.map(cells => new Pair(redKey, 'Red', ...cells)),

  // Palindrome (grey) line.
  new Palindrome('R8C8', 'R7C7', 'R6C6', 'R6C5'),
];
