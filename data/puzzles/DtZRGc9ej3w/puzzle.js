// Title: Squares
// Author: udukos
// Video: https://www.youtube.com/watch?v=DtZRGc9ej3w
// Source: https://app.crackingthecryptic.com/sudoku/hmDNFhhrdL

// Normal sudoku (standard 3x3 boxes, default). Killer cages: digits within a
// cage cannot repeat, and sum to the printed total when one is given; three
// cages carry no total (AllDifferent only). Each grey line is a closed loop
// drawn around one 2x2 block of cells; its four cells hold a set of four
// consecutive digits in any order, no repeats -- Renban's exact semantics,
// so the loop's four distinct cells (the repeated closing waypoint is not a
// fifth cell) become one Renban each.

return [
  new Shape('9x9'),

  new Given('R5C6', 1),
  new Given('R6C5', 9),

  // Cages, top-to-bottom / left-to-right as drawn.
  new Cage(22, 'R2C3', 'R3C2', 'R3C3', 'R3C4', 'R4C3'),
  new AllDifferent('R2C6', 'R3C6', 'R3C7'),
  new Cage(17, 'R2C9', 'R3C8', 'R3C9', 'R4C9'),
  new Cage(18, 'R4C4', 'R4C5', 'R5C4', 'R5C5'),
  new Cage(7, 'R5C9', 'R6C9'),
  new AllDifferent('R5C6', 'R6C5', 'R6C6', 'R6C7', 'R7C6'),
  new AllDifferent('R6C2', 'R6C3', 'R7C3'),
  new Cage(20, 'R8C3', 'R9C2', 'R9C3', 'R9C4'),
  new Cage(7, 'R9C5', 'R9C6'),
  new Cage(18, 'R8C9', 'R9C8', 'R9C9'),

  // Grey lines: eight 2x2-block Renbans ("Squares").
  new Renban('R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new Renban('R1C4', 'R1C5', 'R2C4', 'R2C5'),
  new Renban('R1C7', 'R1C8', 'R2C7', 'R2C8'),
  new Renban('R4C1', 'R4C2', 'R5C1', 'R5C2'),
  new Renban('R4C7', 'R4C8', 'R5C7', 'R5C8'),
  new Renban('R7C1', 'R7C2', 'R8C1', 'R8C2'),
  new Renban('R7C4', 'R7C5', 'R8C4', 'R8C5'),
  new Renban('R7C7', 'R7C8', 'R8C7', 'R8C8'),
];
