// Title: Jan 12, 2022: Arrow Quads
// Author: clover!
// Video: https://www.youtube.com/watch?v=SD7p63H_NpA
// Source: https://tinyurl.com/4sd2rth5

// Digits along an arrow must sum to the value in the attached circle ->
// one Arrow(bulb, ...arm) per arrow (bulb value = sum of arm cells).
// Digits in a white circle must appear somewhere in the four surrounding
// cells, with a doubled digit required to appear at least twice -> one
// Quad(topLeftCell, ...values) per quadruple; the raw payload lists each
// digit twice, matching Quad's non-strict RequiredValues semantics exactly.

const givens = [
  ['R2C2', 5], ['R2C5', 6], ['R2C8', 7],
  ['R5C4', 6], ['R5C6', 8],
  ['R8C2', 9], ['R8C8', 4],
];

const arrows = [
  ['R2C2', 'R3C3', 'R4C4'],
  ['R2C5', 'R3C5', 'R4C5'],
  ['R2C8', 'R3C7', 'R4C6'],
  ['R8C8', 'R7C7', 'R6C6'],
  ['R8C2', 'R7C3', 'R6C4'],
  ['R5C4', 'R5C3', 'R5C2'],
  ['R5C6', 'R5C7', 'R5C8'],
  ['R3C8', 'R3C9', 'R2C9'],
  ['R2C3', 'R1C3', 'R1C2'],
  ['R7C2', 'R7C1', 'R8C1'],
  ['R8C7', 'R9C7', 'R9C8'],
];

const quads = [
  ['R3C3', 1, 1],
  ['R3C6', 5, 5],
  ['R6C6', 2, 2],
  ['R6C3', 9, 9],
  ['R8C3', 7, 7],
  ['R1C6', 9, 9],
  ['R6C1', 8, 8],
  ['R3C8', 8, 8],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...quads.map(([topLeftCell, a, b]) => new Quad(topLeftCell, a, b)),
];
