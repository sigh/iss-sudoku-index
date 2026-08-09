// Title: Domino Pals
// Author: Rdndnt
// Video: https://www.youtube.com/watch?v=mDPb1Kq9k00
// Source: https://app.crackingthecryptic.com/sudoku/Mm6RRrPPN9

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Orange lines are palindromes. Domino edge marks: white dots join
// consecutive digits, black dots join digits in a 1:2 ratio, X marks join
// digits summing to 10, V marks join digits summing to 5. Not all dots, X's
// or V's are given, so an unmarked adjacent pair carries no constraint.

const palindromes = [
  ['R2C4', 'R3C4', 'R4C5', 'R4C6'],
  ['R2C7', 'R3C7', 'R4C8', 'R4C9'],
  ['R9C7', 'R8C7', 'R7C6', 'R7C5'],
  ['R9C4', 'R8C4', 'R7C3', 'R7C2'],
];

const whiteDots = [
  ['R1C3', 'R1C4'],
  ['R1C5', 'R1C6'],
  ['R1C7', 'R2C7'],
  ['R2C9', 'R3C9'],
  ['R2C6', 'R3C6'],
  ['R5C6', 'R5C7'],
  ['R9C8', 'R9C9'],
  ['R9C5', 'R9C6'],
  ['R9C3', 'R9C4'],
  ['R8C1', 'R9C1'],
  ['R7C3', 'R7C4'],
  ['R5C1', 'R5C2'],
];

const blackDots = [
  ['R3C1', 'R4C1'],
  ['R7C1', 'R7C2'],
];

const xMarks = [
  ['R5C4', 'R6C4'],
  ['R5C7', 'R6C7'],
];

const vMarks = [
  ['R7C8', 'R7C9'],
  ['R4C2', 'R4C3'],
];

return [
  new Shape('9x9'),
  ...palindromes.map((cells) => new Palindrome(...cells)),
  ...whiteDots.map((cells) => new WhiteDot(...cells)),
  ...blackDots.map((cells) => new BlackDot(...cells)),
  ...xMarks.map((cells) => new X(...cells)),
  ...vMarks.map((cells) => new V(...cells)),
];
