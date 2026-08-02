// Title: Coordinate Sudoku
// Author: Walker
// Video: https://www.youtube.com/watch?v=Mmz5bSZWA-s
// Source: https://tinyurl.com/33sjz2tp

// Standard 9x9 Sudoku with the source givens. Each three-cell pill is X,Y,Z
// left to right and requires the grid cell R{X}C{Y} to equal Z.
const givens = [
  ['R1C1', 9], ['R1C8', 1], ['R1C9', 5],
  ['R2C2', 5], ['R2C3', 4], ['R2C4', 3],
  ['R4C1', 6], ['R4C2', 9], ['R5C3', 5], ['R5C7', 4],
  ['R6C7', 8], ['R6C8', 7], ['R8C5', 2], ['R8C6', 5], ['R8C8', 9],
  ['R9C1', 2], ['R9C2', 7], ['R9C9', 8],
];

// Each alternative fixes X and Y, then equates Z with the corresponding grid cell.
function coordinatePill(x, y, z) {
  return new Or(Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, col) => new And([
      new Given(x, row + 1),
      new Given(y, col + 1),
      new SameValues(2, z, makeCellId(row + 1, col + 1)),
    ]))
  ).flat());
}

const pills = [
  ['R2C3', 'R2C4', 'R2C5'],
  ['R2C6', 'R2C7', 'R2C8'],
  ['R4C1', 'R4C2', 'R4C3'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R6C7', 'R6C8', 'R6C9'],
  ['R8C2', 'R8C3', 'R8C4'],
  ['R8C5', 'R8C6', 'R8C7'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...pills.map(([x, y, z]) => coordinatePill(x, y, z)),
];
