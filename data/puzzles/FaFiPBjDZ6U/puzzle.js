// Title: Syzygy
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=FaFiPBjDZ6U
// Source: https://app.crackingthecryptic.com/sudoku/gJBjt7tP43

// Standard 9x9 sudoku, no givens.
// Arrows: arm cells sum to the circle digit (bulb cell listed first).
// Digits may repeat along an arrow's arm (rules text), and arms are not
// forced distinct. Two circles (R3C1, R4C4) each anchor two arrows; both
// share that circle's digit as their sum. "No bifurcation is required" is a
// solver-method note for a human, not a grid rule, and is not encoded.

return [
  new Shape('9x9'),

  new Arrow('R3C1', 'R2C1', 'R1C1'),
  new Arrow('R1C4', 'R1C5', 'R1C6', 'R1C7'),
  new Arrow('R1C9', 'R2C9', 'R3C9'),
  new Arrow('R6C1', 'R7C2', 'R8C2'),
  new Arrow('R9C5', 'R9C4', 'R9C3'),
  new Arrow('R6C4', 'R5C3', 'R4C3'),
  new Arrow('R4C4', 'R3C3', 'R2C3'),
  new Arrow('R4C4', 'R5C5', 'R6C5'),
  new Arrow('R6C6', 'R6C7', 'R6C8', 'R6C9'),
  new Arrow('R8C8', 'R8C9', 'R7C9'),
  new Arrow('R9C8', 'R9C9', 'R8C9', 'R7C9'),
  new Arrow('R2C6', 'R3C7', 'R4C8'),
  new Arrow('R3C1', 'R4C2', 'R5C2', 'R6C2'),
];
