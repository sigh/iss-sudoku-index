// Title: Defrag
// Author: mormagli
// Video: https://www.youtube.com/watch?v=fMXKskYxuQw
// Source: https://sudokupad.app/62jG8GMhp7

// Normal Sudoku rules apply. Each purple line is a non-repeating consecutive set;
// black dots join adjacent cells whose digits have a 2:1 ratio.
// Purple line cells are transcribed from the drawn purple paths.
const purpleLines = [
  ['R3C1', 'R2C1', 'R2C2'], ['R4C3', 'R3C3', 'R3C4'],
  ['R3C2', 'R4C2', 'R4C1'], ['R2C3', 'R1C3', 'R1C4'],
  ['R1C5', 'R1C6', 'R2C6'], ['R2C4', 'R2C5', 'R3C5'],
  ['R5C1', 'R6C1', 'R6C2'], ['R5C2', 'R5C3', 'R6C3'],
  ['R4C5', 'R4C4', 'R5C4'], ['R5C5', 'R6C5', 'R6C4'],
  ['R7C4', 'R7C3', 'R8C3'], ['R4C7', 'R3C7', 'R3C8'],
  ['R2C7', 'R1C7', 'R1C8'], ['R7C2', 'R7C1', 'R8C1'],
  ['R2C8', 'R2C9', 'R1C9'], ['R8C2', 'R9C2', 'R9C1'],
  ['R5C6', 'R5C7', 'R6C7'], ['R9C8', 'R9C9', 'R8C9'],
  ['R8C7', 'R8C8', 'R7C8'], ['R7C5', 'R8C5', 'R8C6'],
];

// Black-dot edges are transcribed from the two black circular marks.
const blackDots = [['R1C1', 'R1C2'], ['R3C6', 'R4C6']];

return [
  new Shape('9x9'),
  ...purpleLines.map(cells => new Renban(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
