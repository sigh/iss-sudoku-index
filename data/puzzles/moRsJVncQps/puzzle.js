// Title: Counting Killer Cells
// Author: Sir Algee
// Video: https://www.youtube.com/watch?v=moRsJVncQps
// Source: https://sudokupad.app/zxy9eyqoob

// 9x9 anti-knight. Killer cages (some with sums, some without). Letter cages are
// singletons that share a digit. Global counting: across the 45 caged cells each
// digit d appears exactly d times.

// Killer cages with a given sum.
const sumCages = [
  [9,  ['R6C2', 'R7C2', 'R7C3']],
  [22, ['R1C3', 'R1C4', 'R2C4']],
  [45, ['R2C6', 'R3C4', 'R3C5', 'R3C6', 'R4C6', 'R4C7', 'R4C8', 'R5C7', 'R6C7']],
  [16, ['R1C1', 'R2C1', 'R3C1']],
  [33, ['R1C8', 'R1C9', 'R2C8', 'R3C7', 'R3C8']],
  [28, ['R5C8', 'R5C9', 'R6C9', 'R7C9']],
  [20, ['R7C6', 'R8C5', 'R8C6']],
];

// Cages with no given sum (distinct digits only).
const noSumCages = [
  ['R8C1', 'R8C2', 'R9C2'],
  ['R5C2', 'R5C3'],
  ['R2C2', 'R2C3'],
  ['R5C4'],
];

// Letter cages: singletons sharing a letter must hold the same digit.
const letterCages = [
  ['R7C8', 'R9C1'],           // X
  ['R6C6', 'R7C5', 'R4C2'],   // Y
  ['R9C5', 'R1C6'],           // Z
];

// The union of every caged cell (rules 3, 4, 5) = 45 cells.
const countedCells = [
  ...sumCages.flatMap(([, cells]) => cells),
  ...noSumCages.flat(),
  ...letterCages.flat(),
];
if (countedCells.length !== 45) {
  throw new Error(`expected 45 caged cells, got ${countedCells.length}`);
}
if (new Set(countedCells).size !== 45) {
  throw new Error('caged cells are not distinct');
}

const sumCageConstraints = sumCages.map(([sum, cells]) => new Cage(sum, ...cells));

const noSumCageConstraints = noSumCages
  .filter(cells => cells.length > 1)
  .map(cells => new AllDifferent(...cells));

const letterCageConstraints = letterCages.map(cells =>
  // Singletons sharing a letter hold the same digit (one set per cell).
  new SameValues(cells.length, ...cells)
);

// Counting rule: digit d appears exactly d times among the 45 cells.
const countingConstraints = Array.from({ length: 9 }, (_, i) => {
  const d = i + 1;
  const values = Array(d).fill(d).join('_');
  return new ContainExact(values, ...countedCells);
});

return [
  new Shape('9x9'),
  new AntiKnight(),

  ...sumCageConstraints,

  ...noSumCageConstraints,

  ...letterCageConstraints,

  ...countingConstraints,
];
