// Title: 2x5 Arrows
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=fRF8qGhV9LY
// Source: https://sudokupad.app/2vv3bkl623

// Normal Sudoku; each arrow arm sums to its circle. No rules are omitted.
// The three printed givens.
const givens = [new Given('R2C5', 9), new Given('R6C7', 4), new Given('R7C3', 4)];
// The ten drawn diagonal arrow shafts, circle first; each circle has two arrows.
const arrows = [
  ['R3C3', 'R2C4', 'R1C5'],
  ['R3C3', 'R4C2', 'R5C1'],
  ['R4C4', 'R5C3', 'R6C2', 'R7C1'],
  ['R4C4', 'R3C5', 'R2C6', 'R1C7'],
  ['R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'],
  ['R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'],
  ['R6C6', 'R5C7', 'R4C8', 'R3C9'],
  ['R6C6', 'R7C5', 'R8C4', 'R9C3'],
  ['R7C7', 'R8C6', 'R9C5'],
  ['R7C7', 'R6C8', 'R5C9'],
].map(cells => new Arrow(...cells));
return [new Shape('9x9'), ...givens, ...arrows];
