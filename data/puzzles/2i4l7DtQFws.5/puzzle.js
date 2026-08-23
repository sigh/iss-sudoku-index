// Title: Killer Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=2i4l7DtQFws
// Source: https://app.crackingthecryptic.com/sudoku/38mj2npj2d

// Normal sudoku rules (default rows/cols/boxes). 20 killer cages, each a
// two-cell domino with a printed total; no digit repeats within a cage
// (standard killer-cage convention, unstated but implied by "Cages show
// their sums" together with the cage's box-outline styling).

// Cage totals and cells, transcribed from the drawn `cages` array.
const cages = [
  [3, 'R1C1', 'R1C2'],
  [7, 'R1C3', 'R2C3'],
  [6, 'R3C3', 'R3C4'],
  [5, 'R2C5', 'R3C5'],
  [9, 'R1C5', 'R1C6'],
  [7, 'R1C7', 'R2C7'],
  [7, 'R2C8', 'R2C9'],
  [4, 'R3C9', 'R4C9'],
  [5, 'R5C9', 'R5C8'],
  [5, 'R5C7', 'R5C6'],
  [17, 'R5C4', 'R5C3'],
  [12, 'R5C2', 'R5C1'],
  [12, 'R6C1', 'R7C1'],
  [12, 'R8C1', 'R8C2'],
  [10, 'R8C3', 'R9C3'],
  [13, 'R9C4', 'R9C5'],
  [10, 'R8C5', 'R7C5'],
  [10, 'R7C6', 'R7C7'],
  [10, 'R8C7', 'R9C7'],
  [17, 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
