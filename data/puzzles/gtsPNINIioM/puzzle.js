// Title: Thermo Sudoku
// Author: Olima
// Video: https://www.youtube.com/watch?v=gtsPNINIioM
// Source: https://cracking-the-cryptic.web.app/sudoku/J7pMMgrLL3

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Givens: R1C2=8, R1C3=7, R1C4=6, R1C6=9, R1C7=3, R3C9=5.
//
// Digits on each thermometer strictly increase from the bulb end.
// Thermo(cells...) takes cells bulb-first. Each line below is transcribed
// from a drawn grey stroke; its bulb cell is the one carrying the filled
// grey circle underlay at that end (11 lines, 11 circle underlays,
// matched one-to-one by endpoint cell).

return [
  new Shape('9x9'),

  new Given('R1C2', 8),
  new Given('R1C3', 7),
  new Given('R1C4', 6),
  new Given('R1C6', 9),
  new Given('R1C7', 3),
  new Given('R3C9', 5),

  new Thermo('R3C4', 'R2C4', 'R2C3', 'R2C2', 'R3C2', 'R4C2', 'R4C3', 'R4C4'),
  new Thermo('R3C6', 'R2C6', 'R2C7', 'R2C8', 'R3C8', 'R2C9'),
  new Thermo('R4C8', 'R4C7', 'R4C6'),
  new Thermo('R6C5', 'R5C5', 'R4C5', 'R5C4', 'R6C4'),
  new Thermo('R7C3', 'R7C4'),
  new Thermo('R7C2', 'R8C3', 'R8C4', 'R8C5'),
  new Thermo('R8C2', 'R9C2', 'R9C1', 'R8C1', 'R7C1'),
  new Thermo('R9C6', 'R8C6', 'R7C5'),
  new Thermo('R7C7', 'R7C6'),
  new Thermo('R7C8', 'R8C7'),
  new Thermo('R8C9', 'R9C9', 'R8C8', 'R9C7', 'R9C8'),
];
