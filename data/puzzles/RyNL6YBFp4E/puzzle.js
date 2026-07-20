// Title: Ghosts in the Fog
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=RyNL6YBFp4E
// Source: https://sudokupad.app/mm4b2w1a65

// Orthogonally adjacent cells may not sum to 10. Two translated Pair
// templates cover every horizontal and vertical grid edge.
const graph = cellGraph('9x9');
const noTenKey = Pair.fnToKey((a, b) => a + b !== 10, 9);
const horizontalStarts = graph.cells().filter(cell => parseCellId(cell).col < 9);
const verticalStarts = graph.cells().filter(cell => parseCellId(cell).row < 9);

const noAdjacentTen = [
  graph.makeReplicate(
    new Pair(noTenKey, 'adjacent cells do not sum to 10', 'R1C1', 'R1C2'),
    horizontalStarts,
  ),
  graph.makeReplicate(
    new Pair(noTenKey, 'adjacent cells do not sum to 10', 'R1C1', 'R2C1'),
    verticalStarts,
  ),
];

const palindromes = [
  new Palindrome(
    'R3C6', 'R4C5', 'R3C4', 'R4C3', 'R3C3', 'R2C3',
    'R1C4', 'R1C5', 'R1C6', 'R2C7', 'R3C7', 'R4C7',
  ),
  new Palindrome(
    'R9C7', 'R8C7', 'R7C7', 'R6C6', 'R6C5', 'R6C4',
    'R7C3', 'R8C3', 'R9C3', 'R8C4', 'R9C5', 'R8C6',
  ),
];

const blackDots = [
  new BlackDot('R2C4', 'R2C5'),
  new BlackDot('R2C5', 'R2C6'),
  new BlackDot('R7C4', 'R7C5'),
  new BlackDot('R7C5', 'R7C6'),
];

return [
  new Shape('9x9'),
  new Given('R1C7', 8),
  new Given('R6C2', 3),
  new Given('R6C8', 7),
  new Given('R7C8', 6),
  new Given('R8C5', 1, 3, 5, 7, 9),
  ...noAdjacentTen,
  ...palindromes,
  ...blackDots,
];
