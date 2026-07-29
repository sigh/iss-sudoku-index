// Title: 22
// Author: Bfranj17
// Video: https://www.youtube.com/watch?v=9uC7CXmte3U
// Source: https://sudokupad.app/fddFpq7HLn

// Normal Sudoku rules apply. Each grey arrow's arm digits sum to its circled
// cell. Each outlined cage has distinct digits summing to its displayed total,
// 22. Arrow and cage cell lists are transcribed from the drawn source data.

const arrows = [
  ['R1C1', 'R2C1', 'R3C1'],
  ['R2C2', 'R2C3', 'R2C4'],
  ['R2C2', 'R3C2', 'R4C2', 'R5C2'],
  ['R6C3', 'R5C4', 'R4C4'],
  ['R2C8', 'R2C7', 'R2C6', 'R2C5'],
  ['R1C9', 'R1C8', 'R1C7', 'R1C6'],
  ['R3C9', 'R4C9', 'R5C9', 'R6C9'],
  ['R9C9', 'R8C9', 'R7C9'],
  ['R9C9', 'R9C8', 'R9C7'],
  ['R8C2', 'R9C2', 'R9C3', 'R9C4'],
  ['R8C2', 'R7C2', 'R6C2'],
  ['R9C1', 'R8C1', 'R7C1'],
];

const cages = [
  ['R3C6', 'R3C7', 'R4C7', 'R4C6'],
  ['R3C5', 'R4C5', 'R5C5'],
  ['R5C7', 'R6C7', 'R7C7'],
  ['R5C6', 'R6C6', 'R6C5'],
  ['R7C6', 'R7C5', 'R7C4'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...cages.map(cells => new Cage(22, ...cells)),
];
