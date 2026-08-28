// Title: Oct 31, 2021: LK Clone
// Author: clover!
// Video: https://www.youtube.com/watch?v=CcM3kud1pvU
// Source: https://tinyurl.com/6m8tw8v4

// Normal sudoku rules apply. Shapes of the same color are clones of each
// other: same-color shapes must hold identical digits in identical relative
// positions, with no rotation or reflection. Digits along a marked diagonal
// must sum to the value shown (little killer sums).
//
// The colored shapes are drawn as no-total cage outlines; the payload's cage
// entries carry no `value` and the rules never say "cage" or mention
// distinct/repeat digits within them, so the outlines are read as pure shape
// boundaries for the clone rule, not as an implicit distinct-digits cage.
// (Every shape's cells also already lie in one row, column, or box, so
// standard sudoku all-different would make an implicit cage rule redundant
// here regardless.)

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Each color's shapes, listed as same-orientation translations of one
// another (top-to-bottom, left-to-right) -- "no rotation or reflection"
// pins the correspondence to this direct positional reading.
const lavenderShapes = [
  ['R2C1', 'R2C2', 'R3C1', 'R3C2'],
  ['R1C7', 'R1C8', 'R2C7', 'R2C8'],
  ['R7C8', 'R7C9', 'R8C8', 'R8C9'],
  ['R8C2', 'R8C3', 'R9C2', 'R9C3'],
];
const goldShapes = [
  ['R2C4', 'R3C4', 'R4C4'],
  ['R6C6', 'R7C6', 'R8C6'],
];
const limegreenShapes = [
  ['R4C6', 'R4C7', 'R4C8'],
  ['R6C2', 'R6C3', 'R6C4'],
];

// One SameValues(2, a, b) per corresponding cell pair, per shape, against a
// reference shape (index 0) within its color. Equality is transitive, so
// pinning every other same-color shape to the reference enforces the whole
// group is identical without redundant pairwise cross-checks.
const cloneConstraints = (shapes) => {
  const [reference, ...rest] = shapes;
  return rest.flatMap(
    (shape) => reference.map((cell, i) => new SameValues(2, cell, shape[i])));
};

return [
  new Shape('9x9'),

  new Given('R2C6', 6),
  new Given('R3C5', 3),
  new Given('R5C1', 6),
  new Given('R5C9', 7),
  new Given('R7C5', 5),
  new Given('R8C4', 7),

  ...cloneConstraints(lavenderShapes),
  ...cloneConstraints(goldShapes),
  ...cloneConstraints(limegreenShapes),

  // Little killer diagonal sums, each keyed by its start cell (nearest the
  // off-grid clue) and inward direction, from the payload's littlekillersum
  // entries.
  LittleKiller.fromCells(3, graph.ray('R2C1', -1, 1), geometry),
  LittleKiller.fromCells(4, graph.ray('R1C8', 1, 1), geometry),
  LittleKiller.fromCells(5, graph.ray('R8C9', 1, -1), geometry),
  LittleKiller.fromCells(6, graph.ray('R9C2', -1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R7C9', 1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R1C7', 1, 1), geometry),
  LittleKiller.fromCells(14, graph.ray('R9C3', -1, -1), geometry),
  LittleKiller.fromCells(14, graph.ray('R3C1', -1, 1), geometry),
];
