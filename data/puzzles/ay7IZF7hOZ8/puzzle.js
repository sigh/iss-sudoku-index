// Title: A Bit Cagey
// Author: Walking Writer
// Video: https://www.youtube.com/watch?v=ay7IZF7hOZ8
// Source: https://app.crackingthecryptic.com/sudoku/ttPm9G96h6

// Normal sudoku rules apply (standard 3x3 box regions, no givens). Digits in
// cages may not repeat and must sum to the total shown; encoded as one Cage
// per drawn cage (killer cage = distinct + sum). Uncaged cells carry no local
// constraint beyond row/column/box.

// Cage cells and totals transcribed from the puzzle's `cages` array.
const cages = [
  ['R1C1', 'R2C1', 11],
  ['R1C2', 'R1C3', 13],
  ['R2C2', 'R2C3', 'R3C3', 13],
  ['R1C4', 'R2C4', 'R3C4', 17],
  ['R1C5', 'R2C5', 17],
  ['R2C7', 'R2C8', 4],
  ['R2C9', 'R3C9', 16],
  ['R4C1', 'R4C2', 'R4C3', 24],
  ['R5C1', 'R6C1', 9],
  ['R5C2', 'R6C2', 9],
  ['R4C6', 'R5C6', 8],
  ['R5C5', 'R6C4', 'R6C5', 15],
  ['R6C9', 'R7C8', 'R7C9', 14],
  ['R8C1', 'R8C2', 'R8C3', 19],
  ['R7C4', 'R7C5', 'R7C6', 'R8C4', 'R9C4', 'R9C5', 'R9C6', 29],
  ['R8C9', 'R9C7', 'R9C8', 'R9C9', 23],
  ['R9C1', 'R9C2', 16],
];

return [
  new Shape('9x9'),
  ...cages.map(entry => {
    const sum = entry[entry.length - 1];
    const cells = entry.slice(0, -1);
    return new Cage(sum, ...cells);
  }),
];
