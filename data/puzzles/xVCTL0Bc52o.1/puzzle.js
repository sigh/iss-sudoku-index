// Title: 2 Paintings by Nikolai Astrup
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=xVCTL0Bc52o
// Source: https://tinyurl.com/5vz5sp89

// Normal sudoku rules apply. Grey-circle cells must hold an odd digit;
// grey-square cells must hold an even digit. Each parity cell is encoded as
// a multi-value Given restricting it to its candidate set.

const givens = [
  new Given('R2C3', 1),
  new Given('R2C8', 4),
  new Given('R2C9', 5),
  new Given('R3C3', 2),
  new Given('R3C4', 7),
  new Given('R3C5', 8),
  new Given('R4C2', 3),
  new Given('R4C3', 4),
  new Given('R4C4', 6),
  new Given('R4C8', 7),
  new Given('R5C4', 5),
  new Given('R5C8', 8),
  new Given('R8C2', 7),
  new Given('R8C4', 8),
  new Given('R8C5', 9),
  new Given('R9C2', 8),
  new Given('R9C8', 5),
  new Given('R9C9', 9),
];

// Grey circles.
const oddCells = [
  'R2C2', 'R3C2', 'R5C5', 'R4C5', 'R3C8', 'R3C9',
  'R8C3', 'R9C3', 'R8C8', 'R8C9',
];

// Grey squares.
const evenCells = [
  'R5C2', 'R5C3', 'R2C4', 'R2C5', 'R4C9', 'R5C9',
  'R9C4', 'R9C5',
];

const oddGivens = oddCells.map((cell) => new Given(cell, 1, 3, 5, 7, 9));
const evenGivens = evenCells.map((cell) => new Given(cell, 2, 4, 6, 8));

return [
  new Shape('9x9'),
  ...givens,
  ...oddGivens,
  ...evenGivens,
];
