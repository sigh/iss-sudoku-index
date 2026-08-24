// Title: Thermo Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=c_NjEbFEeW0
// Source: https://app.crackingthecryptic.com/sudoku/B4Gb6RMDmf

// Normal sudoku rules apply (default rows/columns/3x3 boxes). Digits
// increase strictly along each thermo starting at the bulb (filled circle).
// Each Thermo call below is ordered bulb-first, tip-last; several of the
// drawn lines are stroked tip-first in the payload, so their cell order is
// reversed here from the payload's waypoint order to keep bulb-to-tip
// direction, matching the filled-circle overlay that marks each bulb.

return [
  new Shape('9x9'),

  new Given('R2C4', 2),
  new Given('R2C6', 5),
  new Given('R3C3', 7),
  new Given('R3C7', 4),
  new Given('R5C2', 2),
  new Given('R5C4', 4),
  new Given('R5C6', 6),
  new Given('R5C8', 8),
  new Given('R7C3', 6),
  new Given('R7C7', 3),
  new Given('R8C4', 5),
  new Given('R8C6', 8),

  new Thermo('R3C7', 'R3C8', 'R4C8'),
  new Thermo('R1C5', 'R2C5', 'R2C6'),
  new Thermo('R3C5', 'R4C5', 'R4C6'),
  new Thermo('R4C1', 'R3C2', 'R3C3'),
  new Thermo('R4C3', 'R4C4'),
  new Thermo('R5C1', 'R5C2'),
  new Thermo('R5C3', 'R5C4'),
  new Thermo('R5C6', 'R5C7'),
  new Thermo('R5C8', 'R5C9'),
  new Thermo('R6C6', 'R6C7'),
  new Thermo('R6C4', 'R6C5', 'R7C5'),
  new Thermo('R6C2', 'R7C2', 'R7C3'),
  new Thermo('R8C4', 'R8C5', 'R9C5'),
  new Thermo('R7C7', 'R7C8', 'R6C9'),
];
