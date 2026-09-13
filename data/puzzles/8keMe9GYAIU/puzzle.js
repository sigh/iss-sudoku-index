// Title: Rising Entropy
// Author: Sneppix
// Video: https://www.youtube.com/watch?v=8keMe9GYAIU
// Source: https://sudokupad.app/0de8h97n0c

// Normal sudoku rules apply (default row/column/box all-different, 9x9,
// standard boxes). Thermo() enforces strictly increasing digits from the
// first-listed cell (the bulb) to the tip. Entropic() enforces that every
// sequential group of 3 cells on the line holds one of {1,2,3}, one of
// {4,5,6}, and one of {7,8,9}.
//
// Thermometer #4 (R4C8-R5C8) is drawn tip-first: its bulb underlay sits at
// R5C8, the second waypoint of the drawn stroke, so it is listed here bulb
// first as R5C8, R4C8.

return [
  new Shape('9x9'),

  // Thermometers, bulb cell first (provenance: the grey drawn lines, each
  // cross-checked against its bulb marker circle).
  new Thermo('R3C1', 'R2C1', 'R2C2', 'R2C3', 'R3C3', 'R3C2'),
  new Thermo('R1C7', 'R1C6', 'R1C5'),
  new Thermo('R3C7', 'R4C7', 'R4C6'),
  new Thermo('R5C8', 'R4C8'),
  new Thermo('R7C8', 'R7C9', 'R8C9', 'R9C9'),
  new Thermo('R9C7', 'R9C6', 'R9C5', 'R9C4'),
  new Thermo('R6C1', 'R6C2', 'R6C3', 'R6C4', 'R5C4'),

  // Entropic (peach) lines, as drawn.
  new Entropic('R1C1', 'R1C2', 'R1C3'),
  new Entropic('R1C4', 'R2C4', 'R3C4', 'R3C5', 'R3C6'),
  new Entropic('R2C7', 'R2C8', 'R2C9'),
  new Entropic('R6C5', 'R6C6', 'R6C7', 'R5C7'),
  new Entropic('R9C8', 'R8C7', 'R8C6'),
  new Entropic('R9C3', 'R8C4', 'R7C4'),
  new Entropic('R7C1', 'R8C1', 'R9C1', 'R8C2'),
];
