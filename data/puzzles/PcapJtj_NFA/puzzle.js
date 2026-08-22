// Title: Six Pack
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=PcapJtj_NFA
// Source: https://app.crackingthecryptic.com/sudoku/TjdNrDhjd8

// Normal sudoku rules apply (default row/column/box all-different, from
// Shape('9x9')). Cages sum to their printed total with no repeated digit
// inside the cage (Cage). Grey lines are palindromes: the sequence of digits
// reads the same forwards and backwards (Palindrome). Cells joined by a
// white dot hold consecutive digits (WhiteDot).

const cages = [
  [13, 'R1C1', 'R2C1'],
  [12, 'R1C4', 'R2C4'],
  [14, 'R1C7', 'R2C7'],
  [12, 'R8C1', 'R9C1'],
  [20, 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  [17, 'R6C9', 'R7C9', 'R7C8', 'R7C7'],
  [25, 'R3C9', 'R4C9', 'R4C8', 'R4C7'],
  [26, 'R3C3', 'R4C3', 'R4C2', 'R4C1'],
].map(([sum, ...cells]) => new Cage(sum, ...cells));

const palindromes = [
  ['R8C1', 'R7C1', 'R6C2', 'R6C3'],
  ['R5C1', 'R4C1', 'R3C2', 'R3C3'],
  ['R5C4', 'R4C4', 'R3C5', 'R3C6'],
  ['R8C4', 'R7C4', 'R6C5', 'R6C6'],
  ['R5C7', 'R4C7', 'R3C8', 'R3C9'],
  ['R8C7', 'R7C7', 'R6C8', 'R6C9'],
].map((cells) => new Palindrome(...cells));

const whiteDots = [
  ['R2C5', 'R3C5'],
  ['R5C5', 'R6C5'],
  ['R7C5', 'R8C5'],
  ['R5C8', 'R6C8'],
].map(([a, b]) => new WhiteDot(a, b));

return [new Shape('9x9'), ...cages, ...palindromes, ...whiteDots];
