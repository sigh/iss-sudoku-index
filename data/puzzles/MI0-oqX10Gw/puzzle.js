// Title: Equilibrium
// Author: Xendari
// Video: https://www.youtube.com/watch?v=MI0-oqX10Gw
// Source: https://app.crackingthecryptic.com/sudoku/m4bG6rrtFH

// Normal sudoku rules apply (default row/column/box all-different).
// Arrow(bulb, ...arm): digits along the arm sum to the digit in the bulb
// cell. Bulb cells R4C5, R6C9, R4C1, and R6C5 each carry two independent
// arrows -- both arms sum to the same bulb, on their own.
// A filled grey circle (odd-digit clue) is encoded as a Given restricted
// to the odd digits, since there is no dedicated odd/even class.
// GreaterThan(a, b) requires a > b for adjacent cells: used here as
// R8C8 > R8C7 to encode "the value of r8c7 is less than that of r8c8".
return [
  new Shape('9x9'),

  new Given('R1C6', 7),

  new Arrow('R4C5', 'R3C4', 'R2C4'),
  new Arrow('R4C5', 'R3C6', 'R2C6'),
  new Arrow('R1C4', 'R2C3', 'R3C3'),
  new Arrow('R9C6', 'R8C7', 'R7C7'),
  new Arrow('R6C9', 'R7C8', 'R8C8'),
  new Arrow('R6C9', 'R5C8', 'R5C7'),
  new Arrow('R4C1', 'R3C2', 'R2C2'),
  new Arrow('R4C1', 'R5C2', 'R5C3'),
  new Arrow('R6C5', 'R7C4', 'R8C4'),
  new Arrow('R6C5', 'R7C6', 'R8C6'),
  new Arrow('R6C3', 'R6C2', 'R7C2'),
  new Arrow('R4C7', 'R4C8', 'R3C8'),
  new Arrow('R1C7', 'R1C8', 'R1C9'),

  new Given('R5C1', 1, 3, 5, 7, 9),
  new Given('R5C9', 1, 3, 5, 7, 9),

  new GreaterThan('R8C8', 'R8C7'),
];
