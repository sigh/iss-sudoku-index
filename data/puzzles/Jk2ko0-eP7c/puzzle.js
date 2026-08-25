// Title: Mounted Archery #2
// Author: Kyle McCormick
// Video: https://www.youtube.com/watch?v=Jk2ko0-eP7c
// Source: https://app.crackingthecryptic.com/webapp/DP4rLDDQGB
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// No two cells which are a chess knight's move apart may contain the same
// digit -> AntiKnight.
// Circled digits equal the sum of all digits on their attached arrow, and
// digits may repeat on arrows -> one Arrow(circle, ...arm) per arrow.
//
// Arrow cells were read off the drawn geometry: each arrow is a line
// starting at the edge of a circled cell (confirmed against the payload's
// circle underlays) and running through the remaining cells drawn along
// that line.
const arrows = [
  ['R1C2', 'R2C2', 'R2C1'],
  ['R3C7', 'R3C8', 'R2C8', 'R2C7'],
  ['R3C5', 'R4C4', 'R4C3', 'R5C2', 'R6C2'],
  ['R5C6', 'R6C6', 'R6C7', 'R7C7', 'R8C7'],
  ['R6C9', 'R5C8', 'R4C9', 'R3C9'],
  ['R7C5', 'R8C5', 'R8C4', 'R7C3', 'R7C2'],
  ['R9C9', 'R9C8', 'R9C7', 'R9C6'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...arrows.map(cells => new Arrow(...cells)),
];
