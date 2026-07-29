// Title: Caged Arrows 2
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=ABZVwsJX3zI
// Source: https://sudokupad.app/4rd0wbkq84

// Normal Sudoku rules apply. Arrow circles equal their arm sums. Each drawn
// no-total cage is all-different. White and black dots mean consecutive and
// 1:2-ratio digits respectively; no negative-dot rule is stated.
const arrows = [
  ['R4C3', 'R3C3', 'R2C3', 'R1C3'], ['R4C4', 'R3C4', 'R2C4'],
  ['R4C6', 'R3C7', 'R3C8'], ['R4C6', 'R4C7', 'R4C8'], ['R4C6', 'R5C7', 'R5C8'],
  ['R6C6', 'R7C6', 'R8C6'], ['R6C7', 'R7C7', 'R8C7', 'R9C7'],
  ['R6C4', 'R5C3', 'R5C2'], ['R6C4', 'R6C3', 'R6C2'], ['R6C4', 'R7C3', 'R7C2'],
];
const cages = [
  ['R1C3', 'R2C3', 'R2C4', 'R3C3', 'R3C4', 'R4C3', 'R4C4'],
  ['R6C6', 'R6C7', 'R7C6', 'R7C7', 'R8C6', 'R8C7', 'R9C7'],
  ['R3C7', 'R3C8', 'R4C6', 'R4C7', 'R4C8', 'R5C7', 'R5C8'],
  ['R5C2', 'R5C3', 'R6C2', 'R6C3', 'R6C4', 'R7C2', 'R7C3'],
];
return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...cages.map(cells => new AllDifferent(...cells)),
  new WhiteDot('R3C5', 'R4C5'), new WhiteDot('R1C7', 'R2C7'), new WhiteDot('R9C4', 'R9C5'),
  new BlackDot('R1C1', 'R1C2'), new BlackDot('R5C1', 'R6C1'),
  new BlackDot('R9C8', 'R9C9'), new BlackDot('R8C3', 'R9C3'),
];
