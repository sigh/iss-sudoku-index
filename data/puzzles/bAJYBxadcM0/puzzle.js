// Title: Meaning of Life
// Author: Lepton
// Video: https://www.youtube.com/watch?v=bAJYBxadcM0
// Source: https://app.crackingthecryptic.com/mk8lr12rgt

// Standard 9x9 sudoku with its five given digits. Purple lines are Renban
// lines; white dots join consecutive digits; both drawn diagonal outside clues
// sum to 42.

const renbans = [
  ['R6C1', 'R6C2', 'R6C3', 'R7C3', 'R8C3'],
  ['R5C2', 'R4C2', 'R3C2', 'R3C3', 'R3C4', 'R3C5'],
  ['R2C5', 'R1C5', 'R1C6', 'R1C7', 'R1C8'],
  ['R3C7', 'R2C7', 'R2C8', 'R2C9', 'R1C9'],
  ['R9C5', 'R8C5', 'R7C5', 'R7C6', 'R7C7'],
  ['R4C7', 'R4C8', 'R5C8', 'R6C8'],
  ['R8C7', 'R8C8', 'R8C9', 'R9C9'],
  ['R5C4', 'R6C4', 'R6C5', 'R6C6'],
  ['R1C1', 'R2C1', 'R2C2', 'R2C3'],
];

const whiteDots = [
  ['R5C1', 'R6C1'], ['R1C4', 'R2C4'], ['R8C8', 'R8C7'],
  ['R5C8', 'R6C8'], ['R8C6', 'R9C6'], ['R5C6', 'R4C6'],
  ['R2C6', 'R2C7'], ['R9C3', 'R9C2'], ['R9C3', 'R9C4'],
  ['R4C9', 'R5C9'], ['R7C9', 'R7C8'], ['R7C8', 'R7C7'],
  ['R1C2', 'R1C3'],
];

// Paths transcribed from the two drawn diagonal outside clues.
const graph = cellGraph(9);
const geometry = graph.gridGeometry();
const littleKillers = [
  LittleKiller.fromCells(42, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(42, graph.ray('R1C9', 1, -1), geometry),
];

return [
  new Shape('9x9'),
  new Given('R2C8', 5), new Given('R4C1', 1), new Given('R5C5', 5),
  new Given('R6C9', 9), new Given('R8C2', 5),
  ...renbans.map((cells) => new Renban(...cells)),
  ...whiteDots.map((cells) => new WhiteDot(...cells)),
  ...littleKillers,
];
