// Title: Chromatic Quiver
// Author: Xendari
// Video: https://www.youtube.com/watch?v=Qp_J65KzMI4
// Source: https://app.crackingthecryptic.com/sudoku/H774tRHPbM

// Normal sudoku rules apply (standard 3x3 boxes; the payload's regions match
// them exactly). Digits along an arrow sum to the digit in that arrow's
// circle. Cells a chess knight's move apart cannot repeat a digit (global
// Anti-Knight).
//
// 3 circles carry two independently-summing tails each (two separate `arrows`
// payload entries sharing one bulb cell): R6C4, R6C8, R7C2. Each tail below is
// its own Arrow constraint. R6C4-R5C3 and R4C5-R3C6 are 2-cell arrows (a
// single-cell tail), so the circle equals that one cell.

const arrows = [
  new Arrow('R1C1', 'R1C2', 'R1C3'),
  new Arrow('R1C7', 'R2C6', 'R2C5', 'R3C5'),
  new Arrow('R2C8', 'R3C8', 'R3C9'),
  new Arrow('R4C5', 'R3C6'),
  new Arrow('R6C4', 'R5C3'),
  new Arrow('R6C4', 'R7C5', 'R8C5', 'R9C5'),
  new Arrow('R6C8', 'R4C7', 'R5C7'),
  new Arrow('R6C8', 'R4C9', 'R5C9'),
  new Arrow('R7C2', 'R5C1', 'R6C1', 'R6C2'),
  new Arrow('R7C2', 'R8C2', 'R9C2'),
  new Arrow('R8C8', 'R8C6', 'R8C7'),
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...arrows,
];
