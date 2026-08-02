// Title: Secret Whispers
// Author: Fafrd
// Video: https://www.youtube.com/watch?v=bEutmml7M3U
// Source: https://sudokupad.app/bhHj7B2DfN

// Standard Sudoku rules apply. Every orthogonally adjacent pair differs by at
// least 3. The grey bulb-first paths are thermometers, and each black dot is a
// 2:1-ratio domino. Thermometer paths and dot pairs are transcribed from the
// drawn clues.
const graph = cellGraph('9x9');
const adjacentDifferenceAtLeast3 = Pair.fnToKey((a, b) => Math.abs(a - b) >= 3, 9);
const horizontalStarts = graph.cells().filter(cell => graph.step(cell, 0, 1));
const verticalStarts = graph.cells().filter(cell => graph.step(cell, 1, 0));

// Two translated templates cover each horizontal and vertical adjacent pair once.
const adjacentDifferences = [
  graph.makeReplicate(
    new Pair(adjacentDifferenceAtLeast3, 'adjacent difference at least 3', 'R1C1', 'R1C2'),
    horizontalStarts),
  graph.makeReplicate(
    new Pair(adjacentDifferenceAtLeast3, 'adjacent difference at least 3', 'R1C1', 'R2C1'),
    verticalStarts),
];

return [
  new Shape('9x9'),
  ...adjacentDifferences,
  new Thermo('R2C1', 'R1C1', 'R1C2'),
  new Thermo('R5C6', 'R6C6', 'R6C5'),
  new BlackDot('R2C3', 'R2C4'),
  new BlackDot('R6C9', 'R7C9'),
];
