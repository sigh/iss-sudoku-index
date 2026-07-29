// Title: Killer Octopus
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=Ov2gzOS31d8
// Source: https://sudokupad.app/d7siz7tehr

// Standard Sudoku and the four drawn killer sums are encoded. The Octopus line
// construction and its Same Difference rules are omitted: only R5C5's circle,
// not any line geometry, is present in the source payload.
// Cage cells and totals are transcribed from the drawn killer cages.
const cages = [
  [11, ['R3C4', 'R3C5', 'R3C6']],
  [14, ['R6C3', 'R7C3']],
  [14, ['R6C7', 'R7C7']],
  [5, ['R8C8', 'R9C8']],
];

return [
  new Shape('9x9'),
  ...cages.map(([total, cells]) => new Sum(total, ...cells)),
];
