// Title: Ascension
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=-7OR_IK4Th8
// Source: https://sudokupad.app/4umjglf7z5
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Identical digits cannot be a knight's move apart -> AntiKnight.
// Digits along an arrow sum to the digit in the corresponding circle ->
// one Arrow(circle, ...arm) per arrow. Three circles each anchor two
// independent arrows; each is encoded as its own Arrow constraint.
//
// Arrow cells were read off the drawn geometry: each arrow is a straight
// line starting at the edge of a circled cell and running through the
// remaining cells drawn along that line.
const arrows = [
  ['R7C3', 'R6C2', 'R5C1'],
  ['R4C3', 'R4C2', 'R4C1'],
  ['R4C3', 'R5C4', 'R6C5'],
  ['R4C6', 'R5C6', 'R6C6'],
  ['R4C6', 'R3C5', 'R2C4'],
  ['R1C6', 'R1C5', 'R1C4'],
  ['R1C6', 'R2C7', 'R3C8'],
  ['R1C9', 'R2C9', 'R3C9'],
  ['R7C8', 'R8C8', 'R9C8'],
  ['R9C4', 'R8C4', 'R8C5'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...arrows.map(cells => new Arrow(...cells)),
];
