// Title: Houndstooth
// Author: carabet
// Video: https://www.youtube.com/watch?v=Tk92pYsKtEg
// Source: https://app.crackingthecryptic.com/pFG34P8N4t

// Normal Sudoku applies. Green lines are whispers with difference at least 5;
// purple lines are renbans; blue lines have equal sums in each box segment;
// each arrow arm sums to its circled bulb.
const whispers = [
  ['R2C5', 'R1C5', 'R1C6', 'R1C7', 'R2C7'],
  ['R7C8', 'R7C9', 'R6C9', 'R5C9', 'R5C8'],
  ['R8C5', 'R9C5', 'R9C4', 'R9C3', 'R8C3'],
  ['R3C2', 'R3C1', 'R4C1', 'R5C1', 'R5C2'],
];

const renbans = [
  ['R3C2', 'R3C3', 'R3C4', 'R3C5', 'R2C5'],
  ['R7C8', 'R7C7', 'R7C6', 'R7C5', 'R8C5'],
];

const regionSumLines = [
  ['R5C2', 'R5C3', 'R6C3', 'R7C3', 'R8C3'],
  ['R5C8', 'R5C7', 'R4C7', 'R3C7', 'R2C7'],
];

return [
  new Shape('9x9'),
  new Given('R2C1', 1), new Given('R3C9', 6), new Given('R4C4', 1),
  new Given('R6C6', 7), new Given('R8C1', 6), new Given('R8C7', 1),
  new Given('R9C9', 9),
  ...whispers.map((cells) => new Whisper(5, ...cells)),
  ...renbans.map((cells) => new Renban(...cells)),
  ...regionSumLines.map((cells) => new RegionSumLine(...cells)),
  new Arrow('R3C7', 'R3C6', 'R4C5', 'R5C4'),
  new Arrow('R7C3', 'R7C4', 'R6C5', 'R5C6'),
];
