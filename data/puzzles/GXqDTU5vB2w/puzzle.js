// Title: Irregular Sudoku
// Author: Philipp Blume
// Video: https://www.youtube.com/watch?v=GXqDTU5vB2w
// Source: https://cracking-the-cryptic.web.app/sudoku/tgdDf3b9GL

// Standard row/column all-different plus 9 irregular (jigsaw) regions of 9
// cells each in place of the usual 3x3 boxes: each row, column, and region
// contains 1-9. The rules describe the regions as coloured white or grey
// ("each outlined white area and each connected grey area also contains
// each of 1-9"), but the grey-shaded cells exactly match two of the nine
// drawn regions cell-for-cell (regions 3 and 8 below), so the colour split
// names every region once rather than adding a distinct overlapping group.

const SHAPE = '9x9';

const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R4C1'],
  ['R4C2', 'R4C3', 'R5C1', 'R5C2', 'R6C1', 'R7C1', 'R8C1', 'R8C2', 'R9C1'],
  ['R3C2', 'R3C3', 'R3C4', 'R4C4', 'R5C3', 'R6C2', 'R7C2', 'R7C3', 'R7C4'],
  ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C4', 'R2C5', 'R2C9', 'R3C5'],
  ['R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R7C6'],
  ['R7C5', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R9C2', 'R9C3', 'R9C4', 'R9C5'],
  ['R2C6', 'R2C7', 'R2C8', 'R3C6', 'R3C7', 'R3C8', 'R3C9', 'R4C8', 'R4C9'],
  ['R4C6', 'R4C7', 'R5C7', 'R6C7', 'R7C7', 'R8C7', 'R9C6', 'R9C7', 'R9C8'],
  ['R5C8', 'R5C9', 'R6C8', 'R6C9', 'R7C8', 'R7C9', 'R8C8', 'R8C9', 'R9C9'],
];

// The 17 given digits.
const givens = [
  new Given('R1C6', 6),
  new Given('R1C8', 9),
  new Given('R2C2', 2),
  new Given('R2C7', 3),
  new Given('R3C1', 5),
  new Given('R3C9', 6),
  new Given('R4C3', 7),
  new Given('R4C4', 2),
  new Given('R5C5', 4),
  new Given('R6C6', 3),
  new Given('R6C7', 1),
  new Given('R7C1', 4),
  new Given('R7C9', 5),
  new Given('R8C3', 9),
  new Given('R8C8', 8),
  new Given('R9C2', 7),
  new Given('R9C4', 8),
];

return [
  new Shape(SHAPE),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw(SHAPE, ...cells)),
  ...givens,
];
