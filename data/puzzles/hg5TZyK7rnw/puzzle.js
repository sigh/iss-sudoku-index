// Title: Sweet Sixteen
// Author: Starwarigami
// Video: https://www.youtube.com/watch?v=hg5TZyK7rnw
// Source: https://app.crackingthecryptic.com/sudoku/hh6p4qnnTt

// Normal sudoku rules apply. Digits may not repeat in a cage. Every cage
// sums to 16. Cage cells are read from the source's cage cell lists; each
// cell appears in at most one cage, and 20 of the 81 cells are uncaged.

const cages = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5'],
  ['R1C8', 'R1C9'],
  ['R1C7', 'R1C6', 'R2C7'],
  ['R2C6', 'R2C5', 'R2C4', 'R2C3'],
  ['R2C9', 'R3C9', 'R4C9', 'R5C9'],
  ['R2C8', 'R3C8', 'R3C7'],
  ['R2C1', 'R3C1', 'R4C1'],
  ['R2C2', 'R3C2', 'R3C3', 'R4C3'],
  ['R3C5', 'R3C4', 'R4C4', 'R5C4'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R4C6', 'R4C7', 'R4C8'],
  ['R5C8', 'R5C7', 'R6C7'],
  ['R6C8', 'R7C8', 'R7C7'],
  ['R8C7', 'R8C8', 'R8C9'],
  ['R5C6', 'R6C6', 'R7C6', 'R8C6'],
  ['R5C3', 'R6C3', 'R7C3'],
  ['R4C2', 'R5C2', 'R6C2'],
  ['R7C1', 'R8C1', 'R8C2', 'R9C2'],
];

return [
  new Shape('9x9'),
  ...cages.map((cells) => new Cage(16, ...cells)),
];
