// Title: Mar 20, 2022: XV Arrow Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=Mg2cA4x92qg
// Source: https://tinyurl.com/2dss6kcf

// Standard 9x9 sudoku (rows, columns, boxes all-different; no givens).
// Each arrow's bulb cell equals the sum of the digits along its arm
// (Arrow takes the bulb first, then the arm cells).
// Each XV mark constrains its two adjacent cells to sum to 5 (V) or 10 (X);
// unmarked adjacent pairs are unconstrained ("not all X's and V's are
// necessarily given").

return [
  new Shape('9x9'),

  // Arrows: bulb cell first, then arm cells.
  new Arrow('R1C1', 'R1C2', 'R1C3'),
  new Arrow('R1C4', 'R2C4', 'R3C4'),
  new Arrow('R4C4', 'R4C3', 'R4C2'),
  new Arrow('R4C1', 'R5C1', 'R6C1'),
  new Arrow('R7C1', 'R8C1', 'R8C2'),
  new Arrow('R8C3', 'R9C3', 'R9C4'),
  new Arrow('R9C5', 'R8C5', 'R7C5'),
  new Arrow('R6C5', 'R6C6', 'R7C7'),
  new Arrow('R4C9', 'R4C8', 'R4C7'),
  new Arrow('R7C8', 'R6C8', 'R5C9'),
  new Arrow('R4C6', 'R3C7', 'R2C7'),
  new Arrow('R1C7', 'R1C8', 'R2C9'),

  // V (sum to 5) marks.
  new V('R1C1', 'R1C2'),
  new V('R1C4', 'R2C4'),
  new V('R7C1', 'R8C1'),
  new V('R6C5', 'R7C5'),

  // X (sum to 10) marks.
  new X('R5C1', 'R4C1'),
  new X('R4C4', 'R4C3'),
  new X('R8C2', 'R8C3'),
  new X('R4C9', 'R5C9'),
  new X('R4C6', 'R4C7'),
  new X('R7C7', 'R7C8'),
];
