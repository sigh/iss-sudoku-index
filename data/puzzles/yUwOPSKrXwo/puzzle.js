// Title: The Heat Is On
// Author: Phurba
// Video: https://www.youtube.com/watch?v=yUwOPSKrXwo
// Source: https://sudokupad.app/74j61weh89

// Normal 9x9 Sudoku rules apply. Orthogonally adjacent cells must belong to
// different low (1-3), middle (4-6), or high (7-9) entropic sets. The four
// pale-purple bulb-first paths are ultra-fast thermometers: every step rises by
// at least 3. The paths are transcribed from the pale-purple drawn lines and
// their circle bulbs.
const graph = cellGraph('9x9');
const entropyKey = Pair.fnToKey(
  (a, b) => Math.floor((a - 1) / 3) !== Math.floor((b - 1) / 3),
  9,
);
const risingByThreeKey = Pair.fnToKey((a, b) => b - a >= 3, 9);

// Each right/down neighbour is included once, covering all orthogonal pairs.
const antiEntropy = [
  graph.makeReplicate(
    new Pair(entropyKey, 'anti-entropy', 'R1C1', 'R1C2'),
    graph.cells().filter(cell => graph.step(cell, 0, 1)),
  ),
  graph.makeReplicate(
    new Pair(entropyKey, 'anti-entropy', 'R1C1', 'R2C1'),
    graph.cells().filter(cell => graph.step(cell, 1, 0)),
  ),
];

// Pale-purple, bulb-first paths from the source drawing.
const ultraFastThermometers = [
  ['R3C3', 'R3C4', 'R2C3'],
  ['R3C7', 'R3C8', 'R2C7'],
  ['R6C8', 'R7C8', 'R6C9'],
  ['R7C3', 'R8C3', 'R9C2'],
].map(cells => new Pair(risingByThreeKey, 'ultra-fast-thermo', ...cells));

return [
  new Shape('9x9'),
  ...antiEntropy,
  ...ultraFastThermometers,
];
