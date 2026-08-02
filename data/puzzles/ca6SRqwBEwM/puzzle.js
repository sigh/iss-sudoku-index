// Title: Shadow Circles
// Author: Celery
// Video: https://www.youtube.com/watch?v=ca6SRqwBEwM
// Source: https://sudokupad.app/Lf4B9t2p29

// Normal Sudoku rules apply. Every red circle counts equal digits among all red
// circles, and its digit reappears in one of its eight surrounding cells. The
// two fog-lit red circles are equal. Each purple arrow's arm sums to its circle.
// Fog/reveal behavior and the drawn non-crossing/non-sharing arrow layout are UI
// and geometry facts, not additional final-grid constraints.
const redCircles = [
  'R1C3', 'R1C4', 'R2C3', 'R3C5', 'R3C7', 'R4C6', 'R5C7',
  'R6C2', 'R6C5', 'R7C3', 'R7C6', 'R8C4', 'R8C7',
];

// Transcribed from the purple circle-and-arrow drawings: control circle first.
const arrows = [
  ['R3C7', 'R2C6', 'R2C5'],
  ['R8C4', 'R9C4', 'R9C5', 'R8C5'],
  ['R7C3', 'R6C4', 'R5C4'],
  ['R5C7', 'R4C7', 'R4C8', 'R4C9'],
  ['R6C5', 'R6C6', 'R7C7'],
  ['R6C2', 'R6C1', 'R7C1'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9'],
  ['R4C3', 'R3C2', 'R3C1', 'R4C1'],
  ['R9C8', 'R8C9', 'R7C8'],
];

const graph = cellGraph('9x9');

// Each Or chooses a surrounding king-neighbour with the red circle's digit.
const redNeighbourMatches = redCircles.map(circle => new Or(
  graph.kingNeighbours(circle).map(neighbour =>
    new SameValues(2, circle, neighbour))));

return [
  new Shape('9x9'),
  new CountingCircles(...redCircles),
  new SameValues(2, 'R5C7', 'R7C3'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...redNeighbourMatches,
];
