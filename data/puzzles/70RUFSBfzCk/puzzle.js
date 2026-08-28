// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=70RUFSBfzCk
// Source: https://cracking-the-cryptic.web.app/sudoku/DGHdjmJQnH

// Normal sudoku rules apply (default Shape('9x9') gives rows, columns and the
// nine 3x3 boxes). Both marked main diagonals hold 1-9 once each. Cells a
// king's move apart cannot repeat a digit, globally. The grey dominoes each
// form a 2-digit prime number. The blue-circled cells form a (slightly
// offset) magic square.
//
// The rules give no arrow or bulb marking direction, but a two-digit number
// written across two grid cells with no such mark is conventionally read the
// way any number is written: left-to-right (these dominoes are all
// horizontal), the standard convention this genre uses for domino/pill
// number clues absent an explicit direction mark. This is a single fixed
// convention, not a per-domino choice -- unlike a line's two symmetric
// endpoints, the domino's two cells already have a left/right order that
// text reads by.

// Givens, transcribed from the payload.
const givens = [
  new Given('R3C2', 1),
  new Given('R7C8', 2),
];

// Diagonals, transcribed from the payload's two red corner-to-corner lines.
const diagonals = [
  new Diagonal(-1), // R1C1-R9C9
  new Diagonal(1),  // R1C9-R9C1
];

const antiKing = new AntiKing();

// Grey dominoes: 9 horizontal 2-cell pairs, transcribed from the payload's
// grey 1x1 underlay shapes (each pair shares a row, adjacent columns).
const dominoes = [
  ['R1C1', 'R1C2'],
  ['R2C4', 'R2C5'],
  ['R3C7', 'R3C8'],
  ['R4C1', 'R4C2'],
  ['R5C4', 'R5C5'],
  ['R6C7', 'R6C8'],
  ['R7C1', 'R7C2'],
  ['R8C4', 'R8C5'],
  ['R9C7', 'R9C8'],
];

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

// Left cell (a) is the tens digit, right cell (b) is the units digit.
const twoDigitPrimeLeftToRight = Pair.fnToKey((a, b) => isPrime(10 * a + b), 9);

const dominoPrimes = dominoes.map(
  ([a, b]) => new Pair(twoDigitPrimeLeftToRight, 'domino forms a 2-digit prime', a, b));

// Magic square: one blue-circled cell on the leading cell of each domino
// above, transcribed from the payload's blue-bordered circle underlays. The
// "slightly offset" 3x3 layout, in reading order:
//   R1C1  R2C4  R3C7
//   R4C1  R5C4  R6C7
//   R7C1  R8C4  R9C7
const magicCells = [
  'R1C1', 'R2C4', 'R3C7',
  'R4C1', 'R5C4', 'R6C7',
  'R7C1', 'R8C4', 'R9C7',
];

const magicRows = [
  magicCells.slice(0, 3),
  magicCells.slice(3, 6),
  magicCells.slice(6, 9),
];
const magicCols = [0, 1, 2].map(c => [magicCells[c], magicCells[c + 3], magicCells[c + 6]]);
const magicDiag1 = [magicCells[0], magicCells[4], magicCells[8]];
const magicDiag2 = [magicCells[2], magicCells[4], magicCells[6]];

// All 9 cells distinct (so they hold 1-9 once each); EqualSum over the 3x3
// diagram's rows/cols/diagonals then forces the common sum to 15 by itself.
const magicSquare = [
  new AllDifferent(...magicCells),
  new EqualSum(...magicRows, ...magicCols, magicDiag1, magicDiag2),
];

return [
  ...givens,
  ...diagonals,
  antiKing,
  ...dominoPrimes,
  ...magicSquare,
];
