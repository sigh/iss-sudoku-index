// Title: Stairway To Heaven
// Author: High Dudgeon
// Video: https://www.youtube.com/watch?v=kjKjeVnIifM
// Source: https://app.crackingthecryptic.com/sudoku/Q22nrd4Mtd

// Normal sudoku rules (default rows/cols/boxes). Nine arrows (bulb cell = sum
// of its arm cells). Eight coloured lines: digits on each line form a set of
// non-repeating consecutive digits, in any order (Renban).

// Arrow bulb (first cell) and arm cells, transcribed from the drawn arrow
// waypoints (each starts at its circled cell).
const arrows = [
  ['R1C2', 'R1C1', 'R2C1'],
  ['R1C5', 'R2C5', 'R3C4'],
  ['R5C1', 'R5C2', 'R4C3'],
  ['R8C2', 'R7C2', 'R7C1'],
  ['R9C5', 'R9C4', 'R8C4'],
  ['R8C7', 'R8C6', 'R7C6', 'R7C5'],
  ['R6C8', 'R6C7', 'R5C7'],
  ['R5C9', 'R4C9', 'R4C8'],
  ['R2C8', 'R2C7', 'R1C7'],
];

// Coloured-line cells, transcribed from the drawn line waypoints. Four lines
// are drawn as staircase shapes that revisit one cell (a step corner shared
// with an arrow bulb); that cell is listed once here, since it is a single
// grid cell.
const lines = [
  ['R8C9', 'R7C9', 'R7C8', 'R6C8', 'R6C7', 'R5C7', 'R5C6', 'R4C6', 'R4C5'],
  ['R9C8', 'R9C7', 'R8C7', 'R8C6', 'R7C6', 'R7C5', 'R6C5', 'R6C4', 'R5C4'],
  ['R9C9', 'R8C8', 'R7C7', 'R6C6', 'R5C5', 'R4C4'],
  ['R9C3', 'R8C3', 'R8C2', 'R8C1', 'R9C1', 'R9C2', 'R7C2', 'R7C1'],
  ['R3C9', 'R3C8', 'R2C8', 'R1C8', 'R1C9', 'R2C9', 'R2C7', 'R1C7'],
  ['R1C5', 'R2C5', 'R2C4', 'R3C4', 'R3C3', 'R4C3', 'R4C2', 'R5C2', 'R5C1'],
  ['R3C7', 'R3C6'],
  ['R7C3', 'R6C3'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...lines.map(cells => new Renban(...cells)),
];
