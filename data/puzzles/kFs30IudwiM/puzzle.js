// Title: Bent Aerial
// Author: Manus Hand
// Video: https://www.youtube.com/watch?v=kFs30IudwiM
// Source: https://app.crackingthecryptic.com/sudoku/TgLHfP3LFb

// Normal sudoku rules apply (default row/column/box all-different, from Shape).
// Digits along an arrow sum to the number in the connected circle -- Arrow, circle
// cell first, then arm cells in path order. R6C6 is the shared circle for four
// separate arrows; two of those arrows (paths R6C6-R7C7-R8C8-R9C9 and
// R6C6-R7C7-R6C8) both include R7C7, so that cell's digit is counted toward each
// arrow's own sum independently -- this is two Arrow constraints sharing a cell,
// not one merged clue.
// Yellow lines are palindromes -- Palindrome, cells in path order (direction is
// irrelevant to the constraint). The third line's cells (R5C5,R4C5,R4C6,R3C7,R2C8)
// pass through the circle cells of the R4C5 and R4C6 arrows; those cells carry an
// arrow-sum role and a palindrome-membership role at once. Nothing in the rules
// text or the drawn line style marks a split there, so it is encoded as one
// continuous 5-cell palindrome.

const arrows = [
  ['R4C4', 'R3C3', 'R2C2', 'R1C1'],
  ['R4C5', 'R3C6', 'R2C7'],
  ['R4C6', 'R3C7', 'R2C8'],
  ['R5C6', 'R4C7', 'R3C8'],
  ['R6C6', 'R5C7'],
  ['R6C6', 'R7C7', 'R8C8', 'R9C9'],
  ['R6C6', 'R7C7', 'R6C8'],
  ['R6C6', 'R7C5', 'R8C4'],
  ['R6C5', 'R7C4', 'R8C3'],
  ['R6C4', 'R7C3', 'R8C2', 'R9C1'],
  ['R5C4', 'R6C3', 'R7C2'],
];

const palindromes = [
  ['R5C2', 'R4C3', 'R3C4'],
  ['R4C2', 'R3C3', 'R2C3'],
  ['R5C5', 'R4C5', 'R4C6', 'R3C7', 'R2C8'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...palindromes.map(cells => new Palindrome(...cells)),
];
