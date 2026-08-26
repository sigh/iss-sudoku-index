// Title: May 26, 2022: Arrow Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=gKQTO43SAxY
// Source: https://tinyurl.com/2p8wpwuy

// Normal sudoku rules apply (standard 3x3 box regions, no non-standard
// shapes -- Shape('9x9') supplies rows/columns/boxes). Digits along an
// arrow sum to the digit in the arrow's bulb cell (the first cell of each
// Arrow below); each bulb cell here is also a given digit.

return [
  new Shape('9x9'),

  new Given('R2C2', 3),
  new Given('R2C6', 8),
  new Given('R2C7', 9),
  new Given('R2C8', 7),
  new Given('R3C2', 4),
  new Given('R4C2', 7),
  new Given('R6C8', 9),
  new Given('R7C8', 8),
  new Given('R8C2', 8),
  new Given('R8C3', 7),
  new Given('R8C4', 9),
  new Given('R8C8', 3),

  new Arrow('R2C2', 'R2C3', 'R2C4'),
  new Arrow('R3C2', 'R3C3', 'R3C4'),
  new Arrow('R4C2', 'R4C3', 'R4C4'),
  new Arrow('R2C6', 'R3C6', 'R4C6'),
  new Arrow('R2C7', 'R3C7', 'R4C7'),
  new Arrow('R2C8', 'R3C8', 'R4C8'),
  new Arrow('R6C8', 'R6C7', 'R6C6'),
  new Arrow('R7C8', 'R7C7', 'R7C6'),
  new Arrow('R8C8', 'R8C7', 'R8C6'),
  new Arrow('R8C2', 'R7C2', 'R6C2'),
  new Arrow('R8C3', 'R7C3', 'R6C3'),
  new Arrow('R8C4', 'R7C4', 'R6C4'),
];
