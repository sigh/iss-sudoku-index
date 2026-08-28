// Title: Aug 26, 2021: Three-in-a-row
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=O1vAKJyVvG0
// Source: https://tinyurl.com/4ryej9xs

// Normal sudoku rules apply. Each marked line contains either three odd
// digits (1,3,5,7,9) or three even digits (2,4,6,8) -- not a fixed choice
// per line, so each line is an Or of the all-odd and all-even reading,
// where each reading is an And of per-cell Given restrictions to the
// relevant parity's five/four digits.

const ODD = [1, 3, 5, 7, 9];
const EVEN = [2, 4, 6, 8];

// Marked lines, from the puzzle's rendered `line` array (7 entries, each a
// 3-cell diagonal segment).
const lines = [
  ['R6C2', 'R7C3', 'R8C4'],
  ['R5C3', 'R6C4', 'R7C5'],
  ['R4C4', 'R5C5', 'R6C6'],
  ['R3C5', 'R4C6', 'R5C7'],
  ['R2C6', 'R3C7', 'R4C8'],
  ['R1C7', 'R2C8', 'R3C9'],
  ['R7C1', 'R8C2', 'R9C3'],
];

function threeInARow(cells) {
  return new Or([
    new And(cells.map(c => new Given(c, ...ODD))),
    new And(cells.map(c => new Given(c, ...EVEN))),
  ]);
}

return [
  new Shape('9x9'),

  // Givens, transcribed from the payload's grid array.
  new Given('R1C4', 2), new Given('R1C5', 1), new Given('R1C8', 6), new Given('R1C9', 4),
  new Given('R2C3', 4), new Given('R2C4', 3), new Given('R2C9', 5),
  new Given('R3C2', 6), new Given('R3C3', 5),
  new Given('R4C1', 8), new Given('R4C2', 7),
  new Given('R5C1', 9), new Given('R5C9', 8),
  new Given('R6C8', 5), new Given('R6C9', 7),
  new Given('R7C7', 6), new Given('R7C8', 4),
  new Given('R8C1', 6), new Given('R8C6', 9), new Given('R8C7', 1),
  new Given('R9C1', 1), new Given('R9C2', 4), new Given('R9C5', 2), new Given('R9C6', 3),

  ...lines.map(threeInARow),
];
