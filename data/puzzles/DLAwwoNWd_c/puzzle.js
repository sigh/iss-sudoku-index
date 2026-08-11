// Title: Knight's Whirlpool
// Author: PotatoHead21 & SudokuExplorer
// Video: https://www.youtube.com/watch?v=DLAwwoNWd_c
// Source: https://app.crackingthecryptic.com/sudoku/9mP4DBM4MB

// Normal sudoku rules (rows, columns, boxes) apply on the default 9x9 shape.
// AntiKnight forbids equal digits a knight's move apart, globally. Each Arrow
// takes the circle cell first and the arm cells after it, per Arrow's
// bulb-then-arm argument order; arm cells must sum to the circle's digit.
// Circle-to-arm pairing and each arm's cell order are read off the drawn
// arrow paths: every arrow's first waypoint sits on a circle underlay, so
// that end is the bulb.

return [
  new Shape('9x9'),

  new AntiKnight(),

  new Arrow('R1C4', 'R1C5', 'R1C6'),
  new Arrow('R1C4', 'R2C3', 'R3C2'),
  new Arrow('R3C1', 'R2C1', 'R1C2'),
  new Arrow('R3C1', 'R4C2', 'R5C3'),
  new Arrow('R6C3', 'R6C2', 'R6C1'),
  new Arrow('R6C3', 'R5C4', 'R4C5'),
  new Arrow('R4C6', 'R3C5', 'R2C4'),
  new Arrow('R4C6', 'R5C6', 'R6C5'),
  new Arrow('R1C7', 'R2C8', 'R2C9'),
  new Arrow('R6C9', 'R7C9', 'R8C8', 'R9C7'),
  new Arrow('R8C4', 'R9C4', 'R9C3'),
];
