// Title: Everything is Broken
// Author: Tanadien Whiteowl
// Video: https://www.youtube.com/watch?v=ACjV-SbllXE
// Source: https://app.crackingthecryptic.com/sudoku/qM96Q9qQ96

// Standard 9x9 sudoku (rows, columns, and 3x3 boxes -- the drawn regions match
// the default box tiling), plus:
// X: the two joined cells sum to 10.
// V: the two joined cells sum to 5.
// Arrow: digits along the arrow sum to the digit in its circle.
// Little Killer: each off-grid diagonal clue sums the digits along the full
// indicated diagonal; the rules state digits on that diagonal may repeat, so
// this is a plain sum, not a uniqueness constraint on the diagonal.

const geometry = cellGeometry('9x9');
const graph = cellGraph(geometry);

const givens = [
  ['R1C1', 1], ['R1C9', 9], ['R2C4', 7], ['R3C6', 3],
  ['R4C2', 1], ['R7C5', 4], ['R9C8', 4],
];

// Arrow bulb (circle) cell + arm cells, transcribed from the drawn arrows.
const arrows = [
  ['R1C9', 'R1C8', 'R2C7'],
  ['R4C8', 'R3C7', 'R3C8'],
  ['R4C8', 'R3C9', 'R2C9'],
  ['R4C8', 'R5C9', 'R6C9'],
  ['R4C8', 'R4C7', 'R5C8'],
  ['R7C7', 'R6C8', 'R6C7'],
  ['R5C5', 'R5C4', 'R6C5'],
  ['R8C4', 'R7C5', 'R6C6', 'R6C5'],
  ['R9C1', 'R8C2', 'R7C2', 'R8C3'],
  ['R9C1', 'R9C2', 'R8C3'],
  ['R6C2', 'R5C1', 'R5C2'],
  ['R3C3', 'R4C2', 'R3C2'],
];

// Edge-sized "X" marks, transcribed from the drawn overlays.
const xPairs = [
  ['R2C5', 'R3C5'],
  ['R4C8', 'R5C8'],
  ['R5C5', 'R6C5'],
  ['R5C4', 'R6C4'],
  ['R7C6', 'R8C6'],
  ['R7C8', 'R8C8'],
  ['R8C1', 'R8C2'],
];

// Edge-sized "V" marks, transcribed from the drawn overlays.
const vPairs = [
  ['R1C1', 'R2C1'],
  ['R2C7', 'R3C7'],
  ['R5C8', 'R5C9'],
  ['R4C2', 'R4C3'],
];

// The two off-grid "45" clues sit at the top-left and top-right corners,
// pointing along the full corner-to-corner diagonal in each case.
const littleKillers = [
  LittleKiller.fromCells(45, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(45, graph.ray('R9C1', -1, 1), geometry),
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...xPairs.map(cells => new X(...cells)),
  ...vPairs.map(cells => new V(...cells)),
  ...littleKillers,
];
