// Title: Arrow Clashes
// Author: Sktx
// Video: https://www.youtube.com/watch?v=Wybf7WOJGYc
// Source: https://app.crackingthecryptic.com/sudoku/L6hPftmfL7
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Digits along an arrow sum to the digit in its circle -> one Arrow(circle,
// ...arm) per arrow. Only 6 circled cells anchor the 9 drawn arrows: R3C7
// anchors three independent arrows and R7C3 anchors two; each is its own
// Arrow constraint sharing that circle cell.
//
// Arrow cells were read off the drawn geometry (wayPoints), circle cell
// first then arm cells to the arrowhead.
const arrows = [
  ['R3C1', 'R4C2', 'R5C3', 'R5C2'],
  ['R7C3', 'R6C2', 'R5C1', 'R5C2'],
  ['R1C3', 'R1C4', 'R2C5', 'R2C6'],
  ['R3C7', 'R3C6', 'R2C6'],
  ['R3C7', 'R2C8', 'R3C8'],
  ['R3C7', 'R4C8', 'R4C9', 'R5C8'],
  ['R7C9', 'R6C8', 'R6C7', 'R5C8'],
  ['R9C7', 'R8C6', 'R9C5', 'R8C5'],
  ['R7C3', 'R8C4', 'R7C5', 'R8C5'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
];
