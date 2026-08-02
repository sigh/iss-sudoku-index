// Title: Radical Rainbow
// Author: Jobo
// Video: https://www.youtube.com/watch?v=DOcp_Kta4d0
// Source: https://app.crackingthecryptic.com/sudoku/tGd8nT7R6P

// Normal Sudoku. Each white square is the square root of the top-to-bottom
// two-digit number in its matching thick-bordered cage; the six roots differ.
// The red, orange, green, purple, blue, and grey paths respectively carry a
// parity, entropic, German whisper, renban, region-sum, and unoriented thermo
// rule. The coloured paths and their paired cages are transcribed from the art.
const rootTriples = [
  ['R2C1', 'R2C3', 'R3C3'],
  ['R3C4', 'R3C6', 'R4C6'],
  ['R4C7', 'R4C9', 'R5C9'],
  ['R6C1', 'R6C3', 'R7C3'],
  ['R7C4', 'R7C6', 'R8C6'],
  ['R8C7', 'R8C9', 'R9C9'],
];

const squareRoots = [
  [4, 1, 6], [5, 2, 5], [6, 3, 6], [7, 4, 9], [8, 6, 4], [9, 8, 1],
];

function squareRootClue([root, tens, ones]) {
  return new Or(squareRoots.map(([r, t, o]) => new And([
    new Given(root, r), new Given(tens, t), new Given(ones, o),
  ])));
}

const red = ['R2C1', 'R3C2', 'R2C2', 'R1C2', 'R1C3'];
const orange = ['R3C4', 'R4C5', 'R3C5', 'R2C5', 'R2C6'];
const green = ['R4C7', 'R5C8', 'R4C8', 'R3C8', 'R3C9'];
const purple = ['R6C1', 'R7C2', 'R6C2', 'R5C2', 'R5C3'];
const blue = ['R7C4', 'R8C5', 'R7C5', 'R6C5', 'R6C6'];
const grey = ['R8C7', 'R9C8', 'R8C8', 'R7C8', 'R7C9'];

return [
  new Shape('9x9'),
  ...rootTriples.map(squareRootClue),
  new AllDifferent(...rootTriples.map(([root]) => root)),
  new Modular(2, ...red),
  new Entropic(...orange),
  new Whisper(5, ...green),
  new Renban(...purple),
  new RegionSumLine(...blue),
  new Or([new Thermo(...grey), new Thermo(...grey.slice().reverse())]),
];
