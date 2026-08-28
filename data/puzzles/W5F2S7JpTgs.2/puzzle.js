// Title: Apr 19, 2021: Palindrome Quads
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=W5F2S7JpTgs
// Source: https://tinyurl.com/2b96sjwv

// Normal sudoku rules apply. Grey lines are palindromes (the digit sequence
// along the line reads the same forwards and backwards). White circles are
// quadruples: each listed digit must appear in at least one of the four
// cells surrounding the circle. No givens.

// Palindrome lines (from source `palindrome`; open lines, not loops, so no
// wrap-around repeat is needed).
const palindromes = [
  ['R2C6', 'R3C6', 'R4C7', 'R4C8', 'R3C9', 'R2C9', 'R1C8', 'R1C7'],
  ['R8C4', 'R7C4', 'R6C3', 'R6C2', 'R7C1', 'R8C1', 'R9C2', 'R9C3'],
  ['R3C2', 'R3C3', 'R4C4', 'R4C5'],
  ['R6C5', 'R6C6', 'R7C7', 'R7C8'],
].map((cells) => new Palindrome(...cells));

// Quadruple clues (from source `quadruple`): topLeftCell of each drawn 2x2
// square plus the values that must appear somewhere in that square.
const quads = [
  ['R1C7', [1, 2, 3, 4]],
  ['R2C5', [3, 4, 5, 6]],
  ['R8C2', [3, 4, 5, 6]],
  ['R7C4', [5, 6, 7, 8]],
  ['R4C7', [1, 2, 5, 6]],
  ['R5C2', [1, 2, 7, 8]],
  ['R8C8', [1, 2, 5, 7]],
  ['R1C1', [4, 6, 7, 8]],
  ['R4C3', [1, 3]],
  ['R5C6', [1, 4]],
].map(([topLeft, values]) => new Quad(topLeft, ...values));

return [new Shape('9x9'), ...palindromes, ...quads];
