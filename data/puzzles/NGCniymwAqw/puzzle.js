// Title: Where are the Black Dots?
// Author: Eric Fox
// Video: https://www.youtube.com/watch?v=NGCniymwAqw
// Source: https://app.crackingthecryptic.com/webapp/n9tJ4Gd8JM

// Normal sudoku. White dots mark consecutive-digit pairs; not every consecutive
// pair need be dotted (dot absence is not information). Separately, no
// orthogonally adjacent pair anywhere in the grid may hold a 1:2 ratio, whether
// or not it carries a dot -- the rules text says the ratio ban holds "even if
// separated by a dot", so it applies to every adjacency, dotted or not.

// Dot pairs, provenance: the 21 drawn white (Kropki) dot marks.
const whiteDots = [
  ['R4C1', 'R4C2'], ['R4C2', 'R4C3'], ['R4C1', 'R5C1'], ['R5C1', 'R6C1'],
  ['R9C1', 'R9C2'], ['R9C2', 'R9C3'], ['R8C3', 'R9C3'], ['R7C3', 'R8C3'],
  ['R7C4', 'R8C4'], ['R7C5', 'R8C5'], ['R7C6', 'R8C6'], ['R7C8', 'R8C8'],
  ['R7C9', 'R8C9'], ['R5C9', 'R6C9'], ['R5C7', 'R6C7'], ['R4C6', 'R5C6'],
  ['R5C6', 'R6C6'], ['R6C5', 'R6C6'], ['R6C4', 'R6C5'], ['R5C4', 'R6C4'],
  ['R4C4', 'R5C4'],
];

// Global 1:2-ratio ban over every orthogonal adjacency in the grid (not just
// the undotted ones -- the rule explicitly extends the ban onto dotted pairs
// too, so it is applied uniformly rather than scoped to absence like a
// StrictKropki-style exhaustiveness clause).
const graph = cellGraph('9x9');
const noRatio = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);
const adjacentStarts = (dRow, dCol) =>
  graph.cells().filter(cell => graph.step(cell, dRow, dCol) !== null);
const noRatioAnywhere = [
  graph.makeReplicate(
    new Pair(noRatio, 'no 1:2 ratio', 'R1C1', 'R1C2'),
    adjacentStarts(0, 1),
  ),
  graph.makeReplicate(
    new Pair(noRatio, 'no 1:2 ratio', 'R1C1', 'R2C1'),
    adjacentStarts(1, 0),
  ),
];

return [
  new Shape('9x9'),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...noRatioAnywhere,
];
