// Title: Shady X
// Author: Piatato
// Video: https://www.youtube.com/watch?v=q49Z7x73Pko
// Source: https://app.crackingthecryptic.com/sudoku/2Bd4DGrQm2

// Standard 9x9 sudoku (default 3x3 boxes). Digits cannot repeat on either
// main diagonal: Diagonal(-1) is the '\' diagonal R1C1-R9C9, Diagonal(1) is
// the '/' diagonal R1C9-R9C1. Cages: all-different digits, and where a sum
// is printed in the top-left cell the cage's digits must total it. Cage
// cells transcribed from the payload's cages array.
// R7C1,R8C1 carries no printed sum (all-different only, per rules text
// "if given"); modeled as Cage(0, ...) which is all-different with no sum
// constraint (see sudoku_builder.js: sum === 0 skips the Sum handler).

const cages = [
  [5, 'R1C3', 'R2C3'],
  [6, 'R2C1', 'R2C2'],
  [13, 'R1C4', 'R1C5'],
  [15, 'R5C1', 'R5C2', 'R6C2'],
  [21, 'R5C4', 'R5C5', 'R6C5'],
  [10, 'R6C3', 'R7C3', 'R7C4'],
  [0, 'R7C1', 'R8C1'],
  [7, 'R9C2', 'R9C3'],
  [11, 'R2C7', 'R2C8', 'R3C8'],
  [15, 'R5C9', 'R6C9'],
  [5, 'R7C8', 'R7C9'],
  [11, 'R8C4', 'R8C5', 'R9C5'],
  [6, 'R8C8', 'R9C8'],
];

return [
  new Shape('9x9'),
  new Diagonal(-1),
  new Diagonal(1),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
