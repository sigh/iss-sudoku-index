// Title: Lake Trip
// Author: TotallyNormalCat
// Video: https://www.youtube.com/watch?v=GoMR1G6lJ9Y
// Source: https://app.crackingthecryptic.com/sudoku/DrJJND8P3F

// Rules: normal sudoku (standard 3x3 boxes, default). Cages sum to the small
// clue in the cage's top-left cell with no repeats (Cage). Digits along an
// arrow sum to the digit in that arrow's circled cell (Arrow, circle cell
// first). Digits along a thermometer increase from the bulb (Thermo, bulb
// first). Every arrow bulb and every thermometer bulb is drawn with a small
// circle at its first cell, confirming the bulb/circle end used below.

return [
  new Shape('9x9'),

  new Given('R1C8', 6),

  // Cages: vertical dominoes in column 5.
  new Cage(9, 'R1C5', 'R2C5'),
  new Cage(8, 'R4C5', 'R5C5'),
  new Cage(9, 'R7C5', 'R8C5'),

  // Arrows: circle cell first.
  new Arrow('R3C1', 'R2C2', 'R1C2'),
  new Arrow('R4C3', 'R3C2'),
  new Arrow('R6C1', 'R5C2', 'R4C2'),
  new Arrow('R9C1', 'R8C2', 'R7C2'),
  new Arrow('R3C6', 'R4C7'),
  new Arrow('R3C5', 'R3C4', 'R2C3'),

  // Thermometers: bulb first.
  new Thermo('R2C8', 'R3C9'),
  new Thermo('R4C8', 'R5C8', 'R6C9'),
  new Thermo('R7C8', 'R8C8', 'R9C9'),
  new Thermo('R7C6', 'R6C7'),
  new Thermo('R7C4', 'R6C3'),
];
