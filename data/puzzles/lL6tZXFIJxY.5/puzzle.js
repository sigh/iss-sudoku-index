// Title: 2/7: Waking Up is Hard to Do
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=lL6tZXFIJxY
// Source: https://tinyurl.com/yyahfx6r

// Standard sudoku. No two orthogonally-adjacent cells may both hold an even
// digit. Encoded as one negated-predicate Pair per grid edge, replicated by
// direction since the relation is the same translated constraint on every
// horizontal and every vertical edge.
const graph = cellGraph('9x9');
const notBothEven = Pair.fnToKey((a, b) => !(a % 2 === 0 && b % 2 === 0), 9);

const horizontalStarts = graph.cells().filter(c => graph.step(c, 0, 1));
const verticalStarts = graph.cells().filter(c => graph.step(c, 1, 0));

return [
  new Shape('9x9'),
  new Given('R1C4', 3), new Given('R1C7', 1),
  new Given('R2C4', 2), new Given('R2C5', 1),
  new Given('R3C1', 3), new Given('R3C7', 6),
  new Given('R4C8', 8), new Given('R4C9', 1),
  new Given('R5C2', 3), new Given('R5C5', 5), new Given('R5C8', 9),
  new Given('R6C1', 5), new Given('R6C2', 4),
  new Given('R7C3', 2), new Given('R7C9', 7),
  new Given('R8C5', 7), new Given('R8C6', 6),
  new Given('R9C3', 9), new Given('R9C6', 5),
  graph.makeReplicate(
    new Pair(notBothEven, 'no adjacent evens', 'R1C1', 'R1C2'),
    horizontalStarts,
  ),
  graph.makeReplicate(
    new Pair(notBothEven, 'no adjacent evens', 'R1C1', 'R2C1'),
    verticalStarts,
  ),
];
