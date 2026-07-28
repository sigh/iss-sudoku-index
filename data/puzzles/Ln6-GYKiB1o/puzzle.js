// Title: Climbing The Stairs
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=Ln6-GYKiB1o
// Source: https://sudokupad.app/j3j5t378kj

// Normal Sudoku applies. On each drawn grey stair, read from its corner, the
// six successive pairs differ by at least 2, 3, 4, 5, 6, and 7; its endpoints
// are equal. The path cells and matching endpoint colours are transcribed from
// the grey lines and coloured squares in the drawing.
const stairs = [
  ['R1C1', 'R1C2', 'R2C2', 'R2C3', 'R3C3', 'R3C4', 'R4C4'],
  ['R1C9', 'R2C9', 'R2C8', 'R3C8', 'R3C7', 'R4C7', 'R4C6'],
  ['R9C9', 'R9C8', 'R8C8', 'R8C7', 'R7C7', 'R7C6', 'R6C6'],
  ['R9C1', 'R8C1', 'R8C2', 'R7C2', 'R7C3', 'R6C3', 'R6C4'],
];
const minimumDifferences = [2, 3, 4, 5, 6, 7];
const stairDifferences = stairs.flatMap(cells => cells.slice(1).map((cell, index) => {
  const minimum = minimumDifferences[index];
  // Pair's predicate is the absolute difference required for this stair step.
  const key = Pair.fnToKey((a, b) => Math.abs(a - b) >= minimum, 9);
  return new Pair(key, `stair difference at least ${minimum}`, cells[index], cell);
}));
const stairEndpointEqualities = stairs.map(cells => new SameValues(2, cells[0], cells.at(-1)));

return [
  new Shape('9x9'),
  new Given('R2C2', 2),
  new Given('R3C8', 8),
  new Given('R7C4', 5),
  ...stairDifferences,
  ...stairEndpointEqualities,
];
