// Title: Packing Problem
// Author: clover!
// Video: https://www.youtube.com/watch?v=OMqUAduLZfI
// Source: https://sudokupad.app/3esmd3dr55

// In each four-cell cage, one cell equals the sum of the other three.
// EqualSum compares the candidate total cell with the other three cells;
// it does not impose cage all-different, so repeats remain allowed.
function packingCage(cells) {
  return new Or(cells.map((sumCell, sumIndex) => new EqualSum(
    [sumCell],
    cells.filter((_, index) => index !== sumIndex),
  )));
}

const cages = [
  ['R3C3', 'R3C4', 'R4C3', 'R4C4'],
  ['R2C2', 'R2C3', 'R3C1', 'R3C2'],
  ['R1C5', 'R1C6', 'R1C7', 'R1C8'],
  ['R4C6', 'R4C7', 'R4C8', 'R4C9'],
  ['R1C9', 'R2C9', 'R3C8', 'R3C9'],
  ['R2C4', 'R2C5', 'R2C6', 'R3C5'],
  ['R5C2', 'R5C3', 'R6C2', 'R6C3'],
  ['R5C1', 'R6C1', 'R7C1', 'R8C1'],
  ['R5C7', 'R5C8', 'R6C8', 'R6C9'],
  ['R4C5', 'R5C5', 'R5C6', 'R6C5'],
  ['R7C4', 'R7C5', 'R7C6', 'R7C7'],
  ['R8C4', 'R8C5', 'R8C6', 'R8C7'],
  ['R8C2', 'R9C1', 'R9C2', 'R9C3'],
  ['R8C8', 'R8C9', 'R9C7', 'R9C8'],
];

return [
  new Shape('9x9'),
  ...cages.map(packingCage),
];
