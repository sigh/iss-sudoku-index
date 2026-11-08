// Title: Consecutive Forks
// Author: Jorava
// Video: https://www.youtube.com/watch?v=YWg19oiRqXA
// Source: https://sudokupad.app/zc0h9064ri

// Normal Sudoku, increasing grey thermometers, and non-repeating consecutive
// sets on each connected purple renban figure. No rules are omitted.
// Givens transcribed from the printed grid.
const givens = [['R2C2', 1], ['R5C6', 1], ['R6C1', 9], ['R6C8', 7], ['R7C9', 6], ['R8C1', 8], ['R8C4', 4], ['R9C6', 8]];

// Grey fork paths, listed from the three drawn bulbs to each tip.
const thermos = [['R7C3', 'R6C3', 'R5C3', 'R4C2', 'R3C2'], ['R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3'], ['R7C3', 'R6C3', 'R5C3', 'R4C4', 'R3C4'], ['R6C7', 'R5C7', 'R4C7', 'R3C7', 'R2C7'], ['R6C7', 'R5C7', 'R4C7', 'R3C8', 'R2C8'], ['R6C7', 'R5C7', 'R4C7', 'R3C6', 'R2C6'], ['R9C5', 'R8C5', 'R7C5', 'R6C5'], ['R9C5', 'R8C5', 'R7C6', 'R6C6'], ['R9C5', 'R8C5', 'R7C4', 'R6C4']];

// Connected purple figures: their strokes join at interior junction cells.
// Each figure is one renban set, regardless of its branching shape.
const renbans = [['R5C7', 'R4C7', 'R3C8', 'R3C6', 'R2C6'], ['R6C3', 'R5C3', 'R4C4', 'R3C4', 'R4C2', 'R4C3', 'R3C3'], ['R6C5', 'R7C5', 'R8C5', 'R9C5', 'R6C6', 'R7C6', 'R7C4', 'R6C4']];

return [
  new Shape("9x9"),
  ...givens.map(([cell, digit]) => new Given(cell, digit)),
  ...thermos.map(cells => new Thermo(...cells)),
  ...renbans.map(cells => new Renban(...cells)),
];
