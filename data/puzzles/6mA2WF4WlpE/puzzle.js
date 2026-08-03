// Title: Anti Ratio Miracle
// Author: Jobo
// Video: https://www.youtube.com/watch?v=6mA2WF4WlpE
// Source: https://app.crackingthecryptic.com/sudoku/6QfQ4hB79q

// Rules encoded: normal sudoku (default Shape row/column/box); anti-ratio
// between every orthogonally adjacent pair (a Pair predicate, since ISS has
// no built-in ratio class); a modular sequence {1,4,7}/{2,5,8}/{3,6,9} across
// every horizontal 3-cell run inside a box (built-in Modular(3, ...)); an
// entropic sequence {1,2,3}/{4,5,6}/{7,8,9} down every vertical 3-cell run
// inside a box (built-in Entropic(...)); no 3 in a grid corner.

const graph = cellGraph();

// Allowed-pair predicate for the anti-ratio rule: forbidden exactly when the
// larger digit is an integer multiple of the smaller by a factor of 2..5
// (a 1:2, 1:3, 1:4, or 1:5 ratio). Symmetric in (a, b) via min/max.
const ratioAllowed = (a, b) => {
  const lo = Math.min(a, b), hi = Math.max(a, b);
  const factor = hi / lo;
  return !(Number.isInteger(factor) && factor >= 2 && factor <= 5);
};
const ratioKey = Pair.fnToKey(ratioAllowed, 9);

// One Replicate per edge direction: the template Pair (R1C1 and its right,
// or down, neighbour) is shifted onto every origin cell that has such a
// neighbour, covering every horizontal/vertical grid edge exactly once.
const rightOfR1C1 = graph.step('R1C1', 0, 1);
const downOfR1C1 = graph.step('R1C1', 1, 0);
const antiRatioRight = graph.makeReplicate(
  new Pair(ratioKey, '', 'R1C1', rightOfR1C1),
  graph.cells().filter(c => graph.step(c, 0, 1)));
const antiRatioDown = graph.makeReplicate(
  new Pair(ratioKey, '', 'R1C1', downOfR1C1),
  graph.cells().filter(c => graph.step(c, 1, 0)));

// Each box's 9 cells, row-major (3 rows of 3), per cellGraph().boxes().
const boxes = graph.boxes();

// Modular sequence: one triple per box row.
const modularRows = boxes.flatMap(box => [
  new Modular(3, box[0], box[1], box[2]),
  new Modular(3, box[3], box[4], box[5]),
  new Modular(3, box[6], box[7], box[8]),
]);

// Entropic sequence: one triple per box column.
const entropicCols = boxes.flatMap(box => [
  new Entropic(box[0], box[3], box[6]),
  new Entropic(box[1], box[4], box[7]),
  new Entropic(box[2], box[5], box[8]),
]);

// No 3 in a grid corner: a restricted Given at each of the 4 corners.
const noThreeInCorner = ['R1C1', 'R1C9', 'R9C1', 'R9C9'].map(cell =>
  new Given(cell, 1, 2, 4, 5, 6, 7, 8, 9));

return [
  new Shape('9x9'),
  new Given('R3C6', 4),
  new Given('R4C7', 2),
  new Given('R6C5', 1),
  ...noThreeInCorner,
  antiRatioRight,
  antiRatioDown,
  ...modularRows,
  ...entropicCols,
];
