// Title: Trio of Trios A
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=8Dt_fnJaQJs
// Source: https://app.crackingthecryptic.com/sudoku/rNFffthDhj

// 1-6 must appear in each row, column and box (the default 6x6 blocks of two
// rows by three columns). Digits along an arrow sum to the number in the
// circle. There are no given digits.
//
// Omitted: "If two cells in any two grids have the same letter written in them,
// those cells must contain the same digit." The letters A (R1C1), B (R2C1),
// C (R5C6) and D (R6C6) each appear once here, so the rule only ties this grid
// to the two companion grids of the trio, which are separate puzzle pages and
// are not part of this encoding.

// Arrow geometry as drawn: bulb circle first, then the shaft cells in the order
// the stroke visits them.
const arrows = [
  ['R3C2', 'R2C3', 'R1C4'],
  ['R3C3', 'R2C4', 'R1C5', 'R1C6'],
  ['R4C4', 'R5C3', 'R6C2', 'R6C1'],
  ['R6C3', 'R5C4', 'R4C5'],
];

return [
  new Shape('6x6'),
  ...arrows.map(cells => new Arrow(...cells)),
];
