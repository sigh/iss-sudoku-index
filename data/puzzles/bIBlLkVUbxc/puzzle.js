// Title: Overflow
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=bIBlLkVUbxc
// Source: https://sudokupad.app/m7fj6dp5si

// Normal Sudoku; digits do not repeat within a cage. Each printed cage total is
// its digit sum plus the sum of exactly the digits absent from every drawn cage.
const cages = [
  [44, ['R6C5', 'R7C4', 'R7C5', 'R7C6', 'R8C4', 'R8C6']],
  [16, ['R4C5']],
  [16, ['R1C5', 'R2C5']],
  [17, ['R3C1', 'R4C1', 'R5C1']],
  [23, ['R8C2', 'R9C1', 'R9C2']],
  [26, ['R7C3', 'R8C3', 'R9C3']],
  [23, ['R7C8', 'R7C9']],
  [26, ['R8C9', 'R9C7', 'R9C8', 'R9C9']],
  [28, ['R4C4', 'R5C3', 'R5C4']],
  [17, ['R4C6', 'R5C6', 'R5C7']],
  [20, ['R2C3', 'R2C4', 'R3C3']],
  [25, ['R3C9', 'R4C9', 'R5C9']],
  [30, ['R2C6', 'R2C7', 'R3C7']],
]; // Drawn cage totals and cell lists.
const cagedCells = cages.flatMap(([, cells]) => cells);

// These are every digit set whose sum can be the shared overflow under the
// cage-size bounds. A branch excludes that set from all cages and requires every
// remaining digit to occur in at least one cage, making it exactly the absent set.
const overflowSets = [
  [1, 2, 4], [3, 4], [1, 3, 4], [2, 3, 4], [1, 2, 3, 4],
  [2, 5], [1, 2, 5], [3, 5], [1, 3, 5], [2, 3, 5], [1, 2, 3, 5],
  [4, 5], [1, 4, 5], [2, 4, 5], [1, 6], [2, 6], [1, 2, 6], [3, 6],
  [1, 3, 6], [2, 3, 6], [4, 6], [1, 4, 6], [5, 6], [7], [1, 7],
  [2, 7], [1, 2, 7], [3, 7], [1, 3, 7], [4, 7], [8], [1, 8],
  [2, 8], [1, 2, 8], [3, 8], [9], [1, 9], [2, 9], [1, 2, 9], [3, 9],
];
const overflowCases = overflowSets.map(missing => {
  const overflow = missing.reduce((sum, digit) => sum + digit, 0);
  const present = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(digit => !missing.includes(digit));
  return new And([
    ...cages.map(([total, cells]) => new Cage(total - overflow, ...cells)),
    ...cagedCells.map(cell => new Given(cell, ...present)),
    new ContainAtLeast(present.join('_'), ...cagedCells),
  ]);
});

return [
  new Shape('9x9'),
  new Or(overflowCases),
  // The two drawn comparison signs point to their smaller endpoint.
  new GreaterThan('R6C9', 'R6C8'),
  new GreaterThan('R8C8', 'R8C9'),
];
