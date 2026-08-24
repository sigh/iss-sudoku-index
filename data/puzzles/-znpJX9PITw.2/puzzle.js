// Title: 333k Sudoku
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=-znpJX9PITw
// Source: https://app.crackingthecryptic.com/sudoku/LQPRH3jjG8

// Standard 9x9 sudoku (regions are the nine 3x3 boxes; ISS default). Digits
// on a thermometer increase from the bulb (rules text). Each thermometer here
// is a two-cell segment; the bulb end is a drawn filled circle coincident
// with one line endpoint. Two of the three thermo lines are drawn tip-first
// (the stroke starts at the non-bulb cell); Thermo() below is given
// cells bulb-first regardless of drawn stroke order, per the circle mark.

return [
  new Shape('9x9'),

  // Givens
  new Given('R1C1', 2), new Given('R1C2', 1),
  new Given('R2C3', 3), new Given('R2C4', 7), new Given('R2C5', 6),
  new Given('R3C3', 4), new Given('R3C6', 2), new Given('R3C7', 3), new Given('R3C8', 9),
  new Given('R4C1', 4), new Given('R4C2', 8), new Given('R4C6', 6), new Given('R4C9', 3),
  new Given('R5C3', 6), new Given('R5C4', 3), new Given('R5C5', 4), new Given('R5C9', 5),
  new Given('R6C3', 1), new Given('R6C6', 8), new Given('R6C7', 6), new Given('R6C8', 4),
  new Given('R7C1', 7), new Given('R7C2', 4), new Given('R7C6', 1), new Given('R7C9', 6),
  new Given('R8C4', 4), new Given('R8C5', 2), new Given('R8C9', 1),
  new Given('R9C7', 4), new Given('R9C8', 8),

  // Thermometers, bulb-first cell order below.
  new Thermo('R3C4', 'R3C5'),
  new Thermo('R9C2', 'R8C2'),
  new Thermo('R8C8', 'R8C7'),
];
