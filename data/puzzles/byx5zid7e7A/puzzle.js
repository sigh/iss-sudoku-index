// Title: New Year's Eve '21 Sudoku
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=byx5zid7e7A
// Source: https://app.crackingthecryptic.com/sudoku/hmRBD2d4jf

// Normal sudoku rules apply (default rows/cols/boxes on the 9x9 shape).
// Digits increase along yellow thermometers from the bulb to the end(s).
// Clues outside the grid show the total of the indicated diagonal, which
// may include repeats.
// Blue, green and purple 'balloons' are odd digits.
//
// Three thermometer bulbs (solid gold underlay circles) each send out more
// than one arm ("end(s)" in the rules text) -- two of the three are drawn as
// two overlapping strokes meeting at the bulb cell, since a single polyline
// cannot depict three rays from one point. Each arm below is one Thermo,
// sharing its first (bulb) cell with its sibling arms.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  new Given('R4C2', 2),
  new Given('R4C3', 1),

  // Bulb R3C3, two arms.
  new Thermo('R3C3', 'R2C2', 'R1C1', 'R2C1', 'R3C1'),
  new Thermo('R3C3', 'R4C4', 'R3C4', 'R2C4', 'R1C4'),

  // Bulb R7C3, three arms.
  new Thermo('R7C3', 'R6C2', 'R5C1'),
  new Thermo('R7C3', 'R8C3', 'R9C3'),
  new Thermo('R7C3', 'R6C4', 'R5C5'),

  // Bulb R5C6, three arms.
  new Thermo('R5C6', 'R4C6', 'R3C6', 'R3C7', 'R3C8', 'R3C9'),
  new Thermo('R5C6', 'R6C6', 'R7C6', 'R7C7', 'R7C8', 'R7C9'),
  new Thermo('R5C6', 'R5C7', 'R5C8', 'R5C9'),

  // Outside diagonal ("Little Killer") clues, all totalling 21. Start cell
  // and direction come from the drawn off-grid arrow for each; fromCells
  // walks the diagonal and finds its canonical clue id.
  LittleKiller.fromCells(21, graph.ray('R1C6', 1, 1), geometry),
  LittleKiller.fromCells(21, graph.ray('R1C7', 1, 1), geometry),
  LittleKiller.fromCells(21, graph.ray('R5C1', -1, 1), geometry),
  LittleKiller.fromCells(21, graph.ray('R6C9', 1, -1), geometry),
  LittleKiller.fromCells(21, graph.ray('R7C9', 1, -1), geometry),

  // Balloons: single-cell odd-digit markers (no class for parity, so a
  // multi-value Given restricts the candidates).
  ...['R5C2', 'R9C6', 'R6C9', 'R8C7', 'R1C8', 'R8C2', 'R9C1', 'R8C4', 'R1C5']
    .map(cell => new Given(cell, 1, 3, 5, 7, 9)),
];
