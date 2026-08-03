// Title: Entropic Kingdom
// Author: Wuschel
// Video: https://www.youtube.com/watch?v=4spu7J1PxSw
// Source: https://app.crackingthecryptic.com/sudoku/Ltqp3P3BTJ

// Normal sudoku rules apply (standard 3x3 boxes -- Shape('9x9') default).
// Anti-king: cells a king's move apart cannot share a digit (AntiKing).
// Arrows: digits along an arrow sum to the digit in its circle, circle cell
// first (Arrow(circle, ...arm)).
// Yellow entropic lines: every 3 sequential cells hold one low (1-3), one
// medium (4-6), and one high (7-9) digit (Entropic).

return [
  new Shape('9x9'),

  new Given('R9C4', 1),

  new AntiKing(),

  // Arrows -- bulb cell then arm cells, cell order taken from the drawn
  // wayPoints (see puzzle_inputs.py geometry summary).
  new Arrow('R1C6', 'R1C7', 'R1C8', 'R2C9'),
  new Arrow('R2C3', 'R3C4', 'R3C5', 'R3C6'),
  new Arrow('R5C4', 'R6C3', 'R7C3', 'R8C3'),
  new Arrow('R9C7', 'R8C7', 'R8C8'),
  new Arrow('R8C9', 'R7C9', 'R6C8'),

  // Yellow entropic lines -- cell order taken from the drawn wayPoints.
  new Entropic(
    'R3C1', 'R2C2', 'R1C3', 'R1C4', 'R1C5', 'R2C5', 'R2C6', 'R2C7',
    'R3C7', 'R3C8', 'R3C9', 'R4C9', 'R4C8', 'R5C8', 'R5C9'),
  new Entropic(
    'R5C7', 'R4C6', 'R4C5', 'R4C4', 'R3C3', 'R3C2', 'R4C1', 'R5C1',
    'R6C2', 'R7C2'),
  new Entropic(
    'R8C2', 'R9C2', 'R9C3', 'R8C4', 'R8C5', 'R7C6', 'R7C7', 'R7C8'),
  new Entropic('R7C4', 'R6C4', 'R6C5', 'R7C5'),
];
