// Title: True Blue
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=tRmOWN2jmSQ
// Source: https://sudokupad.app/6G7Mj2Bdmm

// Normal sudoku rules apply. Each blue line has equal digit sums in every
// box segment it traverses. The black dot is a 1:2 ratio, and all possible
// black dots are given; every other orthogonally adjacent pair is not a 1:2 ratio.
const blueLines = [
  ['R3C1', 'R3C2', 'R3C3', 'R2C4', 'R1C5', 'R1C6', 'R2C7'],
  ['R2C8', 'R3C9', 'R3C8', 'R4C7', 'R5C6'],
  ['R4C6', 'R5C5', 'R6C4', 'R7C5'],
  ['R4C5', 'R5C4', 'R6C3', 'R7C4'],
];

// The black dot drawn on the R2C8/R3C8 edge is the only ratio dot.
const blackDots = [['R2C8', 'R3C8']];
// This predicate is the explicit negative form of "all possible black dots".
const notRatio = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);
const graph = cellGraph('9x9');
const horizontalStarts = graph.cells().filter(cell => graph.step(cell, 0, 1));
const verticalStarts = graph.cells().filter(cell =>
  graph.step(cell, 1, 0) && cell !== 'R2C8');
const noOtherBlackDots = [
  // Replicate the horizontal and vertical negative dot rules over all unmarked edges.
  graph.makeReplicate(new Pair(notRatio, 'not 1:2 ratio', 'R1C1', 'R1C2'), horizontalStarts),
  graph.makeReplicate(new Pair(notRatio, 'not 1:2 ratio', 'R1C1', 'R2C1'), verticalStarts),
];

return [
  new Shape('9x9'),
  new Given('R6C8', 9),
  new Given('R9C1', 2),
  new Given('R9C8', 6),
  // Blue paths transcribed from the drawn blue lines.
  ...blueLines.map(cells => new RegionSumLine(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...noOtherBlackDots,
];
