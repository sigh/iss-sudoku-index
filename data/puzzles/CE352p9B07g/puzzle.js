// Title: Blast Off
// Author: Jessica Shaham
// Video: https://www.youtube.com/watch?v=CE352p9B07g
// Source: https://app.crackingthecryptic.com/sudoku/B76mMpPdQQ
//
// Normal sudoku rules apply. Along thermometers, digits strictly increase
// from the bulb. Clues outside the grid show the sum of the digits on the
// indicated diagonal, which may include repeats.
//
// Two bulb cells (R9C3, R9C7) each anchor two separate increasing arms
// (drawn as two line entries sharing one bulb waypoint); each arm is its
// own Thermo starting at the shared bulb.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const thermos = [
  new Thermo('R9C3', 'R8C3', 'R7C3', 'R6C3', 'R5C4'),
  new Thermo('R9C3', 'R8C2', 'R7C1'),
  new Thermo('R9C7', 'R8C7', 'R7C7', 'R6C7', 'R5C6'),
  new Thermo('R9C7', 'R8C8', 'R7C9'),
  new Thermo('R7C5', 'R6C5', 'R5C5', 'R4C5', 'R3C5'),
  new Thermo('R9C4', 'R8C4'),
  new Thermo('R9C6', 'R8C6'),
  new Thermo('R1C1', 'R1C2'),
];

// LittleKiller sums the diagonal in the direction the drawn off-grid arrow
// points (up-right or up-left); repeats are allowed by rule text and by
// LittleKiller's own semantics (it adds no distinctness).
const littleKillers = [
  LittleKiller.fromCells(13, graph.ray('R4C1', -1, 1), geometry),
  LittleKiller.fromCells(13, graph.ray('R6C1', -1, 1), geometry),
  LittleKiller.fromCells(30, graph.ray('R4C9', -1, -1), geometry),
  LittleKiller.fromCells(38, graph.ray('R6C9', -1, -1), geometry),
];

return [
  new Shape('9x9'),
  ...thermos,
  ...littleKillers,
];
