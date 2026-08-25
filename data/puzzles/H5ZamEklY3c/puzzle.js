// Title: Even Knights Fear Arrows
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=H5ZamEklY3c
// Source: https://app.crackingthecryptic.com/webapp/mnNrF32pMg
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Identical digits cannot be a knight's move apart -> AntiKnight.
// Digits along an arrow sum to the digit in the corresponding circle ->
// one Arrow(circle, ...arm) per arrow. Two circles each anchor two
// independent arrows; each is encoded as its own Arrow constraint.
// A cell with a blue square can only hold an even digit -> Given with the
// even candidates for each such cell.
//
// Arrow cells were read off the drawn geometry: each arrow is a straight
// line starting at the edge of a circled cell and running through the
// remaining cells drawn along that line.
const arrows = [
  ['R2C5', 'R3C4', 'R4C3'],
  ['R2C5', 'R3C6', 'R4C7'],
  ['R3C2', 'R4C1'],
  ['R3C8', 'R4C9'],
  ['R5C2', 'R5C3', 'R5C4'],
  ['R8C5', 'R7C6', 'R6C7'],
  ['R5C7', 'R5C8', 'R5C9'],
  ['R8C5', 'R7C4', 'R6C3'],
];

// Blue-square cells, restricted to even digits.
const evenCells = [
  'R4C5', 'R5C4', 'R5C6', 'R6C5', 'R8C2', 'R9C3', 'R9C4',
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...arrows.map(cells => new Arrow(...cells)),
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
];
