// Title: Border Thermos
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=H5BTHIevdqw
// Source: https://sudokupad.app/lrechjs7h8

// Normal Sudoku rules apply. Cells a chess king's move apart cannot contain
// the same digit. Digits along a thermometer increase from the bulb end.

// Thermometers, bulb first (the bulb is the end carrying the drawn circle),
// transcribed from the puzzle's 12 drawn thermo lines.
const thermos = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1'],
  ['R5C1', 'R5C2', 'R5C3'],
  ['R7C1', 'R7C2', 'R7C3', 'R7C4'],
  ['R9C1', 'R9C2', 'R9C3', 'R9C4'],
  ['R1C3', 'R2C3', 'R3C3', 'R4C3'],
  ['R1C9', 'R1C8', 'R1C7', 'R1C6'],
  ['R3C9', 'R3C8', 'R3C7', 'R3C6'],
  ['R9C7', 'R8C7', 'R7C7', 'R6C7'],
  ['R9C9', 'R8C9', 'R7C9', 'R6C9'],
  ['R9C5', 'R8C5', 'R7C5'],
  ['R5C9', 'R5C8', 'R5C7'],
  ['R1C5', 'R2C5', 'R3C5'],
].map(cells => new Thermo(...cells));

return [
  new Shape('9x9'),
  new Given('R3C3', 3),
  new Given('R9C8', 5),
  new AntiKing(),
  ...thermos,
];
