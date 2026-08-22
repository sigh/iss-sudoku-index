// Title: X Marks (all) The Black Dots
// Author: twototenth
// Video: https://www.youtube.com/watch?v=S1MAZSXbhGo
// Source: https://app.crackingthecryptic.com/sudoku/fJNFQHTNBj

// Normal sudoku on the 9x9 grid, standard 3x3 boxes, no givens.
// Black dot: the two cells are in a 1:2 ratio (ISS `BlackDot`).
// X: the two cells sum to 10 (ISS `X`).
// "ALL black dots and Xs are given": every orthogonally adjacent pair that
// carries neither mark has neither relation, i.e. is not in a 1:2 ratio and
// does not sum to 10. Only black dots and X are used in this ruleset (no
// white dots, no V), so the negative is scoped to those two relations rather
// than the full StrictKropki/StrictXV families.

// Black dot pairs, transcribed from the filled black edge overlays.
const dotPairs = [
  ['R1C4', 'R1C5'],
  ['R3C3', 'R3C4'],
  ['R6C2', 'R7C2'],
  ['R7C2', 'R7C3'],
  ['R5C5', 'R6C5'],
  ['R4C5', 'R4C6'],
  ['R2C6', 'R2C7'],
  ['R4C8', 'R5C8'],
  ['R6C8', 'R6C9'],
  ['R7C6', 'R7C7'],
  ['R8C6', 'R8C7'],
  ['R8C8', 'R9C8'],
];

// X pairs, transcribed from the "X" edge overlays.
const xPairs = [
  ['R1C6', 'R2C6'],
  ['R1C7', 'R2C7'],
  ['R3C6', 'R3C7'],
  ['R2C8', 'R3C8'],
  ['R4C8', 'R4C9'],
  ['R5C7', 'R5C8'],
  ['R6C7', 'R6C8'],
  ['R5C9', 'R6C9'],
  ['R5C5', 'R5C6'],
  ['R6C2', 'R6C3'],
  ['R6C3', 'R7C3'],
  ['R8C1', 'R8C2'],
  ['R8C8', 'R8C9'],
  ['R9C8', 'R9C9'],
];

const edgeKey = ([a, b]) => [a, b].sort().join('-');
const markedEdges = new Set([...dotPairs, ...xPairs].map(edgeKey));

const graph = cellGraph('9x9');
const allEdges = [...graph.rows(), ...graph.columns()].flatMap(house =>
  house.slice(1).map((cell, index) => [house[index], cell]));
const unmarkedEdges = allEdges.filter(edge => !markedEdges.has(edgeKey(edge)));
const horizontalUnmarked = unmarkedEdges.filter(([a, b]) =>
  parseCellId(a).row === parseCellId(b).row);
const verticalUnmarked = unmarkedEdges.filter(([a, b]) =>
  parseCellId(a).col === parseCellId(b).col);

// Combined negative for an unmarked edge: not a 1:2 ratio and not summing
// to 10.
const notDotNotX = Pair.fnToKey(
  (a, b) => a !== 2 * b && b !== 2 * a && a + b !== 10, 9);

return [
  new Shape('9x9'),
  ...dotPairs.map(pair => new BlackDot(...pair)),
  ...xPairs.map(pair => new X(...pair)),
  graph.makeReplicate(
    new Pair(notDotNotX, 'not a black dot ratio and not an X sum', 'R1C1', 'R1C2'),
    horizontalUnmarked.map(edge => edge[0]),
  ),
  graph.makeReplicate(
    new Pair(notDotNotX, 'not a black dot ratio and not an X sum', 'R1C1', 'R2C1'),
    verticalUnmarked.map(edge => edge[0]),
  ),
];
