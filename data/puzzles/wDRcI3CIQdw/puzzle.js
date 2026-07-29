// Title: Zebediah Killgrave
// Author: starwarigami
// Video: https://www.youtube.com/watch?v=wDRcI3CIQdw
// Source: https://sudokupad.app/nnf5fqru6z

// Normal Sudoku. Digits do not repeat in an outlined cage. On each lavender
// path, equally distant cage totals add to the total of its central cage. R6C3
// is even.
const cageCells = [
  ['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'],
  ['R8C9', 'R9C9'], ['R8C1', 'R9C1'], ['R8C2', 'R8C3', 'R8C4'],
  ['R8C5', 'R8C6'], ['R8C7', 'R8C8'], ['R7C1', 'R7C2'], ['R7C9'],
  ['R7C3'], ['R7C4', 'R7C5', 'R7C6', 'R7C7'], ['R7C8'],
  ['R5C9', 'R6C8', 'R6C9'], ['R5C1', 'R6C1', 'R6C2'],
  ['R2C9', 'R3C9', 'R4C9'], ['R3C1', 'R4C1'],
  ['R3C2', 'R4C2', 'R4C3', 'R5C2', 'R5C3'], ['R5C4'], ['R4C4'],
  ['R4C5'], ['R2C1'], ['R1C1', 'R1C2', 'R2C2'], ['R1C3', 'R2C3'],
  ['R1C5', 'R2C5'], ['R1C7', 'R2C6', 'R2C7'], ['R1C8'],
  ['R2C8', 'R3C8'], ['R4C8', 'R5C7', 'R5C8'], ['R4C7'],
  ['R3C3', 'R3C4'], ['R3C5'], ['R3C6', 'R4C6'], ['R5C5', 'R5C6'],
  ['R1C4', 'R2C4'], ['R6C4', 'R6C5', 'R6C6', 'R6C7'], ['R6C3'],
];

// Cage indexes follow the lavender paths drawn over the outlined cages.
const lavenderPaths = [
  [21, 20, 19], [32, 28, 29, 30, 31], [24, 23, 22],
  [27, 26, 25], [18, 17, 16], [33, 15, 34],
  [14, 12, 8, 9, 10, 11, 13], [7, 5, 4, 3, 6], [2, 0, 1],
];

// For every mirrored pair, the combined outer cages form one EqualSum segment
// and the central cage forms the other.
const lavenderSums = lavenderPaths.flatMap((path) => {
  const middle = (path.length - 1) / 2;
  return path.slice(0, middle).map((left, index) => new EqualSum(
    [...cageCells[left], ...cageCells[path[path.length - 1 - index]]],
    cageCells[path[middle]],
  ));
});

return [
  new Shape('9x9'),
  ...cageCells.filter((cells) => cells.length > 1).map((cells) => new AllDifferent(...cells)),
  ...lavenderSums,
  new Given('R6C3', 2, 4, 6, 8),
];
