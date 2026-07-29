// Title: Fare thee well, Miss Carousel
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=48ml74I9FRM
// Source: https://sudokupad.app/F28G66PTLg

// Normal Sudoku rules apply. Each grey arrow's circle equals the sum of its
// shaft digits. Each drawn black-centred 2x2 dot equates the absolute
// differences across its two diagonals; dots are not exhaustive.
const arrows = [
  ['R1C4', 'R1C3', 'R2C3'], ['R2C5', 'R2C4', 'R3C4'],
  ['R6C2', 'R5C2', 'R6C3'], ['R9C2', 'R8C2', 'R9C3'],
  ['R4C4', 'R4C3', 'R5C4'], ['R7C4', 'R7C3', 'R8C4'],
  ['R5C8', 'R5C7', 'R6C8'], ['R4C6', 'R4C7', 'R5C6'],
  ['R6C9', 'R7C9', 'R7C8'], ['R3C7', 'R4C8'],
];

// The table records each dotted 2x2 square's top-left cell, from the drawn dots.
const dots = [
  'R1C3', 'R2C4', 'R4C3', 'R5C2', 'R7C3',
  'R8C2', 'R4C6', 'R6C8', 'R1C8',
];

const differenceDot = topLeft => {
  const { row, col } = parseCellId(topLeft);
  const tl = topLeft;
  const tr = makeCellId(row, col + 1);
  const bl = makeCellId(row + 1, col);
  const br = makeCellId(row + 1, col + 1);

  // |TL - BR| = |TR - BL| iff either diagonal pair has equal sums.
  return new Or([
    new EqualSum([tl, tr], [bl, br]),
    new EqualSum([tl, bl], [tr, br]),
  ]);
};

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...dots.map(differenceDot),
];
