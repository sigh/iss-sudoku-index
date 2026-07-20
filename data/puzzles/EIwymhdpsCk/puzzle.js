// Title: Simon's Neighbourhood
// Author: Aeon
// Video: https://www.youtube.com/watch?v=EIwymhdpsCk
// Source: https://sudokupad.app/i6bchgahs2

// Red lines alternate parity. Green and orange lines are German whispers
// with minimum differences 5 and 4 respectively.
const redLines = [
  ['R7C1', 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R7C5', 'R8C5'],
  ['R6C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5'],
  ['R7C2', 'R8C2'],
];
const greenLines = [
  ['R2C1', 'R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6'],
  ['R3C3', 'R4C3', 'R5C3', 'R4C4', 'R3C5', 'R2C4', 'R1C3', 'R2C3', 'R3C3'],
];
const orangeLine = [
  'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C8', 'R5C7',
  'R6C6', 'R7C6', 'R8C6', 'R9C6', 'R9C7', 'R9C8',
];
const cage = ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C8'];
const blackDots = [
  ['R7C2', 'R7C3'],
  ['R7C1', 'R8C1'],
  ['R2C8', 'R3C8'],
];
const whiteDot = ['R1C6', 'R1C7'];

// Exactly seven distinct digits occur among all clue cells, leaving exactly
// two digit values absent from every line, dot, and cage.
const clueCells = [...new Set([
  ...redLines.flat(),
  ...greenLines.flat(),
  ...orangeLine,
  ...cage,
  ...blackDots.flat(),
  ...whiteDot,
])];
const clueDigitCount = new Var('D', 'Distinct clue digits', 1);
const alternateParity = Pair.fnToKey((a, b) => (a + b) % 2 === 1, 9);

return [
  new Shape('9x9'),
  new Given('R1C1', 4),
  clueDigitCount,
  new Given('VD', 7),
  new CountDistinct('VD', ...clueCells),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
  ...redLines.map(cells => new Pair(alternateParity, 'Alternating parity', ...cells)),
  new Whisper(4, ...orangeLine),
  new Cage(36, ...cage),
  ...blackDots.map(cells => new BlackDot(...cells)),
  new WhiteDot(...whiteDot),
];
