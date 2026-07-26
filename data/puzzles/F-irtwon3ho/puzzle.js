// Title: Deviant Arrow
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=F-irtwon3ho
// Source: https://sudokupad.app/ad7u8gmzsg

// Normal sudoku rules, standard 3x3 boxes (drawn `regions` match the default).
// Anti-knight: cells a knight's move apart cannot repeat.
// Four arrows: digits along the arm sum to the digit in the bulb (circle).
// Each arrow's arm is a 4-cell diagonal zig-zag (two straight bends) rather
// than a straight or curved line -- cell path recovered from the payload's
// wayPoints, including the cell each straight segment passes through
// collinearly, and confirmed diagonally-adjacent cell-to-cell throughout.

return [
  new Shape('9x9'),

  new Given('R2C3', 5),
  new Given('R8C8', 1),

  new AntiKnight(),

  new Arrow('R7C7', 'R6C6', 'R7C5', 'R8C4', 'R9C5'),
  new Arrow('R7C3', 'R6C4', 'R5C3', 'R4C2', 'R5C1'),
  new Arrow('R3C3', 'R4C4', 'R3C5', 'R2C6', 'R1C5'),
  new Arrow('R4C6', 'R3C7', 'R4C8', 'R5C9', 'R6C8'),
];
