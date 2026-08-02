// Title: The Fountain
// Author: Tobias Brixner
// Video: https://www.youtube.com/watch?v=s-YGS4KO_M0
// Source: https://app.crackingthecryptic.com/sudoku/g9NB728Tgp

// The grid has nine solver-discovered orthogonally connected 9-cell regions.
// Green lines are German Whispers. Each caged digit counts the distinct region
// labels in its own king-neighbourhood, including itself.

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

const WHISPER_LINES = [
  ['R6C3', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R6C7'],
  ['R4C4', 'R5C5', 'R4C6'],
  ['R9C5', 'R8C5', 'R8C6', 'R8C7', 'R7C8', 'R6C9', 'R5C9'],
  ['R5C1', 'R6C1', 'R7C2', 'R8C3'],
];
const CAGE_CELLS = ['R5C1', 'R5C9', 'R2C5', 'R2C6', 'R6C5', 'R7C5', 'R8C5'];

// Caged cells and their king-neighbourhoods come from the seven drawn cages.
const regionCounts = CAGE_CELLS.map(cell =>
  new CountDistinct(cell, ...cc.at([cell, ...graph.kingNeighbours(cell)])));

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  new Given('R5C5', 1),
  ...WHISPER_LINES.map(cells => new Whisper(5, ...cells)),
  ...regionCounts,
];
