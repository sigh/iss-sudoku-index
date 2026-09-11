// Title: Palindrome Killer Arrow
// Author: ???
// Video: https://www.youtube.com/watch?v=yY2VQ263mFE
// Source: https://app.crackingthecryptic.com/sudoku/nqJT7rmmQL

// Rules encoded here, in full:
//  * Normal sudoku rules apply (9x9, standard 3x3 boxes).
//  * Each line is a palindrome, reading the same in both directions.
//  * Cages show their sums (killer cages: distinct digits summing to the
//    printed total).
//  * Digits on an arrow sum to the number in the circle.
// Nothing is omitted.

// Grey lines, as drawn: seven cells each, in the order the stroke runs. Each
// line takes one diagonal step (R2C2-R3C3, R7C7-R8C8), so consecutive cells
// are not always orthogonally adjacent; the palindrome reads over the cell
// sequence either way, and reversing a line describes the same constraint.
const palindromes = [
  ['R1C1', 'R2C1', 'R2C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6'],
  ['R7C4', 'R7C5', 'R7C6', 'R7C7', 'R8C8', 'R8C9', 'R9C9'],
];

// Arrows, as drawn: bulb cell first (the circle), then the shaft cells in
// order from the bulb to the arrowhead. Arrow() reads its first cell as the
// circle, so the bulb must lead.
const arrows = [
  ['R3C7', 'R2C8', 'R2C9', 'R1C9'],
  ['R7C3', 'R8C2', 'R8C1', 'R9C1'],
];

// Cages, transcribed from the drawn dashed cages and their printed corner
// totals: [total, ...cells].
const cages = [
  [18, 'R1C4', 'R1C5', 'R1C6'],
  [7, 'R2C3', 'R2C4'],
  [16, 'R4C3', 'R5C3', 'R6C3'],
  [22, 'R4C5', 'R5C5', 'R6C5'],
  [16, 'R4C7', 'R5C7', 'R6C7'],
  [13, 'R5C1', 'R5C2'],
  [9, 'R5C8', 'R5C9'],
  [13, 'R8C6', 'R8C7'],
  [13, 'R9C4', 'R9C5', 'R9C6'],
];

return [
  new Shape('9x9'),

  new Given('R6C3', 3),

  ...palindromes.map(cells => new Palindrome(...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
