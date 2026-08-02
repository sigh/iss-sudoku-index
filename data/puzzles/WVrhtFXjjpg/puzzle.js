// Title: Skiing through the fog
// Author: ElChiglia
// Video: https://www.youtube.com/watch?v=WVrhtFXjjpg
// Source: https://sudokupad.app/29nTttfqqt

// Normal Sudoku. The seven drawn gates are Between lines; white and black dots
// are consecutive and 1:2-ratio pairs, and X marks sum to 10. The solver-found
// skier route, including its gate order and digit conditions, is omitted.
// Gate pole--middle--pole lists are transcribed from the seven grey drawn lines.
const gates = [
  ['R1C2', 'R2C2', 'R3C2'], ['R3C3', 'R2C4', 'R1C5'],
  ['R3C7', 'R3C8', 'R3C9'], ['R3C6', 'R4C6', 'R5C6'],
  ['R5C2', 'R5C3', 'R5C4'], ['R6C5', 'R7C5', 'R8C5'],
  ['R6C8', 'R7C8', 'R8C8'],
];
// Dot and X pairs are transcribed from the corresponding edge overlays.
const whites = [['R2C4', 'R3C4'], ['R1C5', 'R1C6'], ['R7C3', 'R8C3']];
const blacks = [['R1C1', 'R2C1'], ['R2C1', 'R3C1'], ['R6C1', 'R6C2']];
const xs = [['R2C1', 'R2C2'], ['R4C8', 'R4C9'], ['R9C6', 'R9C7']];

return [
  new Shape('9x9'),
  ...gates.map(cells => new Between(...cells)),
  ...whites.map(cells => new WhiteDot(...cells)),
  ...blacks.map(cells => new BlackDot(...cells)),
  ...xs.map(cells => new X(...cells)),
];
