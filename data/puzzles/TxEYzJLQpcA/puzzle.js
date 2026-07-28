// Title: Rupees
// Author: Sotehr
// Video: https://www.youtube.com/watch?v=TxEYzJLQpcA
// Source: https://sudokupad.app/bdiaxwjnxc

// Standard Sudoku with the listed coloured lines and Kropki dots. Closed
// pairwise loops repeat their first cell; the blue region-sum loop does not.
const germanWhisper = ['R2C4', 'R3C4', 'R3C5', 'R2C6', 'R1C6', 'R1C5', 'R2C4'];
const renban = ['R4C2', 'R4C3', 'R5C3', 'R6C2', 'R6C1', 'R5C1'];
const dutchWhisper = ['R4C5', 'R4C6', 'R5C6', 'R6C5', 'R6C4', 'R5C4', 'R4C5'];
const thermo = ['R6C7', 'R5C7', 'R4C8', 'R4C9', 'R5C9', 'R6C8'];
const modulo = ['R2C7', 'R3C7', 'R3C8', 'R2C9', 'R1C9', 'R1C8', 'R2C7'];
const entropic = ['R8C6', 'R9C6', 'R9C7', 'R8C8', 'R7C8', 'R7C7', 'R8C6'];
const regionSum = ['R9C3', 'R9C2', 'R8C2', 'R7C3', 'R7C4', 'R8C4'];

// Drawn black Kropki dots have a 1:2 ratio; the drawn white dot is consecutive.
const blackDots = [
  ['R5C5', 'R5C6'],
  ['R5C2', 'R5C3'],
  ['R5C8', 'R5C9'],
  ['R2C8', 'R2C9'],
];
const whiteDots = [['R3C5', 'R4C5']];

return [
  new Shape('9x9'),
  new Given('R8C5', 4),
  new Whisper(5, ...germanWhisper),
  new Renban(...renban),
  new Whisper(4, ...dutchWhisper),
  new Thermo(...thermo),
  new Modular(3, ...modulo),
  new Entropic(...entropic),
  new RegionSumLine(...regionSum),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
