// Title: Magic Eggs
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=Mg1Lt7QObJc
// Source: https://sudokupad.app/6gv40dsdo2

// Normal sudoku rules apply (9x9, standard rows/cols/boxes).
// Box 1 is a magic square: all rows, columns and both diagonals of R1C1-R3C3
// sum to the same total. Modelled as EqualSum over the box's 3 rows, 3
// columns and 2 diagonals; the box's own all-different then forces the
// common total to 15.
// Adjacent digits along a green line differ by at least five (German
// whisper). Both green lines are closed loops, so each cell list repeats
// its first cell at the end to cover the wrap-around edge.
// Digits along a purple line are a set of consecutive digits, in any order,
// no repeats (Renban).
// Digits on the blue line are even; digits on the orange line are odd.
// There is no native Odd/Even class, so each line cell gets its candidates
// restricted directly via a multi-value Given.
// Cells separated by a black dot are in a 1:2 ratio (Kropki black dot).
// The rules note that not all possible black dots are shown, so only the
// two drawn dots are constraints; no negative (StrictKropki) claim is made
// about any other adjacent pair.

// Egg (top-right): green loop, its purple diagonal and its blue diagonal.
// Cell lists transcribed from the drawn strokes (source lines[0], [3], [5]).
const eggTRGreen = [
  'R6C6', 'R6C7', 'R5C8', 'R4C8', 'R3C8', 'R2C8',
  'R1C7', 'R1C6', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C6',
];
const eggTRPurple = ['R2C5', 'R3C6', 'R2C7', 'R3C8'];
const eggTRBlue = ['R3C5', 'R4C6', 'R3C7', 'R4C8'];

// Egg (bottom-left): green loop, its purple diagonal and its orange diagonal.
// Cell lists transcribed from the drawn strokes (source lines[1], [2], [4]).
const eggBLGreen = [
  'R4C2', 'R4C3', 'R5C4', 'R6C4', 'R7C4', 'R8C4',
  'R9C3', 'R9C2', 'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C2',
];
const eggBLPurple = ['R7C1', 'R8C2', 'R7C3', 'R8C4'];
const eggBLOrange = ['R6C1', 'R7C2', 'R6C3', 'R7C4'];

// Black dots: drawn edge marks (source overlays[0], [1]).
const blackDots = [
  ['R6C2', 'R7C2'],
  ['R3C6', 'R4C6'],
];

const EVENS = [2, 4, 6, 8];
const ODDS = [1, 3, 5, 7, 9];

// Box 1's rows/cols/diagonals for the magic-square EqualSum.
const box1Rows = [1, 2, 3].map((r) => [1, 2, 3].map((c) => makeCellId(r, c)));
const box1Cols = [1, 2, 3].map((c) => [1, 2, 3].map((r) => makeCellId(r, c)));
const box1Diags = [
  ['R1C1', 'R2C2', 'R3C3'],
  ['R1C3', 'R2C2', 'R3C1'],
];

return [
  new Shape('9x9'),

  new EqualSum(...box1Rows, ...box1Cols, ...box1Diags),

  new Whisper(5, ...eggTRGreen),
  new Whisper(5, ...eggBLGreen),

  new Renban(...eggTRPurple),
  new Renban(...eggBLPurple),

  ...eggTRBlue.map((cell) => new Given(cell, ...EVENS)),
  ...eggBLOrange.map((cell) => new Given(cell, ...ODDS)),

  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
