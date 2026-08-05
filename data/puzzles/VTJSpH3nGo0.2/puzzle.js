// Title: November 12, 2022: Quivering
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=VTJSpH3nGo0
// Source: https://tinyurl.com/uhdws8mv

// Normal 9x9 Sudoku. Dashed cages have distinct digits summing to their totals.
// On each arrow, its shaft digits sum to the circled first cell.
// Cage cells and totals are transcribed from the drawn dashed cages.
const cages = [
  [6, 'R9C7', 'R9C8', 'R9C9'], [10, 'R8C4', 'R8C5', 'R8C6'],
  [14, 'R7C1', 'R7C2', 'R7C3'], [8, 'R3C7', 'R3C8', 'R3C9'],
  [12, 'R2C4', 'R2C5', 'R2C6'], [16, 'R1C1', 'R1C2', 'R1C3'],
  [18, 'R6C9', 'R7C9', 'R8C9'], [18, 'R2C1', 'R3C1', 'R4C1'],
  [18, 'R3C4', 'R4C4', 'R5C4'], [18, 'R5C6', 'R6C6', 'R7C6'],
  [12, 'R6C8', 'R7C8', 'R8C8'], [14, 'R2C2', 'R3C2', 'R4C2'],
];

// Each ordered path begins at its drawn circled cell, followed by its shaft.
const arrows = [
  ['R1C3', 'R1C2', 'R1C1'], ['R4C1', 'R3C1', 'R2C1'],
  ['R4C2', 'R3C2', 'R2C2'], ['R2C6', 'R2C5', 'R2C4'],
  ['R5C4', 'R4C4', 'R3C4'], ['R7C6', 'R6C6', 'R5C6'],
  ['R3C9', 'R3C8', 'R3C7'], ['R8C8', 'R7C8', 'R6C8'],
  ['R8C9', 'R7C9', 'R6C9'], ['R9C9', 'R9C8', 'R9C7'],
  ['R8C6', 'R8C5', 'R8C4'], ['R7C3', 'R7C2', 'R7C1'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
];
