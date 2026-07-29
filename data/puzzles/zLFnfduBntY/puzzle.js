// Title: Entanglement
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=zLFnfduBntY
// Source: https://sudokupad.app/8h24l900cg

// Normal sudoku rules apply. Digits in each killer cage are distinct and sum
// to its displayed total. The cage cells and totals below are transcribed from
// the drawn dashed cages.
const cages = [
  [23, 'R1C1', 'R1C2', 'R2C1'],
  [16, 'R1C4', 'R2C3', 'R2C4', 'R3C2', 'R3C3'],
  [6, 'R1C6', 'R2C6'],
  [12, 'R3C7', 'R4C7'],
  [10, 'R3C8', 'R4C8'],
  [8, 'R3C9', 'R4C9'],
  [9, 'R8C6', 'R8C7'],
  [9, 'R9C6', 'R9C7'],
  [10, 'R4C4', 'R4C5'],
  [6, 'R4C1', 'R4C2'],
  [6, 'R6C3', 'R7C3'],
  [8, 'R6C1', 'R7C1'],
  [7, 'R6C7', 'R6C8', 'R7C7'],
  [22, 'R7C8', 'R7C9', 'R8C9'],
  [13, 'R9C2', 'R9C3'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
