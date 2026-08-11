// Title: Theorema van Thoen
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=yT3Fqt8MQUc
// Source: https://app.crackingthecryptic.com/sudoku/3bLj4rptT3
//
// Normal sudoku rules apply (standard 3x3 boxes, drawn regions match the
// default Shape('9x9') boxes exactly).
// Cells a knight's move apart cannot hold the same digit -> AntiKnight.
// Digits along an arrow sum to the digit in its circle -> one Arrow(circle,
// ...arm) per arrow; the circled cell is always the arrow's first (path)
// cell per the drawn geometry.
// The yellow line is a palindrome (reads the same forwards/backwards) ->
// Palindrome. It shares its R3C7 endpoint with one arrow's circle -- the two
// clues legitimately overlap on that cell.

const givens = [
  ['R2C9', 7],
  ['R6C3', 6],
  ['R6C7', 2],
];

// Arrow circle + arm cells, transcribed from the drawn geometry (each arrow
// snapped to the underlay circle nearest its first waypoint).
const arrows = [
  ['R3C7', 'R3C6', 'R3C5', 'R3C4'],
  ['R3C3', 'R4C3', 'R5C3', 'R6C3'],
  ['R7C3', 'R7C4', 'R7C5', 'R7C6'],
  ['R7C7', 'R6C7', 'R5C7', 'R4C7'],
];

// Palindrome line, transcribed from the drawn geometry (a diagonal segment
// spanning R5C5..R2C8, sharing its R3C7 cell with an arrow's circle).
const palindromeLine = ['R5C5', 'R4C6', 'R3C7', 'R2C8'];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new AntiKnight(),
  ...arrows.map(cells => new Arrow(...cells)),
  new Palindrome(...palindromeLine),
];
