// Title: CTC 300k Subs - Nailed It
// Author: olima
// Video: https://www.youtube.com/watch?v=lnG0QbQ92f0
// Source: https://app.crackingthecryptic.com/webapp/TPGJfB3bqM

// Normal sudoku rules apply. Thermo() already expresses "increasing from the
// bulb to the end". Sandwich() already expresses "sum of digits strictly
// between the 1 and the 9 in that row/column".
//
// Two thermometers (C and G below) are drawn as more than one connected
// stroke sharing a cell: the source draws a single bulb, then the line
// splits into multiple arms at a junction cell. Each arm is encoded as its
// own Thermo() sharing the bulb-side prefix cells, so every arm increases
// away from the one bulb independently; the arms are not ordered against
// each other.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Outside sandwich sums, transcribed from the payload's outside overlay text
// cells: left of R8 = 3, left of R9 = 0, below C2/C3/C8/C9 = 0.
const sandwiches = [
  [3, graph.row(8)],
  [0, graph.row(9)],
  [0, graph.column(2)],
  [0, graph.column(3)],
  [0, graph.column(8)],
  [0, graph.column(9)],
].map(([value, cells]) => Sandwich.fromCells(value, cells, geometry));

return [
  new Shape('9x9'),

  // Thermometers, transcribed from the payload's `lines` (thickness-10 grey
  // strokes) and `underlays` (grey circle = bulb).
  new Thermo('R1C2', 'R1C1', 'R2C1', 'R3C1', 'R3C2'),
  new Thermo('R7C2', 'R7C1', 'R8C1', 'R9C1', 'R9C2'),
  new Thermo('R4C1', 'R5C1', 'R6C1'),
  new Thermo('R5C1', 'R5C2'),
  new Thermo('R2C2', 'R2C3', 'R3C3', 'R4C2', 'R4C3', 'R5C3', 'R6C2'),
  new Thermo('R3C4', 'R3C5', 'R4C5', 'R5C5', 'R5C4', 'R4C4'),
  new Thermo('R4C6', 'R4C7', 'R5C7', 'R6C7', 'R6C6', 'R5C6'),
  new Thermo('R6C9', 'R6C8', 'R7C9'),
  new Thermo('R6C8', 'R5C8'),
  new Thermo('R6C8', 'R7C8'),
  new Thermo('R8C7', 'R9C7'),

  ...sandwiches,
];
