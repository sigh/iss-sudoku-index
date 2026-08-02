// Title: Sept. 22, 2023: BWWWWWWWahaha
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=LCH-XiK3Kko
// Source: https://tinyurl.com/2p8b5eez

// Normal Sudoku with the nine diagonal givens, eight white Kropki dots, and
// twelve black Kropki dots. The rules explicitly state that dots are not negative.
const WHITES = [
  ['R6C8', 'R6C9'], ['R4C1', 'R4C2'], ['R1C6', 'R1C7'], ['R9C3', 'R9C4'],
  ['R6C4', 'R6C5'], ['R4C5', 'R4C6'], ['R5C4', 'R6C4'], ['R4C6', 'R5C6'],
];
const BLACKS = [
  ['R3C7', 'R4C7'], ['R6C3', 'R7C3'], ['R5C2', 'R6C2'], ['R4C8', 'R5C8'],
  ['R2C6', 'R3C6'], ['R7C4', 'R8C4'], ['R2C3', 'R2C4'], ['R7C8', 'R8C8'],
  ['R8C5', 'R9C5'], ['R1C5', 'R2C5'], ['R8C6', 'R8C7'], ['R2C2', 'R3C2'],
];

return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R2C2', 2), new Given('R3C3', 3),
  new Given('R4C4', 4), new Given('R5C5', 5), new Given('R6C6', 6),
  new Given('R7C7', 7), new Given('R8C8', 8), new Given('R9C9', 9),
  ...WHITES.map(([a, b]) => new WhiteDot(a, b)),
  ...BLACKS.map(([a, b]) => new BlackDot(a, b)),
];
