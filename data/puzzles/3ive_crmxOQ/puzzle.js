// Title: .357 Magnum
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=3ive_crmxOQ
// Source: https://sudokupad.app/r9hx4s0yib

// Normal sudoku rules (default 9x9 rows/cols/boxes).
// Killer cage: R7C8,R7C9 sum to 11, digits distinct.
// Outside diagonal sum: the drawn arrow at the R1C1 corner points
// down-and-right, pairing the "53" clue with the R1C1..R9C9 diagonal
// (repeats allowed there, per rules text).
// Blue line: no-repeat diagonal, drawn corner to corner from R1C9 to R9C1.
// Grey square: R7C5 holds an even digit (candidate restriction, no Odd/Even
// class -- see iss-constraints catalog).
// Grey lines: palindromes (read the same forwards and backwards); a 2-cell
// palindrome just forces its two cells equal.
// White/black dots: Kropki consecutive / double, each an isolated adjacent
// pair (not chained), per the drawn overlay list.

const geometry = cellGeometry(new Shape('9x9'));

const mainDiagonal = [
  'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9',
];

const palindromes = [
  ['R1C5', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R5C1'],
  ['R5C9', 'R5C8', 'R6C7', 'R7C6', 'R8C5', 'R9C5'],
  ['R3C6', 'R4C5'],
  ['R4C7', 'R5C6'],
  ['R5C4', 'R6C3'],
  ['R6C5', 'R7C4'],
].map(cells => new Palindrome(...cells));

const whiteDots = [
  ['R1C1', 'R1C2'],
  ['R3C8', 'R3C9'],
  ['R5C5', 'R6C5'],
  ['R7C1', 'R8C1'],
].map(cells => new WhiteDot(...cells));

const blackDots = [
  ['R1C3', 'R2C3'],
  ['R1C7', 'R2C7'],
  ['R8C7', 'R9C7'],
  ['R8C3', 'R9C3'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),

  new Cage(11, 'R7C8', 'R7C9'),

  LittleKiller.fromCells(53, mainDiagonal, geometry),
  new Diagonal(1), // anti-diagonal R1C9..R9C1: the drawn blue no-repeat line

  new Given('R7C5', 2, 4, 6, 8), // grey square: even digit

  ...palindromes,
  ...whiteDots,
  ...blackDots,
];
