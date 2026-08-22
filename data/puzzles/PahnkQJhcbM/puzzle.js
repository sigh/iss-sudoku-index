// Title: Fire Flower And Ice Flower
// Author: Playmaker6174
// Video: https://www.youtube.com/watch?v=PahnkQJhcbM
// Source: https://app.crackingthecryptic.com/sudoku/RQQjRj3RPG

// Standard 9x9 sudoku (rows/columns/3x3 boxes), no givens.
// Red cell: high digit (6-9) -> multi-value Given.
// Blue cell: low digit (1-4) -> multi-value Given.
// Purple lines: each is a set of non-repeating consecutive digits, any
// order -> Renban.
// Green lines: adjacent cells (by drawn line order, some diagonal) differ
// by at least 5 -> Whisper(5).
// Yellow cells: greater than every orthogonal neighbour. The payload also
// draws four short tick marks radiating from each yellow cell toward its
// neighbours; those are the rule's own illustration, not separate clues, so
// only the inequality itself is encoded. Listing the
// yellow cell first in each GreaterThan group makes it the "earlier" cell
// in every generated adjacent pair, so it is required greater than each
// neighbour; the neighbours are not mutually orthogonally adjacent to each
// other, so no unintended pair is added.

const purpleLines = [
  ['R4C1', 'R5C1', 'R6C1', 'R6C2'],
  ['R3C2', 'R3C1', 'R2C1', 'R1C2', 'R1C3', 'R2C3'],
  ['R3C8', 'R3C9', 'R2C9', 'R1C9'],
  ['R2C5', 'R3C5', 'R4C5', 'R5C6'],
  ['R5C4', 'R6C5', 'R7C5', 'R8C5'],
  ['R7C2', 'R7C1', 'R8C1', 'R9C1'],
  ['R7C8', 'R7C9', 'R8C9', 'R9C8', 'R9C7', 'R8C7'],
  ['R8C6', 'R9C5'],
  ['R4C8', 'R4C9', 'R5C9', 'R6C9'],
  ['R5C7', 'R6C7', 'R6C6'],
  ['R5C3', 'R4C3', 'R4C4'],
];

const greenLines = [
  ['R2C2', 'R3C3'],
  ['R2C8', 'R3C7'],
  ['R7C7', 'R8C8'],
  ['R7C3', 'R8C2'],
];

return [
  new Shape('9x9'),

  new Given('R1C1', 6, 7, 8, 9),
  new Given('R9C9', 1, 2, 3, 4),

  ...purpleLines.map((cells) => new Renban(...cells)),
  ...greenLines.map((cells) => new Whisper(5, ...cells)),

  new GreaterThan('R5C3', 'R4C3', 'R6C3', 'R5C2', 'R5C4'),
  new GreaterThan('R5C7', 'R4C7', 'R6C7', 'R5C6', 'R5C8'),
];
