// Title: Sniped
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=a--QaCOYQ64
// Source: https://tinyurl.com/2s4jpf28
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Digits along an arrow sum to the digit in the corresponding circle ->
// one Arrow(circle, ...arm) per arrow. Circle cell is a single cell (not a
// pill), so it is not itself one of the addends.
//
// Each payload arrow entry gives its circle as `cells` and its full line
// (circle repeated as the first cell, then the arm) as `lines[0]`; the
// arrays below are those lines verbatim, so `Arrow(...line)` puts the
// circle first as required.
const arrows = [
  ['R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C9'],
  ['R9C7', 'R8C6', 'R7C5', 'R6C4', 'R5C3', 'R4C2'],
  ['R4C4', 'R3C3', 'R2C2', 'R1C1'],
  ['R5C4', 'R4C3', 'R3C2'],
  ['R6C6', 'R7C7', 'R8C8'],
  ['R7C3', 'R6C2', 'R5C1'],
  ['R7C9', 'R6C8', 'R5C7'],
  ['R4C7', 'R3C6', 'R2C5'],
  ['R3C9', 'R2C8', 'R1C7'],
];

return [
  new Shape('9x9'),
  ...arrows.map(line => new Arrow(...line)),
];
