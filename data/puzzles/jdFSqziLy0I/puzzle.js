// Title: 3's in the Corners
// Author: JC
// Video: https://www.youtube.com/watch?v=jdFSqziLy0I
// Source: https://app.crackingthecryptic.com/sudoku/JpG66FjqPN

// Normal sudoku rules apply (standard 9x9, 9 boxes -- Shape's default).
// A clue with an arrow outside the grid shows the total of the indicated
// diagonal (digits may repeat along it -- only cages are stated repeat-free).
// A clue without an arrow outside the grid shows the sum of the digits
// between the 1 and the 9 in that row/column (Sandwich).
// Digits along an arrow in the grid sum to the number in the attached circle.
// Digits along a thermometer increase from the bulb.
// Cages show their sums and contain no repeat digits.
// A black dot joins two digits with a 1:2 ratio; a white dot joins two
// consecutive digits; an X joins two digits that sum to 10.
// A blue square shows an even digit -- there is no dedicated parity class,
// so it is encoded as a candidate-restricting Given.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Given('R5C2', 4),
  new Given('R5C9', 2),
  new Given('R7C6', 8),

  // Outside diagonal clue anchored at the top edge between C8/C9
  // (raw wayPoints [-0.5,7.5]->[0,8]): entering the grid heading down-right
  // from that corner point immediately leaves the grid, so the "indicated
  // diagonal" is the single cell R1C9. ISS's LittleKiller cellMap excludes
  // length-1 diagonals, so the total is encoded directly as a Given -- the
  // video's own title, "That Really is 3 in the Corner", corroborates this
  // corner cell being handed to the solver.
  new Given('R1C9', 3),
  // The other three outside diagonal clues run at least 7 cells to the
  // opposite edge, matching ISS's canonical corner-to-corner LittleKiller
  // diagonals.
  LittleKiller.fromCells(33, graph.ray('R1C9', 1, -1), geometry),
  LittleKiller.fromCells(33, graph.ray('R2C9', 1, -1), geometry),
  LittleKiller.fromCells(33, graph.ray('R3C1', 1, 1), geometry),

  // Outside "between the 1 and the 9" clues (no arrow), both on the left.
  Sandwich.fromCells(33, graph.row(5), geometry),
  Sandwich.fromCells(32, graph.row(9), geometry),

  new Cage(33, 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C2'),
  // No printed total: still a real cage, all-different only.
  new AllDifferent(
    'R2C4', 'R2C5', 'R3C5', 'R4C4', 'R4C5', 'R5C5', 'R6C4', 'R6C5'),
  new Cage(33, 'R5C1', 'R6C1', 'R6C2', 'R7C1', 'R7C2', 'R8C1'),
  new Cage(33, 'R8C4', 'R8C5', 'R9C3', 'R9C4', 'R9C5', 'R9C6'),
  new Cage(18, 'R8C9', 'R9C8', 'R9C9'),

  new Thermo('R4C4', 'R3C4', 'R2C4'),
  new Thermo('R7C7', 'R7C8', 'R7C9'),

  new Arrow('R4C2', 'R3C2', 'R2C2'),
  new Arrow('R2C3', 'R3C3', 'R4C3'),
  new Arrow('R5C8', 'R5C7', 'R5C6'),
  new Arrow('R9C9', 'R8C9', 'R9C8'),

  new WhiteDot('R1C1', 'R1C2'),
  new WhiteDot('R6C2', 'R6C3'),
  new WhiteDot('R6C3', 'R7C3'),
  new WhiteDot('R7C7', 'R7C8'),
  new WhiteDot('R7C8', 'R7C9'),
  new WhiteDot('R6C9', 'R7C9'),
  new WhiteDot('R9C8', 'R9C9'),

  new BlackDot('R2C1', 'R3C1'),
  new BlackDot('R2C2', 'R3C2'),
  new BlackDot('R1C8', 'R1C9'),
  new BlackDot('R2C8', 'R2C9'),
  new BlackDot('R5C6', 'R5C7'),
  new BlackDot('R7C3', 'R8C3'),
  new BlackDot('R9C6', 'R9C7'),

  new X('R1C8', 'R2C8'),

  new Given('R9C8', 2, 4, 6, 8),
];
