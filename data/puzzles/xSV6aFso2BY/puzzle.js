// Title: Day & Knight
// Author: Kyle McCormick
// Video: https://www.youtube.com/watch?v=xSV6aFso2BY
// Source: https://app.crackingthecryptic.com/sudoku/dLBHQjpH7N

// Standard 9x9 sudoku (rows/columns/3x3 boxes), no givens.
// Cages: digits sum to the printed corner clue; the rules do not state
// no-repeat within a cage, so each cage is a plain Sum, not a Cage.
// Knight's move: no two cells a knight's move apart share a digit -> AntiKnight.
// White dot: consecutive digits -> WhiteDot per edge.
// Black dot: digits in a 2:1 ratio -> BlackDot per edge.

// Cage cells and sums (payload `cages`).
const cages = [
  ['R1C2', 'R2C2'],
  ['R5C1', 'R5C2', 'R5C3'],
  ['R7C1', 'R7C2', 'R7C3'],
  ['R5C7', 'R5C8', 'R5C9'],
  ['R8C8', 'R9C8'],
  ['R3C7', 'R3C8', 'R3C9'],
  ['R1C5', 'R1C6', 'R2C5', 'R2C6'],
  ['R8C4', 'R8C5', 'R9C4', 'R9C5'],
];
const cageSums = [7, 20, 21, 9, 13, 11, 15, 15];

// Black Kropki dot edges (edge-sized rounded overlay marks, black fill).
const blackDotEdges = [
  ['R2C2', 'R3C2'],
  ['R4C1', 'R4C2'],
  ['R6C3', 'R6C4'],
];

// White Kropki dot edges (edge-sized rounded overlay marks, white fill).
const whiteDotEdges = [
  ['R4C6', 'R4C7'],
  ['R6C8', 'R6C9'],
  ['R7C8', 'R8C8'],
];

return [
  new Shape('9x9'),

  ...cages.map((cells, i) => new Sum(cageSums[i], ...cells)),

  new AntiKnight(),

  ...blackDotEdges.map(([a, b]) => new BlackDot(a, b)),
  ...whiteDotEdges.map(([a, b]) => new WhiteDot(a, b)),
];
