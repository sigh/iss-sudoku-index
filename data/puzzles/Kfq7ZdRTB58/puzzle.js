// Title: Displacement
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=Kfq7ZdRTB58
// Source: https://app.crackingthecryptic.com/sudoku/3MGN9TD4p9

// Normal sudoku rules apply (9x9, standard 3x3 boxes, no givens). Digits
// along an arrow sum to the digit in that arrow's circle. Three circles
// (R2C7, R3C8, R6C4) each anchor two independent arrows sharing the same
// circle cell; the rest anchor one arrow each.
const arrows = [
  ['R2C3', 'R1C4', 'R1C5'],
  ['R3C4', 'R4C5', 'R5C5'],
  ['R2C7', 'R1C7', 'R1C6'],
  ['R2C7', 'R3C6', 'R3C5'],
  ['R3C8', 'R3C9', 'R4C9'],
  ['R3C8', 'R4C7', 'R5C7'],
  ['R4C3', 'R4C4', 'R3C3', 'R2C2'],
  ['R6C3', 'R7C2', 'R7C1'],
  ['R6C4', 'R7C3', 'R8C2'],
  ['R6C4', 'R7C5', 'R8C6'],
  ['R7C4', 'R8C3', 'R9C3'],
  ['R9C4', 'R9C5', 'R8C5'],
  ['R7C8', 'R6C9', 'R5C9'],
  ['R6C7', 'R5C6', 'R4C6'],
];
return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
];
