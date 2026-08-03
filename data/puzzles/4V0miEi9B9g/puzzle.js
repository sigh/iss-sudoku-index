// Title: 789
// Author: Sayori
// Video: https://www.youtube.com/watch?v=4V0miEi9B9g
// Source: https://app.crackingthecryptic.com/sudoku/fpNR4n8FN8

// Normal sudoku rules (rows, columns, boxes). Digits cannot repeat along
// either marked diagonal. Digits cannot repeat inside any cage; six cages
// show a fixed total and one (R9C2,R9C3) is drawn "<12" -- its total is
// bounded below 12 rather than fixed. Each quadruple circle lists one or
// more digits, every one of which must appear somewhere in its 2x2 block.

// Killer cages, transcribed from the drawn cage outlines and totals.
const cages = [
  [22, 'R7C2', 'R8C1', 'R8C2'],
  [22, 'R1C8', 'R2C7', 'R2C8'],
  [13, 'R5C3', 'R6C3'],
  [13, 'R7C4', 'R7C5'],
  [10, 'R8C5', 'R8C6'],
  [15, 'R4C7', 'R5C6', 'R5C7'],
];

// The R9C2/R9C3 cage is drawn with the total "<12" instead of a number: its
// two digits must be distinct (cage rule) and sum to less than 12.
const lessThan12Cage = new Pair(
  Pair.fnToKey((a, b) => a !== b && a + b < 12, 9),
  'cage distinct, sum < 12', 'R9C2', 'R9C3');

// Quadruple circles: an unlabelled corner circle plus small digit-text
// overlays next to it (payload's split-text quad pattern). Each listed
// digit must appear in the circle's 2x2 block; the three-digit circles are
// the "789" of the title.
const quads = [
  ['R2C1', 7, 8, 9],
  ['R5C4', 7, 8, 9],
  ['R8C7', 7, 8, 9],
  ['R6C3', 5, 6],
  ['R8C3', 3, 4],
  ['R4C2', 1],
  ['R1C3', 6],
  ['R6C1', 4],
  ['R2C6', 2],
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
  lessThan12Cage,
  ...quads.map(([topLeft, ...values]) => new Quad(topLeft, ...values)),
];
