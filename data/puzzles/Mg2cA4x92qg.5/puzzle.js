// Title: Mar 23 2022: PointingDifferent
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=Mg2cA4x92qg
// Source: https://tinyurl.com/svvz52bv

// Normal Sudoku rules apply. Each diagonal pointed at by an arrow contains
// the indicated number of distinct digits. The payload draws 8 arrows as
// `littlekillersum` entries, but their `value` is a distinct-digit count,
// not a sum (per the rules text, which overrides the little-killer-sum UI
// element's usual meaning). Two arrows point at the same main diagonal from
// opposite ends; the other six form three mirrored pairs of shorter
// diagonals that are pairwise distinct from each other. All 8 arrows are
// encoded, including the redundant main-diagonal pair.

const graph = cellGraph('9x9');

// Each entry: [cells along the diagonal, arrow's distinct-digit count].
// Cell lists and values transcribed from the puzzle's drawn diagonal-arrow
// clues (each arrow's printed number and the diagonal it points along).
const diagonals = [
  [['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'], 5],
  [['R9C9', 'R8C8', 'R7C7', 'R6C6', 'R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C1'], 5],
  [['R1C3', 'R2C4', 'R3C5', 'R4C6', 'R5C7', 'R6C8', 'R7C9'], 2],
  [['R9C7', 'R8C6', 'R7C5', 'R6C4', 'R5C3', 'R4C2', 'R3C1'], 2],
  [['R2C9', 'R3C8', 'R4C7', 'R5C6', 'R6C5', 'R7C4', 'R8C3', 'R9C2'], 4],
  [['R8C1', 'R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7', 'R1C8'], 4],
  [['R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5'], 2],
  [['R5C1', 'R4C2', 'R3C3', 'R2C4', 'R1C5'], 2],
];

// One aux Var per arrow holds its printed distinct-digit count; CountDistinct
// ties that control cell to the count of distinct digits among the diagonal
// cells (control cell first, per its constructor).
const counts = new Var('D', 'arrow distinct-digit counts', diagonals.length);
const arrowConstraints = diagonals.flatMap(([cells, value], i) => {
  const control = counts.cell(i + 1);
  return [
    new Given(control, value),
    new CountDistinct(control, ...cells),
  ];
});

const givens = [
  ['R1C3', 2], ['R1C7', 1], ['R3C9', 8],
  ['R4C3', 4], ['R4C6', 1], ['R4C9', 7],
  ['R5C5', 5],
  ['R6C1', 7], ['R6C4', 9], ['R6C7', 6],
  ['R7C1', 3],
  ['R9C3', 9], ['R9C7', 8],
];

return [
  new Shape('9x9'),
  counts,
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...arrowConstraints,
];
