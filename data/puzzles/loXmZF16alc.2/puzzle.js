// Title: Untitled
// Author: Unknown
// Video: https://www.youtube.com/watch?v=loXmZF16alc
// Source: https://cracking-the-cryptic.web.app/sudoku/gQNRNndptP

// No rules text is carried by the payload. This is a 9x9 irregular (jigsaw)
// sudoku: the payload's `regions` array lists nine irregular 9-cell regions
// (not the default 3x3 boxes), so the default boxes are dropped (NoBoxes)
// and each region is given explicitly (Jigsaw). No other clue geometry
// (cages, lines, dots, arrows) is present. Rows, columns and the nine
// outlined regions each contain 1-9 once.

const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R4C1'],
  ['R4C2', 'R5C1', 'R5C2', 'R6C1', 'R6C2', 'R6C3', 'R7C1', 'R7C2', 'R7C3'],
  ['R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C5', 'R3C4', 'R3C5', 'R4C4', 'R4C5'],
  ['R2C6', 'R3C6', 'R3C7', 'R4C6', 'R5C6', 'R6C6', 'R7C5', 'R7C6', 'R8C5'],
  ['R3C3', 'R4C3', 'R5C3', 'R5C4', 'R5C5', 'R6C4', 'R6C5', 'R7C4', 'R8C4'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C8', 'R3C9', 'R4C9'],
  ['R4C7', 'R4C8', 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R6C8', 'R6C9', 'R7C9'],
  ['R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
];

// Givens, transcribed from the source payload's cell grid.
const givens = [
  ['R1C4', 9], ['R1C7', 2], ['R1C8', 4], ['R1C9', 1],
  ['R2C2', 9], ['R2C3', 5],
  ['R3C8', 5],
  ['R4C2', 2], ['R4C5', 6], ['R4C9', 3],
  ['R5C2', 6], ['R5C4', 5], ['R5C5', 3], ['R5C6', 2], ['R5C8', 8],
  ['R6C1', 9], ['R6C5', 2], ['R6C8', 3],
  ['R7C2', 5],
  ['R8C7', 4], ['R8C8', 7],
  ['R9C1', 4], ['R9C2', 1], ['R9C3', 6], ['R9C6', 9],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
