// Title: Beyond the Palindrome Sudoku
// Author: Stavros96
// Video: https://www.youtube.com/watch?v=7f5QP8bP2qI
// Source: https://cracking-the-cryptic.web.app/sudoku/L88q4LMM9d

// Rules encoded: normal sudoku (default row/column/box all-different, no
// givens), four grey palindrome lines, 21 white Kropki dots (consecutive
// digits) and 1 black Kropki dot (1:2 ratio). No StrictKropki: the rules
// text states no negative Kropki constraint applies, so unmarked
// neighbouring cells are free to be consecutive or in a 1:2 ratio too.

// Grey strokes, transcribed in drawn order from the payload's line waypoints.
const palindromeLines = [
  ['R3C9', 'R4C8', 'R3C7', 'R2C6'],
  ['R2C5', 'R3C4', 'R4C3', 'R5C2'],
  ['R7C2', 'R6C3', 'R7C4', 'R8C5'],
  ['R7C6', 'R6C7', 'R5C8'],
];
const palindromes = palindromeLines.map(cells => new Palindrome(...cells));

// White (consecutive) dot pairs, transcribed from the payload's white-filled
// rounded overlays.
const whiteDotPairs = [
  ['R2C2', 'R2C3'],
  ['R2C3', 'R2C4'],
  ['R2C4', 'R2C5'],
  ['R2C6', 'R2C7'],
  ['R3C9', 'R4C9'],
  ['R5C6', 'R5C7'],
  ['R5C7', 'R5C8'],
  ['R5C6', 'R6C6'],
  ['R6C6', 'R7C6'],
  ['R6C5', 'R7C5'],
  ['R7C5', 'R8C5'],
  ['R9C7', 'R9C8'],
  ['R9C8', 'R9C9'],
  ['R8C3', 'R9C3'],
  ['R7C3', 'R8C3'],
  ['R7C2', 'R7C3'],
  ['R6C3', 'R6C4'],
  ['R6C2', 'R6C3'],
  ['R6C1', 'R6C2'],
  ['R5C1', 'R6C1'],
  ['R5C1', 'R5C2'],
];
const whiteDots = whiteDotPairs.map(([a, b]) => new WhiteDot(a, b));

// Black (1:2 ratio) dot pair, from the payload's single black-filled
// rounded overlay.
const blackDots = [new BlackDot('R4C7', 'R4C8')];

return [
  new Shape('9x9'),
  ...palindromes,
  ...whiteDots,
  ...blackDots,
];
