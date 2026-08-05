// Title: Cornerstones
// Author: Jagga
// Video: https://www.youtube.com/watch?v=pG1WFfYIniA
// Source: https://app.crackingthecryptic.com/sudoku/f7PG9pDR78

// Encode normal Sudoku, the main diagonal, the grey even square, the drawn
// white and black dots, and the rule that every non-1:2-exception black-dot
// ratio is marked. White dots are not exhaustive.
const whiteDots = [
  ['R7C6', 'R7C7'], ['R7C1', 'R7C2'], ['R4C5', 'R5C5'],
  ['R3C6', 'R4C6'], ['R2C5', 'R3C5'],
];
const blackDots = [
  ['R5C9', 'R6C9'], ['R4C1', 'R5C1'], ['R7C2', 'R8C2'],
  ['R7C3', 'R8C3'], ['R2C3', 'R3C3'], ['R2C2', 'R3C2'],
  ['R2C7', 'R3C7'], ['R2C8', 'R3C8'], ['R1C5', 'R1C6'],
  ['R9C4', 'R9C5'], ['R7C7', 'R8C7'], ['R7C8', 'R8C8'],
];

// The dot positions are transcribed from the white and black edge marks.
const markedEdges = new Set([...whiteDots, ...blackDots]
  .map(([a, b]) => [a, b].sort().join(':')));
const graph = cellGraph('9x9');
const noBlackDotRatio = Pair.fnToKey((a, b) => a !== b * 2 && b !== a * 2, 9);
const unmarkedStarts = (height, width) => graph.cells().filter(cell => {
  const edge = graph.block(cell, height, width);
  return edge && !markedEdges.has([...edge].sort().join(':'));
});
const horizontalStarts = unmarkedStarts(1, 2);
const verticalStarts = unmarkedStarts(2, 1);
const repeatedNoRatio = (starts, height, width) => graph.makeReplicate(
  new Pair(noBlackDotRatio, 'unmarked non-ratio', ...graph.block('R1C1', height, width)),
  starts,
);

return [
  new Shape('9x9'),
  new Diagonal(-1),
  new Given('R9C8', 2, 4, 6, 8),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  // Each unmarked edge cannot be a black-dot ratio; marked white edges retain
  // the stated 1-2 exception through their WhiteDot constraint.
  repeatedNoRatio(horizontalStarts, 1, 2),
  repeatedNoRatio(verticalStarts, 2, 1),
];
