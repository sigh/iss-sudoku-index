// Title: United King-dom - douze points
// Author: olima
// Video: https://www.youtube.com/watch?v=VmWThlSuLE4
// Source: https://sudokupad.app/yn92b7aepi

// Normal Sudoku (default row/column/box all-different) plus:
// - Anti-king: no two cells a king's move apart repeat a digit.
// - Black dot on an edge: the two digits are in a 1:2 ratio.
// - White dot on an edge: the two digits are consecutive.
// "Not all dots are necessarily given" rules out treating undotted adjacent
// pairs as negative constraints, so plain BlackDot/WhiteDot pairs (not the
// strict/negative Kropki forms) are used below.

// Black dot edges (1:2 ratio), from the drawn black-filled edge marks.
const blackDotPairs = [
  ['R7C4', 'R8C4'],
  ['R4C2', 'R5C2'],
  ['R2C4', 'R3C4'],
  ['R3C6', 'R4C6'],
  ['R3C8', 'R4C8'],
  ['R5C8', 'R6C8'],
  ['R7C6', 'R8C6'],
  ['R7C8', 'R8C8'],
  ['R4C4', 'R5C4'],
  ['R2C7', 'R3C7'],
  ['R8C9', 'R9C9'],
  ['R5C5', 'R6C5'],
];

// White dot edges (consecutive), from the drawn white-with-black-border edge marks.
const whiteDotPairs = [
  ['R6C7', 'R7C7'],
  ['R4C8', 'R5C8'],
  ['R7C7', 'R8C7'],
  ['R3C3', 'R4C3'],
  ['R5C4', 'R6C4'],
  ['R3C4', 'R4C4'],
  ['R6C4', 'R7C4'],
  ['R4C6', 'R5C6'],
  ['R2C6', 'R3C6'],
  ['R2C8', 'R3C8'],
  ['R6C5', 'R7C5'],
  ['R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  new AntiKing(),
  ...blackDotPairs.map((cells) => new BlackDot(...cells)),
  ...whiteDotPairs.map((cells) => new WhiteDot(...cells)),
];
