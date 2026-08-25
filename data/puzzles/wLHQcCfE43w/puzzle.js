// Title: Down the Drain
// Author: Bram Cohen
// Video: https://www.youtube.com/watch?v=wLHQcCfE43w
// Source: https://app.crackingthecryptic.com/webapp/btt49g7RpG
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Digits along an arrow sum to the digit in the corresponding circle ->
// one Arrow(circle, ...arm) per arrow.
//
// Arrow cells were read off the drawn geometry: each arrow starts at a
// circled bulb cell and its arm bends through the remaining cells drawn
// along that arrow's path. No two arrows share a cell.
const arrows = [
  ['R1C6', 'R1C7', 'R2C6', 'R3C7'],
  ['R2C8', 'R2C7', 'R3C8', 'R4C8', 'R5C9'],
  ['R6C7', 'R6C8', 'R6C9', 'R7C9', 'R8C9'],
  ['R4C7', 'R4C6', 'R4C5'],
  ['R3C2', 'R2C3', 'R1C3', 'R1C4', 'R1C5'],
  ['R3C3', 'R3C4', 'R4C4'],
  ['R4C3', 'R5C2', 'R4C1', 'R3C1', 'R2C2'],
  ['R6C3', 'R6C4', 'R5C5'],
  ['R7C6', 'R6C5'],
  ['R7C1', 'R6C1', 'R7C2', 'R7C3'],
  ['R8C5', 'R8C4', 'R9C4', 'R9C3', 'R9C2'],
  ['R9C9', 'R8C8', 'R7C7', 'R8C6', 'R9C6'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
];
