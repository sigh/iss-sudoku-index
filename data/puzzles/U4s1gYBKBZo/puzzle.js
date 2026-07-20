// Title: Singles and Doubles
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=U4s1gYBKBZo
// Source: https://sudokupad.app/54q5oydbbj

// The five circles hold one-digit arrow totals. The four ovals hold
// two-digit totals, with their digits read from left to right.
const circleArrows = [
  ['R5C4', 'R5C5', 'R6C5', 'R6C4'],
  ['R3C6', 'R2C5', 'R2C4', 'R2C3', 'R3C2'],
  ['R6C2', 'R5C1', 'R6C1', 'R7C1', 'R8C2'],
  ['R7C7', 'R8C8', 'R9C9'],
  ['R5C7', 'R5C8', 'R4C9'],
];

const pillArrows = [
  ['R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6'],
  ['R3C4', 'R3C5', 'R3C3', 'R4C3', 'R5C3', 'R6C3'],
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C6'],
  ['R7C2', 'R7C3', 'R7C4', 'R7C5'],
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  ...circleArrows.map(cells => new Arrow(...cells)),
  ...pillArrows.map(cells => new PillArrow(2, ...cells)),
];
