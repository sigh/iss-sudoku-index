// Title: Self-Taught Killer
// Author: Marvin Kannhauser
// Video: https://www.youtube.com/watch?v=bYR9tX_imlk
// Source: https://app.crackingthecryptic.com/sudoku/p3MJ76pJ29

// Normal sudoku rules apply (rows/cols/boxes all-different, given by the
// default 9x9 Shape/box layout). The marked (anti-)diagonal has no repeated
// digits. Grey lines are palindromes. Each outside arrow marks a diagonal of
// cells running from its entry cell to the far edge of the grid; the arrows
// carry no printed number (video: "A Puzzle with all the Clues Concealed!") --
// instead the sum of every digit on that diagonal equals the 2-digit number
// whose tens/units digits are literally the diagonal's own first two cells,
// read in the direction the arrow points. Cell lists below are transcribed
// from the drawn lines and arrows.

// Diagonal-sum arrows: sum(all cells) == 10*tens + 1*ones, where tens/ones
// are the first two cells of the diagonal in the arrow's drawn direction.
// Modelled as a coefficient Sum: cells contribute +1 each, and the
// tens/ones cells get an additional -10/-1 so the equation reads
// sum(cells) - 10*tens - 1*ones == 0.
function diagonalSum(cells) {
  const [tens, ones] = cells;
  return new Sum(0, ...cells, [tens, -10], [ones, -1]);
}

const diagonalArrows = [
  ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'],
  ['R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'],
  ['R1C7', 'R2C6', 'R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C1'],
  ['R3C9', 'R4C8', 'R5C7', 'R6C6', 'R7C5', 'R8C4', 'R9C3'],
  ['R3C1', 'R2C2', 'R1C3'],
  ['R5C1', 'R4C2', 'R3C3', 'R2C4', 'R1C5'],
  ['R6C1', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C6'],
].map(diagonalSum);

const palindromes = [
  ['R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'],
  ['R3C9', 'R4C8', 'R5C7', 'R6C6', 'R7C5', 'R8C4', 'R9C3'],
  ['R2C3', 'R3C4', 'R4C5'],
  ['R2C5', 'R3C4', 'R4C3'],
  ['R7C7', 'R8C6'],
].map(cells => new Palindrome(...cells));

return [
  new Shape('9x9'),
  new Diagonal(1), // '/' anti-diagonal: R1C9..R9C1, no repeats
  ...palindromes,
  ...diagonalArrows,
];
