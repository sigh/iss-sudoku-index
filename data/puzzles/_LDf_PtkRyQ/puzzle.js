// Title: It's a SET up!
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=_LDf_PtkRyQ
// Source: https://app.crackingthecryptic.com/sudoku/mD6BhP3PdT

// Normal sudoku rules apply (default rows/cols/boxes, no givens). Digits in
// killer cages cannot repeat and sum to the value given in the top left
// corner of the cage -> Cage(sum, ...cells). Digits along an arrow sum to
// the value of the number in the circle -> one Arrow(bulb, ...arm) per
// arrow, the circled cell listed first.

// Cage cells and totals transcribed from the drawn `cages` array.
const cages = [
  [16, 'R1C2', 'R2C1', 'R2C2'],
  [14, 'R3C2', 'R3C3', 'R4C3'],
  [15, 'R4C2', 'R5C2', 'R6C2'],
  [14, 'R7C2', 'R7C3', 'R6C3'],
  [21, 'R8C2', 'R9C2', 'R8C1'],
  [12, 'R9C3', 'R9C4', 'R9C5', 'R9C6'],
  [15, 'R6C5', 'R7C5', 'R8C5'],
  [12, 'R8C7', 'R7C7', 'R7C8'],
  [15, 'R9C8', 'R8C8', 'R8C9'],
  [17, 'R4C9', 'R5C9', 'R6C9'],
  [13, 'R4C8', 'R5C8', 'R6C8'],
  [12, 'R2C7', 'R3C7', 'R3C8'],
  [19, 'R1C8', 'R2C8', 'R2C9'],
  [14, 'R4C4', 'R5C4', 'R6C4'],
  [10, 'R5C5', 'R5C6', 'R5C7'],
  [17, 'R2C5', 'R3C5', 'R4C5'],
  [26, 'R1C3', 'R1C4', 'R1C5', 'R1C6'],
];

// Arrow cells were read off the drawn geometry: each arrow's circle overlay
// sits on the arrow's own first path cell (the bulb), followed by the
// remaining cells along the drawn line.
const arrows = [
  ['R3C3', 'R2C4', 'R1C4'],
  ['R3C6', 'R2C5', 'R1C5'],
  ['R3C8', 'R4C8', 'R4C9'],
  ['R8C9', 'R7C9', 'R7C8'],
  ['R4C6', 'R5C7', 'R5C8'],
  ['R6C6', 'R5C5', 'R5C4'],
  ['R5C2', 'R5C3', 'R5C4'],
  ['R7C3', 'R8C4', 'R9C4'],
  ['R7C6', 'R8C5', 'R9C5'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
];
