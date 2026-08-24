// Title: Embraced
// Author: Henk Nicolai
// Video: https://www.youtube.com/watch?v=_ROvoT2eh0Y
// Source: https://app.crackingthecryptic.com/sudoku/LPDbtGtD2L

// Normal sudoku rules apply (standard 3x3 boxes, per the payload's own
// `regions`). Digits along an arrow must sum to the digit in its circle;
// digits may repeat along an arrow. Cells a knight's move apart cannot
// contain the same digit.
//
// Each arrow is drawn as a "pinwheel": its circle and 3 shaft cells are the
// 4 orthogonal neighbours of one uninvolved central cell, corroborated by a
// same-cell underlay circle at each bulb. The diamond shape is purely
// visual; each is encoded as a plain Arrow(circle, ...shaft cells).
const arrows = [
  new Arrow('R4C3', 'R3C2', 'R2C3', 'R3C4'),
  new Arrow('R2C4', 'R3C5', 'R4C4', 'R3C3'),
  new Arrow('R3C7', 'R4C8', 'R5C7', 'R4C6'),
  new Arrow('R5C6', 'R4C5', 'R3C6', 'R4C7'),
];

return [
  new Shape('9x9'),
  new Given('R2C9', 6),
  new Given('R4C1', 5),
  new Given('R9C4', 3),
  ...arrows,
  new AntiKnight(),
];
