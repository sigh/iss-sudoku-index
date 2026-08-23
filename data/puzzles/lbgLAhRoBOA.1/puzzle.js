// Title: Thermo Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=lbgLAhRoBOA
// Source: https://app.crackingthecryptic.com/sudoku/pgMTGbtm22

// Normal sudoku rules apply (rows, columns, 3x3 boxes all-different).
// Along a thermometer, digits strictly increase from the bulb (the filled
// circle end) outward. Each Thermo below is listed bulb-first; the R1C1-
// R1C4/R2C1-R5C1 thermometer's bulb (a filled circle at R5C1) is at the far
// end of how the line was originally drawn, so its cell order here is
// reversed from the raw drawn order.

return [
  new Shape('9x9'),

  new Given('R2C6', 8),
  new Given('R4C7', 2),
  new Given('R6C3', 1),
  new Given('R8C4', 3),

  new Thermo('R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4'),
  new Thermo('R5C2', 'R4C3', 'R3C4', 'R2C5'),
  new Thermo('R3C6', 'R3C7', 'R3C8'),
  new Thermo('R5C8', 'R6C7', 'R7C6', 'R8C5'),
  new Thermo('R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R9C6'),
  new Thermo('R7C4', 'R7C3', 'R7C2'),
];
