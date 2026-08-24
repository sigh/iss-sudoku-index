// Title: Mathlements
// Author: Qodec
// Video: https://www.youtube.com/watch?v=yW2FrDEg0HQ
// Source: https://app.crackingthecryptic.com/sudoku/Gt3hGDt7GJ

// Normal sudoku rules apply (standard 3x3 boxes, default row/col/box
// all-different).
//
// Odd digit clue: one opaque grey circle at R1C2 restricts that cell to an
// odd digit. There is no dedicated Odd class, so it is encoded as a
// multi-value Given.
//
// Arrows: each Arrow's first cell is the circled (sum) cell, the rest is the
// line the digits along it must sum to (per Arrow's ISS semantics). All 15
// drawn arrows below are encoded; a 16th payload entry carries no waypoints
// (styling only) and renders nothing, so it is omitted.

const arrows = [
  ['R1C4', 'R2C3'],
  ['R2C4', 'R3C3', 'R3C2', 'R3C1'],
  ['R2C6', 'R1C7'],
  ['R3C4', 'R4C3'],
  ['R3C5', 'R4C5', 'R5C5'],
  ['R3C6', 'R4C6', 'R5C6'],
  ['R3C7', 'R4C7', 'R5C7'],
  ['R3C8', 'R4C8', 'R5C8'],
  ['R3C9', 'R4C9', 'R5C9'],
  ['R6C1', 'R7C1', 'R8C1'],
  ['R6C4', 'R7C4', 'R8C4'],
  ['R5C2', 'R6C3', 'R7C3'],
  ['R6C6', 'R7C7', 'R8C7'],
  ['R6C7', 'R7C8', 'R8C8'],
  ['R6C8', 'R7C9', 'R8C9'],
];

return [
  new Shape('9x9'),
  new Given('R1C2', 1, 3, 5, 7, 9),
  ...arrows.map(cells => new Arrow(...cells)),
];
