// Title: Colour Test
// Author: Quarterthru
// Video: https://www.youtube.com/watch?v=LCoGqKjQgL8
// Source: https://app.crackingthecryptic.com/sudoku/7D4tNqhF9L

// Normal sudoku rules apply (standard 3x3 boxes). Cells separated by an X sum
// to 10; cells separated by a V sum to 5; all XV clues are given (so
// StrictXV forbids the relation on every unmarked adjacent pair). Digits
// along thermometers increase from the bulb end (filled circle).
// X/V edges and thermometer geometry are transcribed from the overlay/line
// data in the source payload.
return [
  new Shape('9x9'),

  new V('R1C1', 'R1C2'),
  new V('R2C3', 'R2C4'),
  new V('R4C5', 'R5C5'),
  new V('R8C2', 'R8C3'),
  new V('R5C7', 'R6C7'),
  new V('R5C9', 'R6C9'),

  new X('R1C1', 'R2C1'),
  new X('R2C2', 'R2C3'),
  new X('R2C4', 'R2C5'),
  new X('R2C7', 'R2C8'),
  new X('R3C5', 'R4C5'),
  new X('R3C3', 'R3C4'),
  new X('R3C3', 'R4C3'),
  new X('R4C2', 'R5C2'),
  new X('R4C4', 'R5C4'),
  new X('R4C6', 'R5C6'),
  new X('R5C5', 'R6C5'),
  new X('R6C7', 'R6C8'),
  new X('R6C8', 'R7C8'),
  new X('R7C5', 'R8C5'),
  new X('R7C4', 'R8C4'),
  new X('R9C6', 'R9C7'),
  new X('R9C4', 'R9C5'),
  new X('R9C2', 'R9C3'),

  new StrictXV(),

  new Thermo('R1C7', 'R1C8'),
  new Thermo('R5C8', 'R4C8'),
];
