// Title: Cavalry Archer
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=ksfzctPhQog
// Source: https://app.crackingthecryptic.com/sudoku/Hn9pDFjG8N

// Normal sudoku rules apply (standard 3x3 boxes, no givens). Anti-knight:
// cells a knight's move apart cannot repeat a digit. Eight arrows, each
// summing its arm cells to the digit in its circle; several arrows share one
// bulb cell (bulb cell listed first in each Arrow call).

return [
  new Shape('9x9'),

  new AntiKnight(),

  new Arrow('R4C3', 'R3C2', 'R2C1'),
  new Arrow('R4C6', 'R3C5', 'R2C4'),
  new Arrow('R4C6', 'R3C7', 'R2C8'),
  new Arrow('R4C6', 'R4C7', 'R5C7'),
  new Arrow('R6C8', 'R7C7', 'R8C6'),
  new Arrow('R6C4', 'R7C5', 'R6C6'),
  new Arrow('R7C3', 'R6C3', 'R6C2'),
  new Arrow('R7C3', 'R8C4', 'R9C5', 'R9C6'),
];
