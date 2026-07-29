// Title: Alarm Clock
// Author: Jobo
// Video: https://www.youtube.com/watch?v=v6eN2nTThwg
// Source: https://sudokupad.app/wa9fbfdl75

// Normal Sudoku and disjoint groups apply. The red closed line alternates parity.
// Each grey thermometer may have its bulb at either drawn end.
// The white dots and Xs are positive-only: unmarked adjacent pairs are unrestricted.
// The clue tables below are transcribed from the drawn line and marker entries.
const thermos = [
  ['R4C2', 'R4C3', 'R5C3', 'R5C2', 'R6C2', 'R6C3'],
  ['R4C4', 'R5C4', 'R6C4'],
  ['R4C6', 'R5C6', 'R6C6'],
  ['R4C8', 'R4C7', 'R5C7', 'R5C8', 'R6C8', 'R6C7'],
];

const redLoop = [
  'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R7C2', 'R7C3',
  'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9', 'R6C9',
  'R5C9', 'R4C9', 'R3C9', 'R3C8', 'R3C7', 'R3C6', 'R3C5',
  'R3C4', 'R3C3', 'R3C2', 'R3C1',
];

const whiteDots = [
  ['R4C5', 'R5C5'], ['R5C5', 'R6C5'], ['R3C3', 'R3C2'],
  ['R7C3', 'R7C2'], ['R7C7', 'R7C8'], ['R3C8', 'R3C7'],
];

const xs = [['R6C3', 'R6C4'], ['R6C6', 'R6C7']];

return [
  new Shape('9x9'),
  new Given('R9C9', 9),
  new DisjointSets(),
  new Modular(2, ...redLoop),
  ...thermos.map(cells => new Or([
    new Thermo(...cells),
    new Thermo(...cells.slice().reverse()),
  ])),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...xs.map(cells => new X(...cells)),
];
