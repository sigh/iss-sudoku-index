// Title: The Four Pyramids
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=eoh0Bp4svp8
// Source: https://app.crackingthecryptic.com/sudoku/m8QRQ4JGtM

// Normal Sudoku rules apply. Each outlined no-total cage is all-different.
// Outside clues give diagonal sums. White dots are consecutive; the black dot is a 1:2 ratio.
// The rules state that not all dots are given, so no negative-dot constraint applies.
const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// The four drawn no-total cage cell lists.
const pyramids = [
  ['R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R3C6', 'R3C5', 'R3C4', 'R4C5'],
  ['R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R4C7', 'R5C7', 'R6C7', 'R5C6'],
  ['R7C4', 'R7C5', 'R7C6', 'R8C3', 'R8C4', 'R8C6', 'R8C7', 'R8C5', 'R6C5'],
  ['R5C4', 'R4C3', 'R5C3', 'R6C3', 'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R3C2'],
];

return [
  new Shape('9x9'),
  ...pyramids.map(cells => new AllDifferent(...cells)),

  // The top-left corner diagonal is not a canonical Little Killer ray, so express its shown sum directly.
  new Sum(26, ...graph.ray('R1C1', 1, 1)),
  LittleKiller.fromCells(32, graph.ray('R1C9', 1, -1), geometry),
  LittleKiller.fromCells(16, graph.ray('R4C1', -1, 1), geometry),
  LittleKiller.fromCells(21, graph.ray('R4C9', -1, -1), geometry),
  LittleKiller.fromCells(17, graph.ray('R9C4', -1, -1), geometry),

  new WhiteDot('R8C7', 'R8C8'),
  new WhiteDot('R1C1', 'R1C2'),
  new WhiteDot('R2C9', 'R3C9'),
  new WhiteDot('R3C4', 'R3C5'),
  new WhiteDot('R5C3', 'R6C3'),
  new BlackDot('R1C4', 'R1C5'),
];
