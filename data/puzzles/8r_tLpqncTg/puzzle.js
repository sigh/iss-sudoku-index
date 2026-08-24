// Title: Odd Tri Out
// Author: Finest
// Video: https://www.youtube.com/watch?v=8r_tLpqncTg
// Source: https://app.crackingthecryptic.com/sudoku/3P3mjRD2RQ

// Normal sudoku rules apply (default row/col/box all-different from Shape).
// Cages show their sums (killer cages: sum + distinct digits).
// Circles mark odd digits; squares mark even digits -- encoded as multi-value
// Given restrictions per the catalog (no dedicated Odd/Even class).
// Lines are palindromes, which read the same either way -- encoded as
// Palindrome over each line's cell list in drawn order (order is irrelevant
// to a palindrome's semantics). The two lines sharing cell R7C6 are each
// their own independent Palindrome constraint on their own cell list.

const cages = [
  new Cage(23, 'R1C2', 'R1C3', 'R2C2', 'R2C3', 'R3C2', 'R3C3'),
  new Cage(15, 'R6C1', 'R6C2', 'R6C3'),
  new Cage(6, 'R8C1', 'R9C1'),
  new Cage(18, 'R8C3', 'R8C4', 'R8C5', 'R8C6'),
  new Cage(25, 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'),
  new Cage(16, 'R1C5', 'R2C4', 'R2C5'),
  new Cage(12, 'R2C6', 'R2C7', 'R2C8'),
  new Cage(23, 'R4C7', 'R4C8', 'R4C9', 'R5C9'),
  new Cage(9, 'R7C5', 'R7C6'),
];

// Odd cells (grey circle underlays), from source-assets underlay geometry.
const oddCells = [
  'R1C2', 'R1C3', 'R1C6', 'R2C2', 'R2C9', 'R3C6',
  'R5C6', 'R6C2', 'R6C3', 'R8C2', 'R8C8',
];
const oddGivens = oddCells.map((cell) => new Given(cell, 1, 3, 5, 7, 9));

// Even cells (grey square underlays).
const evenCells = ['R4C1', 'R5C1', 'R7C1'];
const evenGivens = evenCells.map((cell) => new Given(cell, 2, 4, 6, 8));

// Palindrome lines, one per drawn stroke (distinct colours in the source).
const palindromes = [
  new Palindrome('R3C5', 'R4C6'),
  new Palindrome('R4C4', 'R5C3'),
  new Palindrome('R6C4', 'R7C5'),
  new Palindrome('R6C6', 'R5C7'),
  new Palindrome('R6C9', 'R7C8', 'R6C7', 'R7C6'),
  new Palindrome('R8C8', 'R7C7', 'R7C6'),
  new Palindrome('R9C6', 'R8C5', 'R8C4', 'R9C3', 'R8C2'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...oddGivens,
  ...evenGivens,
  ...palindromes,
];
