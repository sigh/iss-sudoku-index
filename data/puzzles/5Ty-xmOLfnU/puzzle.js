// Title: Are Circles and Squares Pals?
// Author: PDN
// Video: https://www.youtube.com/watch?v=5Ty-xmOLfnU
// Source: https://app.crackingthecryptic.com/sudoku/tJ2TgrMRht

// Normal sudoku rules apply. The grey line is a palindrome. There are no
// repeated digits in circles, nor in squares (two disjoint 9-cell sets, not
// regions, so each is encoded as an AllDifferent over its cell list). Cages
// show their sums (killer convention: sum given, digits inside don't repeat).

const palindromeLine = [
  'R7C1', 'R8C2', 'R9C3', 'R8C4', 'R7C5', 'R7C6',
  'R6C7', 'R6C8', 'R7C9', 'R8C8', 'R9C7', 'R9C6',
];

// Drawn as small blue circle icons on a blue cell background.
const circleCells = [
  'R1C3', 'R2C2', 'R3C1', 'R4C6', 'R5C5', 'R6C4', 'R7C9', 'R8C8', 'R9C7',
];

// Drawn as small square icons on a gold cell background.
const squareCells = [
  'R1C7', 'R2C8', 'R3C9', 'R4C4', 'R4C5', 'R5C4', 'R7C1', 'R8C2', 'R9C3',
];

const cages = [
  [11, 'R1C4', 'R1C5'],
  [13, 'R3C2', 'R3C3'],
  [16, 'R5C3', 'R6C3'],
  [17, 'R5C6', 'R6C5', 'R6C6'],
  [6, 'R8C1', 'R8C2'],
  [15, 'R9C1', 'R9C2'],
  [5, 'R8C3', 'R9C3'],
  [7, 'R8C4', 'R9C4'],
  [9, 'R2C7', 'R3C7', 'R3C8'],
];

return [
  new Shape('9x9'),
  new Palindrome(...palindromeLine),
  new AllDifferent(...circleCells),
  new AllDifferent(...squareCells),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
