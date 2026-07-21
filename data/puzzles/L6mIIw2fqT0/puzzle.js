// Title: Iteration
// Author: damo_89
// Video: https://www.youtube.com/watch?v=L6mIIw2fqT0
// Source: https://sudokupad.app/lldn0vubxi

// Normal sudoku rules apply.
//
// Coordinate arrows: each [shaft, tip] pair contains the row and column of
// a target cell whose digit is their sum. Every arrow has a different target.

const arrows = [
  ['R7C4', 'R8C4'],
  ['R7C5', 'R8C5'],
  ['R7C6', 'R8C6'],
  ['R9C5', 'R9C6'],
  ['R9C7', 'R8C7'],
  ['R9C8', 'R8C8'],
  ['R9C9', 'R8C9'],
  ['R6C8', 'R7C7'],
  ['R9C1', 'R9C2'],
  ['R6C2', 'R5C3'],
  ['R3C5', 'R2C6'],
  ['R5C1', 'R4C1'],
  ['R6C4', 'R6C5'],
];

// Enumerate the 36 possible coordinates whose row + column is a digit.
// If the target is an endpoint, its required value contradicts that
// endpoint's coordinate value, so that branch is omitted.
const coordinateArrow = ([rowCell, columnCell]) => new Or(
  Array.from({ length: 9 }, (_, i) => i + 1).flatMap(row =>
    Array.from({ length: 9 - row }, (_, i) => i + 1).flatMap(column => {
      const target = makeCellId(row, column);
      if (target === rowCell || target === columnCell) return [];
      return [new And([
        new Given(rowCell, row),
        new Given(columnCell, column),
        new Given(target, row + column),
      ])];
    })),
);

// Two coordinate pairs differ when at least their row or their column differs.
const distinctTargets = arrows.flatMap(([rowA, columnA], i) =>
  arrows.slice(i + 1).map(([rowB, columnB]) => new Or([
    new AllDifferent(rowA, rowB),
    new AllDifferent(columnA, columnB),
  ])));

return [
  new Shape('9x9'),
  new Given('R5C5', 6),
  ...arrows.map(coordinateArrow),
  ...distinctTargets,
];
