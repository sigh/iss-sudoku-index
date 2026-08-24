// Title: Knowledge Bomb: 5 != 6
// Author: apiyo
// Video: https://www.youtube.com/watch?v=WM-SO_4qzAE
// Source: https://app.crackingthecryptic.com/sudoku/mQhPdBhdQL

// Standard 9x9 sudoku (rows/columns/3x3 boxes), no givens.
// Anti-knight: no two cells a chess knight's move apart share a digit.
// Arrows: bulb (white circle) cell equals the sum of the rest of the arm;
// digits may repeat along an arrow (no extra all-different rule stated).
// Thermometer: digits strictly increase from the bulb end.
// The rules text names only these three rule types; no exhaustiveness
// clause ("all X are given") appears, so nothing beyond the drawn arrows
// and the one drawn thermometer is implied.

return [
  new Shape('9x9'),

  new AntiKnight(),

  // Arrows, bulb cell first.
  new Arrow('R8C9', 'R9C8', 'R9C7'),
  new Arrow('R5C8', 'R6C7', 'R7C6'),
  new Arrow('R5C6', 'R6C6', 'R7C5'),
  new Arrow('R7C2', 'R7C3', 'R7C4', 'R7C5'),
  new Arrow('R7C2', 'R8C3', 'R9C4'),
  new Arrow('R7C2', 'R6C1'),
  new Arrow('R3C2', 'R3C3', 'R3C4', 'R3C5'),
  new Arrow('R1C5', 'R2C4', 'R3C4'),
  new Arrow('R5C8', 'R4C7', 'R3C6', 'R2C7', 'R1C7'),
  new Arrow('R7C1', 'R8C1', 'R9C2'),

  // Thermometer, bulb first.
  new Thermo('R8C7', 'R9C6'),
];
