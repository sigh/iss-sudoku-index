// Title: Quiet Room
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=_M5lRitViHo
// Source: https://sudokupad.app/mea9u6amrt

// Normal sudoku. Along each line occupying N cells, every pair of adjacent
// digits on the line differs by at least N. A black dot between two cells
// means one digit is double the other.

const linePaths = [
  ['R9C2', 'R8C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7', 'R3C8', 'R2C9'],
  ['R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9'],
  ['R6C6', 'R5C7', 'R4C8', 'R3C9'],
  ['R6C9', 'R7C8', 'R8C7', 'R9C6'],
  ['R4C1', 'R3C2', 'R2C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7'],
  ['R9C3', 'R8C4', 'R7C5'],
  ['R6C1', 'R5C2', 'R4C3'],
  ['R7C1', 'R6C2'],
];

function lineGapConstraints(path) {
  const minimumDifference = path.length;
  const key = Pair.fnToKey((a, b) => Math.abs(a - b) >= minimumDifference, 9);
  const label = `adjacent line digits differ by at least ${minimumDifference}`;
  const constraints = [];
  for (let i = 0; i < path.length - 1; i++) {
    constraints.push(new Pair(key, label, path[i], path[i + 1]));
  }
  return constraints;
}

return [
  new Shape('9x9'),
  ...linePaths.flatMap(lineGapConstraints),
  new BlackDot('R1C8', 'R1C9'),
  new BlackDot('R2C6', 'R2C7'),
];
