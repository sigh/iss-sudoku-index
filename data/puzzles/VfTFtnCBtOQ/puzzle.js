// Title: Orbit
// Author: Henk Nicolai
// Video: https://www.youtube.com/watch?v=VfTFtnCBtOQ
// Source: https://app.crackingthecryptic.com/webapp/P8Tgqq7DPg

// Normal sudoku rules (standard 3x3 boxes; no givens).
// Arrow: digits along the arrow sum to the bulb (circle) digit, repeats
// allowed on the arm.
// Outside diagonal clues: each clue is the sum of the digits along a
// diagonal running from an edge cell straight to the far side of the grid,
// repeats allowed. Each clue's own drawn arrowhead names its starting cell
// and direction directly, so every one of the eight clues below uses
// LittleKiller.fromCells over the exact ray that arrow draws (fromCells also
// derives ISS's canonical corner cell for the resulting diagonal, which the
// off-grid badge position does not always match).
// Grey circle -> odd digit, grey square -> even digit (the four corner
// cells; the white-filled, grey-bordered circles on the arrow bulbs are
// each arrow's own bulb marker, not a parity clue).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  new Arrow('R3C3', 'R4C2', 'R5C1', 'R6C2'),
  new Arrow('R3C5', 'R4C4'),
  new Arrow('R3C7', 'R2C6', 'R1C5', 'R2C4'),
  new Arrow('R5C7', 'R4C6'),
  new Arrow('R7C5', 'R6C6'),
  new Arrow('R5C3', 'R6C4'),
  new Arrow('R7C7', 'R6C8', 'R5C9', 'R4C8'),
  new Arrow('R7C3', 'R8C4', 'R9C5', 'R8C6'),

  LittleKiller.fromCells(6, graph.ray('R1C2', 1, -1), geometry),
  LittleKiller.fromCells(38, graph.ray('R1C6', 1, -1), geometry),
  LittleKiller.fromCells(7, graph.ray('R2C9', -1, -1), geometry),
  LittleKiller.fromCells(47, graph.ray('R6C9', -1, -1), geometry),
  LittleKiller.fromCells(8, graph.ray('R9C8', -1, 1), geometry),
  LittleKiller.fromCells(42, graph.ray('R9C4', -1, 1), geometry),
  LittleKiller.fromCells(9, graph.ray('R8C1', 1, 1), geometry),
  LittleKiller.fromCells(43, graph.ray('R4C1', 1, 1), geometry),

  new Given('R1C1', 2, 4, 6, 8),
  new Given('R9C9', 2, 4, 6, 8),
  new Given('R1C9', 1, 3, 5, 7, 9),
  new Given('R9C1', 1, 3, 5, 7, 9),
];
