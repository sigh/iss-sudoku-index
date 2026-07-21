// Title: Wink to the Left
// Author: Ivayla Gergova
// Video: https://www.youtube.com/watch?v=ulE5oGZhuCI
// Source: https://sudokupad.app/oesv536w7e

// Normal Sudoku rules apply. Green lines are German whispers, pink lines are
// renbans, and the black and white circles are standard Kropki dots.

const whispers = [
  ['R3C2', 'R4C1', 'R5C1', 'R6C1', 'R7C2'],
  ['R3C3', 'R4C4', 'R5C4', 'R6C4', 'R7C3'],
  ['R3C7', 'R4C6', 'R5C6', 'R6C6', 'R7C7'],
  ['R3C8', 'R4C9', 'R5C9', 'R6C9', 'R7C8'],
  ['R1C5', 'R2C5', 'R3C5'],
].map(cells => new Whisper(5, ...cells));

const renbans = [
  ['R3C2', 'R3C3'],
  ['R1C2', 'R2C1', 'R3C1'],
  ['R1C8', 'R2C9', 'R3C9'],
  ['R9C4', 'R9C5', 'R9C6'],
].map(cells => new Renban(...cells));

const blackDots = [
  ['R3C2', 'R3C3'],
  ['R7C2', 'R7C3'],
  ['R3C7', 'R3C8'],
  ['R7C7', 'R7C8'],
  ['R8C1', 'R9C1'],
  ['R8C9', 'R9C9'],
].map(cells => new BlackDot(...cells));

const whiteDots = [
  ['R8C4', 'R9C4'],
  ['R8C6', 'R9C6'],
  ['R8C2', 'R9C2'],
  ['R8C8', 'R9C8'],
].map(cells => new WhiteDot(...cells));

return [
  new Shape('9x9'),
  ...whispers,
  ...renbans,
  ...blackDots,
  ...whiteDots,
];
