// Title: Futomaki
// Author: Pseudonum
// Video: https://www.youtube.com/watch?v=EmJxvKvBjv8
// Source: https://app.crackingthecryptic.com/sudoku/3b6NHjDNMr

// Normal sudoku rules apply, plus: 10 killer cages (sum totals, no repeated
// digit within a cage), 4 sum arrows (bulb cell equals the sum of its own
// arm cells, arm digits may repeat), and both main diagonals marked no-repeat.

return [
  new Shape('9x9'),

  new Given('R5C5', 9),
  new Given('R9C6', 1),

  // Cages: sum totals, top-left cell first per cage (provenance: cages array).
  new Cage(13, 'R2C5', 'R2C4', 'R3C4'),
  new Cage(5, 'R1C3', 'R2C3'),
  new Cage(5, 'R8C7', 'R9C7'),
  new Cage(15, 'R5C4', 'R6C4', 'R6C5'),
  new Cage(10, 'R4C5', 'R4C6', 'R5C6'),
  new Cage(9, 'R3C8', 'R4C8', 'R4C7'),
  new Cage(24, 'R5C8', 'R6C8', 'R6C7'),
  new Cage(18, 'R7C6', 'R8C6', 'R8C5'),
  new Cage(12, 'R6C2', 'R7C2', 'R6C3'),
  new Cage(22, 'R5C2', 'R4C2', 'R4C3'),

  // Arrows: bulb cell first, then arm cells (provenance: arrows array,
  // bulb identified by the white/grey circle underlay at the arrow's start).
  new Arrow('R2C7', 'R1C6', 'R1C5', 'R1C4'),
  new Arrow('R3C2', 'R4C1', 'R5C1', 'R6C1'),
  new Arrow('R8C3', 'R9C4', 'R9C5'),
  new Arrow('R7C8', 'R6C9', 'R5C9', 'R4C9'),

  // Both main diagonals (drawn in blue) are marked no-repeat.
  new Diagonal(1),
  new Diagonal(-1),
];
