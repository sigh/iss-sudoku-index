// Title: Hinges
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=sLTxD8bjC8g
// Source: https://app.crackingthecryptic.com/sudoku/Gf6NmPtTqb

// Normal sudoku rules (rows, columns, standard 3x3 boxes). Killer cages:
// each cage's digits sum to its printed total and do not repeat within the
// cage. There are no given digits and no other overlays.

const cages = [
  [13, 'R1C2', 'R1C3'],
  [13, 'R2C1', 'R3C1', 'R3C2'],
  [24, 'R4C2', 'R4C3', 'R5C3'],
  [11, 'R6C1', 'R7C1'],
  [12, 'R9C3', 'R9C4'],
  [24, 'R7C5', 'R7C6', 'R8C6'],
  [6, 'R5C7', 'R6C7', 'R6C8'],
  [6, 'R2C4', 'R3C4', 'R3C5'],
  [19, 'R1C8', 'R1C9', 'R2C9'],
  [13, 'R8C7', 'R9C7', 'R9C8'],
  [14, 'R7C9', 'R8C9'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
