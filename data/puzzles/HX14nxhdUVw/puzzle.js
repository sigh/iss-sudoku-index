// Title: Eye of the Storm
// Author: Leyrann
// Video: https://www.youtube.com/watch?v=HX14nxhdUVw
// Source: https://app.crackingthecryptic.com/sudoku/GGH6bDd2dG

// Normal sudoku. Digits cannot repeat in a cage; cages show their sums. Along
// a spiral, there is no repeated digit in any pair of successive cages.
// Inequality signs point to the smaller number. Nothing is omitted.

// Cages, transcribed from the drawn cages and their printed totals.
const cages = [
  { sum: 22, cells: ['R1C1', 'R1C2', 'R1C3', 'R1C4'] },
  { sum: 17, cells: ['R1C7', 'R1C8', 'R1C9'] },
  { sum: 16, cells: ['R2C4', 'R2C5', 'R2C6'] },
  { sum: 14, cells: ['R2C8', 'R2C9', 'R3C9', 'R4C9'] },
  { sum: 19, cells: ['R3C3', 'R3C4', 'R3C5', 'R3C6'] },
  { sum: 22, cells: ['R4C4', 'R4C5', 'R4C6', 'R5C4'] },
  { sum: 22, cells: ['R5C6', 'R6C4', 'R6C5', 'R6C6'] },
  { sum: 13, cells: ['R6C8', 'R7C8', 'R8C8'] },
  { sum: 14, cells: ['R8C9', 'R9C8', 'R9C9'] },
  { sum: 15, cells: ['R6C2', 'R7C2'] },
  { sum: 14, cells: ['R6C1', 'R7C1', 'R8C1', 'R8C2'] },
  { sum: 28, cells: ['R9C1', 'R9C2', 'R9C3', 'R9C4'] },
  { sum: 7, cells: ['R8C5', 'R8C6'] },
  { sum: 20, cells: ['R7C4', 'R7C5', 'R7C6'] },
];

// The blue centre cell: the "eye" the title names. It is in no cage.
const eye = 'R5C5';

// The 40 light-grey shaded cells, in the order they are drawn. Consecutive
// entries are orthogonally adjacent, so the shading is one path: an arm of the
// spiral, winding out from beside the eye to R1C9.
const shadedArm = [
  'R5C6', 'R6C6', 'R6C5', 'R6C4', 'R6C3', 'R5C3', 'R4C3', 'R3C3', 'R3C4',
  'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8',
  'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R8C2', 'R8C1', 'R7C1', 'R6C1',
  'R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5',
  'R1C6', 'R1C7', 'R1C8', 'R1C9',
];

// The other arm: the 40 cells left over once the shaded arm and the eye are
// removed, i.e. the corridor running between the shaded windings. Like the
// shaded arm it is one orthogonally-connected path, listed here from the eye's
// other free neighbour (R5C4) outwards to R9C1. It carries no shading of its
// own; it is read as an arm of the same spiral because the seven cages that
// touch no shaded cell each occupy a contiguous run of exactly these cells,
// the same way the other seven sit on the shaded arm.
const unshadedArm = [
  'R5C4', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R5C7', 'R6C7', 'R7C7', 'R7C6',
  'R7C5', 'R7C4', 'R7C3', 'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C2',
  'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9', 'R3C9', 'R4C9',
  'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5',
  'R9C4', 'R9C3', 'R9C2', 'R9C1',
];

// The two arms meet at the eye, so the spiral traverses all 81 cells once:
// in along the unshaded arm, through the eye, out along the shaded arm.
const spiral = [...unshadedArm].reverse().concat(eye, shadedArm);

// Walk the spiral and list the cages it enters, in order. Successive cages are
// then adjacent entries of that list.
const cellToCage = new Map();
cages.forEach((cage, i) => cage.cells.forEach(cell => cellToCage.set(cell, i)));

const cageOrder = [];
for (const cell of spiral) {
  const i = cellToCage.get(cell);
  if (i !== undefined && cageOrder[cageOrder.length - 1] !== i) cageOrder.push(i);
}

const successiveCagePairs = cageOrder.slice(1).map(
  (i, k) => new AllDifferent(...cages[cageOrder[k]].cells, ...cages[i].cells));

return [
  new Shape('9x9'),

  ...cages.map(cage => new Cage(cage.sum, ...cage.cells)),

  ...successiveCagePairs,

  // Each chevron has its two open ends in one cell and its point in the
  // neighbouring cell; the point marks the smaller number.
  new GreaterThan('R2C2', 'R2C3'),  // point in R2C3
  new GreaterThan('R2C5', 'R2C4'),  // point in R2C4
];
