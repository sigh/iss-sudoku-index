// Title: Directions
// Author: SudokuExplorer
// Video: https://www.youtube.com/watch?v=0PpbFMrY_Mc
// Source: https://app.crackingthecryptic.com/sudoku/8pmRJPFRbq

// Normal sudoku rules (default rows/cols/boxes). Twelve killer cages: digits
// in a cage sum to its total and cannot repeat within it.

// Cage totals and cells, transcribed from the drawn `cages` array.
const cages = [
  [21, 'R1C2', 'R1C3', 'R2C2'],
  [12, 'R3C1', 'R3C2', 'R3C3', 'R4C1'],
  [19, 'R5C1', 'R5C2', 'R6C1'],
  [21, 'R7C2', 'R8C2', 'R8C3'],
  [10, 'R1C5', 'R1C6', 'R2C5'],
  [26, 'R3C5', 'R4C5', 'R4C6', 'R5C6', 'R5C7'],
  [17, 'R2C7', 'R3C6', 'R3C7', 'R3C8', 'R4C7'],
  [19, 'R8C5', 'R9C4', 'R9C5'],
  [12, 'R7C7', 'R8C7', 'R9C6', 'R9C7'],
  [21, 'R7C9', 'R8C8', 'R8C9'],
  [14, 'R4C9', 'R5C8', 'R5C9'],
  [21, 'R1C8', 'R1C9', 'R2C9'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
