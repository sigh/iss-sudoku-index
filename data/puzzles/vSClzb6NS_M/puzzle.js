// Title: Mirrored
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=vSClzb6NS_M
// Source: https://app.crackingthecryptic.com/qJb4N6qbdb

// Normal Sudoku rules apply. White dots join consecutive digits; black dots join
// digits in a 1:2 ratio. Each arrow circle equals the sum of its shaft digits.
// Arrow and dot coordinates are transcribed from the drawn clue geometry.
const arrows = [
  ['R6C5', 'R5C5', 'R4C5', 'R3C5'],
  ['R4C7', 'R3C8', 'R2C7', 'R1C6', 'R2C6'],
  ['R4C3', 'R3C2', 'R2C3', 'R1C4', 'R2C4'],
  ['R5C2', 'R4C1', 'R3C1', 'R2C2'],
  ['R2C8', 'R3C9', 'R4C9', 'R5C8'],
  ['R7C6', 'R6C7', 'R5C7'],
  ['R7C4', 'R6C3', 'R5C3'],
  ['R9C5', 'R8C6', 'R7C7', 'R6C8'],
  ['R9C5', 'R8C4', 'R7C3', 'R6C2'],
];
const whiteDots = [
  ['R1C5', 'R2C5'], ['R5C9', 'R6C9'], ['R5C1', 'R6C1'],
  ['R9C3', 'R9C4'], ['R9C6', 'R9C7'],
];
const blackDots = [
  ['R7C2', 'R8C2'], ['R7C5', 'R8C5'], ['R7C8', 'R8C8'],
  ['R1C9', 'R2C9'], ['R1C1', 'R2C1'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
