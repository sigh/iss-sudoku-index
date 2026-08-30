// Title: Little Killer Thermo
// Author: David McNeill
// Video: https://www.youtube.com/watch?v=X7Mpr13KaJA
// Source: https://cracking-the-cryptic.web.app/sudoku/FHQG7rHTFR

// Normal sudoku rules apply (standard 3x3 boxes, no givens). Each grey line
// is a thermometer: digits strictly increase from the bulb end. Each arrow
// outside the grid gives the sum of the digits along the diagonal it points
// into, from the entry cell to the far edge; digits may repeat on that
// diagonal (Little Killer semantics). Four of the twelve diagonals are only
// one cell long (the four grid corners): LittleKiller.cellMap only tracks
// diagonals of length >= 2 (js/sudoku_constraint.js), so those four clues
// are encoded directly as Given, which is what a one-cell sum reduces to.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Diagonal directions as (dRow, dCol), matching the arrow stroke each clue
// is drawn with.
const DOWN_LEFT = [1, -1];
const UP_LEFT = [-1, -1];
const UP_RIGHT = [-1, 1];
const DOWN_RIGHT = [1, 1];

return [
  new Shape('9x9'),

  // Thermometers: cell paths as drawn (grey lines, bulb = filled circle).
  new Thermo('R1C6', 'R1C7', 'R1C8', 'R2C9', 'R3C9', 'R4C9'),
  new Thermo('R6C9', 'R7C9', 'R8C9', 'R9C8', 'R9C7', 'R9C6'),
  new Thermo('R9C4', 'R9C3', 'R9C2', 'R8C1', 'R7C1', 'R6C1'),
  new Thermo('R4C1', 'R3C1', 'R2C1', 'R1C2', 'R1C3', 'R1C4'),
  new Thermo('R3C5', 'R3C4', 'R4C3', 'R5C3'),
  new Thermo('R5C7', 'R6C7', 'R7C6', 'R7C5'),

  // Single-cell diagonal clues at the four corners (see note above): the
  // ray is just the corner cell, so the sum is that cell's value.
  new Given('R1C1', 3),
  new Given('R1C9', 9),
  new Given('R9C9', 1),
  new Given('R9C1', 5),

  // Little Killer diagonal-sum clues (length >= 2), rays from the arrow's
  // entry cell to the far edge, direction from the drawn arrow stroke.
  LittleKiller.fromCells(9, graph.ray('R1C3', ...DOWN_LEFT), geometry),
  LittleKiller.fromCells(36, graph.ray('R1C5', ...DOWN_LEFT), geometry),
  LittleKiller.fromCells(17, graph.ray('R3C9', ...UP_LEFT), geometry),
  LittleKiller.fromCells(25, graph.ray('R5C9', ...UP_LEFT), geometry),
  LittleKiller.fromCells(14, graph.ray('R9C7', ...UP_RIGHT), geometry),
  LittleKiller.fromCells(19, graph.ray('R9C5', ...UP_RIGHT), geometry),
  LittleKiller.fromCells(15, graph.ray('R7C1', ...DOWN_RIGHT), geometry),
  LittleKiller.fromCells(25, graph.ray('R5C1', ...DOWN_RIGHT), geometry),
];
