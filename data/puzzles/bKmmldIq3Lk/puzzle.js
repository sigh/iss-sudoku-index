// Title: +/- Information
// Author: Chris Napolitano
// Video: https://www.youtube.com/watch?v=bKmmldIq3Lk
// Source: https://sudokupad.app/gx4cd1q3zo
//
// Standard sudoku over digits 0-8 (not 1-9) in every row, column, and box.
// V marks between adjacent cells mean the pair sums to 5; X marks mean the
// pair sums to 10. Every V and X is drawn, so any unmarked adjacent pair
// sums to neither 5 nor 10 (StrictXV below) -- no X marks are drawn at all,
// so no adjacent pair anywhere sums to 10. Both diagonals must not repeat a
// digit. The purple (dark orchid / orchid) lines are Renban lines:
// the whole main diagonal, plus four independent 2-cell segments elsewhere
// in the grid. The blue anti-diagonal line is drawn only to mark the
// second diagonal for the no-repeat rule -- it is not purple, so it is not
// a Renban line.

const mainDiagonal = ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'];

// Four independent 2-cell Renban segments (short purple/orchid lines).
const shortRenbans = [
  ['R5C3', 'R6C3'],
  ['R8C7', 'R8C8'],
  ['R1C7', 'R2C7'],
  ['R9C8', 'R9C9'],
];

// Every V-marked edge (white circle, "V", drawn on the edge between two
// orthogonally adjacent cells). No X marks are drawn anywhere.
const vPairs = [
  ['R1C1', 'R1C2'],
  ['R1C8', 'R1C9'],
  ['R2C1', 'R2C2'],
  ['R3C1', 'R3C2'],
  ['R2C8', 'R2C9'],
  ['R3C8', 'R3C9'],
  ['R9C7', 'R9C8'],
  ['R8C7', 'R8C8'],
  ['R7C7', 'R7C8'],
  ['R7C4', 'R7C5'],
  ['R8C4', 'R8C5'],
  ['R9C4', 'R9C5'],
  ['R5C5', 'R5C6'],
];

return [
  new Shape('9x9', '0-8'),

  // Diagonal(-1) is R1C1..R9C9 (main); Diagonal(1) is R9C1..R1C9 (anti).
  new Diagonal(-1),
  new Diagonal(1),

  // The main diagonal is also a 9-cell Renban. With a 9-value alphabet and
  // an already-forced all-different diagonal, this is implied (9 distinct
  // digits from a 9-digit alphabet are necessarily the whole alphabet, and
  // so trivially consecutive) but is encoded directly since the rules
  // state it as its own clue.
  new Renban(...mainDiagonal),
  ...shortRenbans.map(cells => new Renban(...cells)),

  ...vPairs.map(([a, b]) => new V(a, b)),
  // "Every V and X is given": no other adjacent pair sums to 5 or 10.
  new StrictXV(),
];
