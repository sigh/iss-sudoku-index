// Title: Dec 12, 2021: LK Arrow
// Author: clover!
// Video: https://www.youtube.com/watch?v=2Z_Pr6qV2mg
// Source: https://tinyurl.com/nhzuphwa

// Normal sudoku rules apply.
//
// Arrows: digits along each arm sum to the digit in that arm's shared bulb
// cell; digits may repeat along an arm where sudoku rules allow. Every bulb
// here has more than one arm, and each arm sums to the bulb independently --
// one `Arrow` per arm, all sharing the bulb cell.
//
// Marked diagonals: digits along a diagonal marked outside the grid sum to
// the printed total; digits may repeat where sudoku rules allow. Each is
// given as a ray from its grid-edge entry cell, which is what
// `LittleKiller.fromCells` expects.
//
// Several marked diagonals retrace an arrow's bulb-plus-arm cells, and the
// two full-length diagonals cross several bulbs. These are two independent
// clue types stacked on shared cells -- nothing in the rules ties a diagonal
// total to an arrow sum or vice versa -- so they are encoded as independent
// constraints.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  new Given('R1C5', 2),
  new Given('R2C8', 4),
  new Given('R3C3', 5),
  new Given('R3C6', 8),
  new Given('R5C2', 7),
  new Given('R5C8', 8),
  new Given('R7C4', 8),
  new Given('R7C7', 2),
  new Given('R8C2', 5),
  new Given('R9C5', 5),

  // Arrows -- bulb cell first, then each arm's cells.
  new Arrow('R3C1', 'R2C2', 'R1C3'),
  new Arrow('R3C1', 'R4C2', 'R5C3', 'R6C4'),

  new Arrow('R7C9', 'R6C8', 'R5C7', 'R4C6'),
  new Arrow('R7C9', 'R8C8', 'R9C7'),

  new Arrow('R7C3', 'R6C2', 'R5C1'),
  new Arrow('R7C3', 'R8C4', 'R9C5'),
  new Arrow('R7C3', 'R8C2', 'R9C1'),

  new Arrow('R3C7', 'R2C6', 'R1C5'),
  new Arrow('R3C7', 'R4C8', 'R5C9'),
  new Arrow('R3C7', 'R2C8', 'R1C9'),

  new Arrow('R5C5', 'R4C4', 'R3C3'),
  new Arrow('R5C5', 'R6C6', 'R7C7'),

  // Marked diagonals: each a ray from the grid-edge entry cell inward.
  LittleKiller.fromCells(8, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(10, graph.ray('R9C7', -1, 1), geometry),
  LittleKiller.fromCells(21, graph.ray('R5C1', 1, 1), geometry),
  LittleKiller.fromCells(21, graph.ray('R5C9', -1, -1), geometry),
  LittleKiller.fromCells(40, graph.ray('R1C9', 1, -1), geometry),
  LittleKiller.fromCells(49, graph.ray('R1C1', 1, 1), geometry),
];
