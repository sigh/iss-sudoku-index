// Title: 2many arrows spoil the box
// Author: tesseralis
// Video: https://www.youtube.com/watch?v=cfFZenax0kU
// Source: https://app.crackingthecryptic.com/sudoku/43HnRgBQFg
//
// Standard 9x9 sudoku (rows, columns, 3x3 boxes). Arrow(bulb, ...arm): the
// arm digits sum to the bulb's digit. Four bulb cells carry more than one
// arrow (R3C3, R3C7, R7C7 two each; R7C3 three), each arrow independently
// summing to that one shared bulb digit.

// Arrows: [bulb, ...arm cells], from the drawn circles and arrow paths.
const arrows = [
  ['R3C3', 'R2C3', 'R2C2'],
  ['R3C7', 'R3C8', 'R2C8'],
  ['R7C7', 'R8C7', 'R8C8'],
  ['R7C5', 'R6C5', 'R5C5'],
  ['R5C7', 'R5C6', 'R5C5'],
  ['R5C3', 'R5C4', 'R5C5'],
  ['R7C3', 'R6C4', 'R5C5'],
  ['R3C7', 'R4C6', 'R5C5'],
  ['R3C3', 'R4C4', 'R5C5'],
  ['R7C7', 'R6C6', 'R5C5'],
  ['R6C8', 'R5C9', 'R4C8'],
  ['R6C2', 'R5C1', 'R4C2'],
  ['R7C3', 'R7C2', 'R8C2'],
  ['R9C6', 'R8C5', 'R9C4'],
  ['R1C4', 'R2C5', 'R1C6'],
  ['R7C3', 'R6C3', 'R5C3'],
];

return [
  new Shape('9x9'),
  new Given('R3C5', 2),
  new AntiKnight(),
  ...arrows.map(cells => new Arrow(...cells)),
];
