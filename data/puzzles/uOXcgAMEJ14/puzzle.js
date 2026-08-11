// Title: Even Miracle
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=uOXcgAMEJ14
// Source: https://app.crackingthecryptic.com/sudoku/2mnGfDQdmj

// Normal sudoku rules apply (9x9, regular 3x3 boxes). "Consecutive digits
// cannot be orthogonal neighbours" is ISS's built-in AntiConsecutive global
// ("No adjacent cells can have consecutive values."). "Grey squares show
// even digits" restricts each of the 8 grey overlay cells to {2,4,6,8} via
// Given.

const givens = [
  ['R2C3', 5],
  ['R2C4', 2],
  ['R2C7', 3],
  ['R8C1', 4],
];

// Grey (#CFCFCF fill) overlay cells, from the payload's overlays array.
const greyCells = [
  'R2C2', 'R2C5', 'R2C8',
  'R5C1', 'R5C9',
  'R8C2', 'R8C5', 'R8C8',
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new AntiConsecutive(),
  ...greyCells.map(cell => new Given(cell, 2, 4, 6, 8)),
];
