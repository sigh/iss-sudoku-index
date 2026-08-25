// Title: Thermo Sudoku
// Author: Tom Collyer
// Video: https://www.youtube.com/watch?v=RRSFXCpBBek
// Source: https://app.crackingthecryptic.com/P7NmpD3P9p

// Normal sudoku rules apply (standard rows/columns/3x3 boxes, from the
// default Shape('9x9') grid). Digits increase along each thermo from bulb to
// tip -- Thermo(...cells) requires increasing order starting at its first
// argument, so each line is listed bulb-first. Bulb cells (given as a filled
// grey circle overlay at the line's first waypoint) match the first cell of
// each corresponding line's drawn path.

return [
  new Shape('9x9'),

  // Givens
  new Given('R1C2', 4),
  new Given('R1C4', 6),
  new Given('R1C6', 7),
  new Given('R1C8', 3),
  new Given('R7C2', 7),
  new Given('R7C8', 9),
  new Given('R8C4', 3),
  new Given('R8C6', 5),
  new Given('R9C5', 1),

  // Thermometers, bulb-first per each line's drawn waypoint order,
  // confirmed by the co-located circle overlay at each bulb
  new Thermo('R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1'),
  new Thermo('R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3'),
  new Thermo('R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5'),
  new Thermo('R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7'),
  new Thermo('R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9'),
];
