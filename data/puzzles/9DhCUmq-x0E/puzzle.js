// Title: Cithara
// Author: BIGfoot
// Video: https://www.youtube.com/watch?v=9DhCUmq-x0E
// Source: https://app.crackingthecryptic.com/sudoku/Png86rj7FG
//
// Normal sudoku rules. Both full main diagonals (drawn in blue) are
// all-different. Each outside arrow gives the sum of the short diagonal ray
// it points into (repeats allowed there, per the rules text -- these rays
// are not the marked diagonals above). Each purple line is a Renban set
// (consecutive, non-repeating digits, any order).
//
// Two further payload entries share the purple/blue line styling but carry
// no coordinates and render nothing on the board -- they are not drawn
// clues and are omitted.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Outside diagonal-sum clues: (start cell, direction, sum). Direction is
// read from the drawn arrowhead, not the payload's off-grid ray order.
const outsideSums = [
  ['R1C7', 1, 1, 12],
  ['R5C1', 1, 1, 28],
  ['R6C1', 1, 1, 22],
  ['R9C5', -1, 1, 32],
  ['R9C6', -1, 1, 21],
];

return [
  new Shape('9x9'),

  new Given('R1C9', 9),
  new Given('R8C8', 4),
  new Given('R9C1', 8),
  new Given('R9C9', 1),

  new Diagonal(-1),
  new Diagonal(1),

  ...outsideSums.map(([cell, dr, dc, sum]) =>
    LittleKiller.fromCells(sum, graph.ray(cell, dr, dc), geometry)),

  new Renban('R8C1', 'R7C1', 'R7C2', 'R8C3'),
  new Renban('R6C3', 'R5C4', 'R4C5', 'R3C6'),
  new Renban('R1C8', 'R1C7', 'R2C7', 'R3C8'),
  new Renban('R4C9', 'R5C9', 'R6C9'),
  new Renban('R9C4', 'R9C5', 'R9C6'),
  new Renban('R7C8', 'R7C7', 'R8C7'),
];
