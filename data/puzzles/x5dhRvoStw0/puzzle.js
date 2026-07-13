// Title: Peer Pressure
// Author: Cane_Puzzles
// Video: https://www.youtube.com/watch?v=x5dhRvoStw0
// Source: https://sudokupad.app/rwx8a9tkdt

// Normal sudoku rules apply. Cells separated by a single knight's move (in
// chess) cannot contain the same digit. Along a thermometer digits must
// increase from the bulb end. Each purple line contains a set of
// non-repeating, consecutive digits in any order (Renban).

// Thermometers (bulb first, strictly increasing).
const thermos = [
  ['R3C3', 'R3C4', 'R4C4'],
  ['R6C6', 'R5C6', 'R6C7', 'R7C8'],
  ['R2C8', 'R2C9'],
];

// Purple lines: non-repeating consecutive digits, any order (Renban).
const renbans = [
  ['R2C7', 'R2C6', 'R3C5', 'R2C4', 'R1C5', 'R1C6'],
  ['R6C9', 'R5C9', 'R4C9', 'R3C9', 'R4C8', 'R4C7'],
  ['R8C5', 'R7C6', 'R6C7'],
  ['R2C3', 'R3C4'],
  ['R5C3', 'R5C2'],
  ['R7C3', 'R7C4'],
  ['R9C5', 'R8C6'],
  ['R5C4', 'R5C5', 'R4C6'],
  ['R2C1', 'R1C1'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...thermos.map(cells => new Thermo(...cells)),
  ...renbans.map(cells => new Renban(...cells)),
];
