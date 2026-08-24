// Title: Federation Starship vs Romulan Bird of Prey
// Author: Arun Iyer
// Video: https://www.youtube.com/watch?v=yQkaywUa4l4
// Source: https://app.crackingthecryptic.com/sudoku/J4DPNLd6tT
//
// Normal sudoku rules apply (standard rows/cols/3x3 boxes; payload `regions`
// are the nine ordinary boxes). Cages sum to the corner clue and forbid
// repeats within the cage. Grey circles restrict a cell to odd digits
// (no dedicated Odd/Even class in this solver build, so a multi-value
// Given covers it). The grey lines are palindromes: the digit string along
// each line reads the same forwards and backwards; a 2-cell line reduces to
// "these two cells hold equal digits" and the rules explicitly allow that
// repeat.
//
// The payload's `lines` array holds 7 entries, all the same grey; one has no
// waypoints and draws nothing (omitted). The remaining six share no cells
// with each other, so per the payload's own structure they are six separate
// palindrome lines, not fragments of one path.
// Line A and Line F both include R6C6 -- a cell in two different lines.

const cages = [
  [13, 'R1C1', 'R1C2'],
  [13, 'R2C1', 'R2C2', 'R2C3', 'R3C2'],
  [18, 'R1C4', 'R1C5', 'R2C4', 'R2C5', 'R3C4'],
  [12, 'R4C1', 'R5C1', 'R5C2'],
  [21, 'R4C2', 'R4C3', 'R5C3', 'R5C4'],
  [17, 'R3C5', 'R4C4', 'R4C5', 'R5C5'],
  [13, 'R1C7', 'R1C8', 'R1C9'],
  [9, 'R2C9', 'R3C9'],
  [10, 'R4C8', 'R4C9'],
  [13, 'R7C1', 'R8C1', 'R9C1'],
  [9, 'R9C2', 'R9C3'],
  [8, 'R8C4', 'R9C4'],
];

const palindromeLines = [
  // Line A
  ['R9C6', 'R9C5', 'R8C5', 'R7C5', 'R6C6', 'R5C7', 'R5C8', 'R5C9', 'R6C9'],
  // Line B
  ['R8C6', 'R9C7'],
  // Line C
  ['R7C6', 'R8C7'],
  // Line D
  ['R6C7', 'R7C8'],
  // Line E
  ['R6C8', 'R7C9'],
  // Line F
  ['R7C7', 'R6C6'],
];

const oddCircles = ['R1C4', 'R4C1'];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...palindromeLines.map((cells) => new Palindrome(...cells)),
  ...oddCircles.map((cell) => new Given(cell, 1, 3, 5, 7, 9)),
];
