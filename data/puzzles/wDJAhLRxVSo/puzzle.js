// Title: Tilted Squares
// Author: Simply Spicy
// Video: https://www.youtube.com/watch?v=wDJAhLRxVSo
// Source: https://sudokupad.app/qxb9u5g20y

// Normal sudoku with killer cages, German whispers, renbans, Kropki dots,
// X marks, and grey lines whose cells are all one parity.

const ODD = [1, 3, 5, 7, 9];
const EVEN = [2, 4, 6, 8];

function parityLine(cells) {
  return new Or([
    new And(cells.map(cell => new Given(cell, ...ODD))),
    new And(cells.map(cell => new Given(cell, ...EVEN))),
  ]);
}

const whispers = [
  ['R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R2C5', 'R3C6', 'R4C7', 'R5C8'],
  ['R5C2', 'R6C3'],
  ['R7C4', 'R8C5'],
];

const parityLines = [
  ['R8C3', 'R7C2', 'R7C1'],
  ['R2C7', 'R3C8', 'R3C9'],
  ['R5C4', 'R6C5', 'R5C6', 'R4C5'],
];

const renbans = [
  ['R5C2', 'R4C3', 'R3C4', 'R2C5'],
  ['R8C5', 'R7C6', 'R6C7', 'R5C8'],
];

const blackDots = [
  ['R8C3', 'R8C4'],
  ['R7C9', 'R8C9'],
];

const xMarks = [
  ['R8C5', 'R8C6'],
  ['R2C1', 'R3C1'],
  ['R4C8', 'R5C8'],
];

return [
  new Shape('9x9'),

  new Cage(29, 'R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2', 'R8C3'),
  new Cage(21, 'R2C1', 'R2C2', 'R3C1', 'R3C2'),

  ...whispers.map(cells => new Whisper(...cells)),
  ...parityLines.map(parityLine),
  ...renbans.map(cells => new Renban(...cells)),

  new WhiteDot('R9C1', 'R9C2'),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...xMarks.map(cells => new X(...cells)),
];
