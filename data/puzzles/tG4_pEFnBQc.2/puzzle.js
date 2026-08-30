// Title: Renban Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=tG4_pEFnBQc
// Source: https://cracking-the-cryptic.web.app/sudoku/23Mb92Bd7B

// Normal sudoku rules apply (standard 3x3 boxes). Four grey shaded lines
// (payload underlays), each a 7-cell connected path, hold consecutive
// non-repeating digits in any order -> Renban(...cells). Path order below
// follows the drawn shape's unique orthogonal traversal between its two
// endpoint cells; Renban is order-independent so this carries no meaning.

const givens = [
  new Given('R2C2', 8),
  new Given('R2C6', 1),
  new Given('R2C9', 5),
  new Given('R3C3', 7),
  new Given('R3C7', 2),
  new Given('R4C4', 7),
  new Given('R4C8', 6),
  new Given('R5C5', 2),
  new Given('R6C2', 9),
  new Given('R6C6', 3),
  new Given('R7C3', 6),
  new Given('R7C7', 9),
  new Given('R8C4', 2),
  new Given('R8C8', 5),
  new Given('R9C2', 1),
  new Given('R9C6', 8),
];

const renbanLines = [
  new Renban('R2C3', 'R2C4', 'R3C4', 'R4C4', 'R4C3', 'R4C2', 'R3C2'),
  new Renban('R2C7', 'R2C8', 'R3C8', 'R4C8', 'R4C7', 'R4C6', 'R3C6'),
  new Renban('R6C3', 'R6C4', 'R7C4', 'R8C4', 'R8C3', 'R8C2', 'R7C2'),
  new Renban('R6C7', 'R6C8', 'R7C8', 'R8C8', 'R8C7', 'R8C6', 'R7C6'),
];

return [
  new Shape('9x9'),

  ...givens,

  ...renbanLines,
];
