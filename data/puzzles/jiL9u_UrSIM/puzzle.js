// Title: Kropki Palindrome Sudoku
// Author: Sumanta Mukherjee
// Video: https://www.youtube.com/watch?v=jiL9u_UrSIM
// Source: https://app.crackingthecryptic.com/sudoku/3Gmmrtr4hp

// Normal sudoku (9x9, standard 3x3 boxes). Two grey lines are palindromes.
// Black dots join cells in a 1:2 ratio; white dots join consecutive cells.
// "Not all dots are given" -- only the drawn dots are enforced, no exhaustive
// negative over unmarked pairs. One inequality mark sits on the edge between
// R6C4 and R6C5; the rules say the sign points at the lower digit.

const givens = [
  new Given('R3C7', 3),
  new Given('R7C3', 9),
];

// Palindrome A: R3C4-R3C5-R3C6-R3C7-R4C7-R5C7-R6C7 (grey line). R3C7
// (given 3) is the 4th of 7 cells, the pivot of an odd-length palindrome --
// corroborates the traced cell path.
const palindromeA = new Palindrome(
  'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C7', 'R5C7', 'R6C7'
);

// Palindrome B: R3C3-R4C3-R5C3-R6C3-R7C3-R7C4-R7C5-R7C6-R7C7 (grey line).
// R7C3 (given 9) is the 5th of 9 cells, the pivot of an odd-length
// palindrome -- corroborates the traced cell path.
const palindromeB = new Palindrome(
  'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7'
);

// Black (ratio) dots.
const blackDotPairs = [
  ['R1C1', 'R2C1'],
  ['R1C2', 'R2C2'],
  ['R1C4', 'R2C4'],
  ['R4C7', 'R4C8'],
  ['R6C5', 'R6C6'],
  ['R7C8', 'R8C8'],
  ['R8C6', 'R9C6'],
];
const blackDots = blackDotPairs.map(([a, b]) => new BlackDot(a, b));

// White (consecutive) dots.
const whiteDotPairs = [
  ['R1C7', 'R1C8'],
  ['R1C8', 'R2C8'],
  ['R2C8', 'R2C9'],
  ['R1C9', 'R2C9'],
  ['R8C8', 'R8C9'],
  ['R8C8', 'R9C8'],
  ['R9C8', 'R9C9'],
  ['R8C1', 'R9C1'],
  ['R8C2', 'R9C2'],
  ['R8C2', 'R8C3'],
  ['R6C2', 'R6C3'],
  ['R4C1', 'R4C2'],
  ['R2C2', 'R3C2'],
];
const whiteDots = whiteDotPairs.map(([a, b]) => new WhiteDot(a, b));

// Inequality mark between R6C4 and R6C5, drawn as a small chevron (not a
// cage/line-with-cells). GreaterThan(a, b) means a > b; the chevron apex
// points toward R6C4 (the lower digit per the rules), so R6C5 > R6C4.
const inequality = new GreaterThan('R6C5', 'R6C4');

return [
  new Shape('9x9'),
  ...givens,
  palindromeA,
  palindromeB,
  ...blackDots,
  ...whiteDots,
  inequality,
];
