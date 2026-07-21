// Title: Six Seven
// Author: Scott Williams
// Video: https://www.youtube.com/watch?v=nI0Z4lF_3-8
// Source: https://sudokupad.app/jrnrm1a25q

// Normal sudoku and anti-knight rules apply. Orthogonally adjacent cells may
// not sum to 5 or 10. The nine drawn blue strokes join into one branched
// network; box borders split that network into the twelve equal-sum segments
// listed below.

const blueSegments = [
  ['R1C2', 'R2C1', 'R3C1', 'R3C2', 'R3C3'],
  ['R1C5', 'R2C4', 'R2C5'],
  ['R1C9', 'R2C9', 'R3C7', 'R3C8'],
  ['R3C5', 'R3C6'],
  ['R4C2', 'R4C3', 'R5C3', 'R6C3'],
  ['R4C7', 'R5C7', 'R5C8', 'R6C7', 'R6C8'],
  ['R5C1', 'R5C2', 'R6C1'],
  ['R5C4', 'R5C5', 'R6C5', 'R6C6'],
  ['R5C9', 'R6C9'],
  ['R7C2', 'R8C2', 'R9C3'],
  ['R7C4', 'R7C5', 'R7C6', 'R8C5'],
  ['R7C8', 'R8C7'],
];

const graph = cellGraph('9x9');
const notFiveOrTen = Pair.fnToKey(
  (a, b) => a + b !== 5 && a + b !== 10,
  9,
);
const horizontalStarts = graph.cells().filter(cell => parseCellId(cell).col < 9);
const verticalStarts = graph.cells().filter(cell => parseCellId(cell).row < 9);

const noForbiddenAdjacentSum = [
  graph.makeReplicate(
    new Pair(notFiveOrTen, 'adjacent sum is neither 5 nor 10', 'R1C1', 'R1C2'),
    horizontalStarts,
  ),
  graph.makeReplicate(
    new Pair(notFiveOrTen, 'adjacent sum is neither 5 nor 10', 'R1C1', 'R2C1'),
    verticalStarts,
  ),
];

return [
  new Shape('9x9'),
  new Given('R1C5', 6),
  new Given('R5C6', 7),
  new Given('R6C4', 6),
  new Given('R7C1', 6),
  new Given('R7C3', 7),
  new Given('R9C8', 7),
  new AntiKnight(),
  ...noForbiddenAdjacentSum,
  new EqualSum(...blueSegments),
];
