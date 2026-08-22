// Title: Killer Arrows
// Author: Scott Strosahl
// Video: https://www.youtube.com/watch?v=lJdNghul9u8
// Source: https://app.crackingthecryptic.com/sudoku/dQ3QLHb6qP

// Normal sudoku rules (default rows/cols/boxes). Cages: distinct digits
// summing to the printed total. Arrows: arm digits (repeats allowed) sum to
// the digit in the attached circle cell.
//
// Cage cell lists and totals, and arrow bulb/arm cell lists, are transcribed
// from the payload's drawn `cages` and `arrows` geometry.

return [
  new Shape('9x9'),

  // Cages (killer: distinct + sum).
  new Cage(21, 'R1C1', 'R1C2', 'R1C3', 'R1C4'),
  new Cage(22, 'R1C5', 'R1C6', 'R1C7', 'R2C7'),
  new Cage(26, 'R3C8', 'R3C9', 'R4C9', 'R5C9'),
  new Cage(20, 'R6C9', 'R7C9', 'R8C9', 'R9C9'),
  new Cage(15, 'R2C1', 'R2C2', 'R3C2'),
  new Cage(12, 'R3C3', 'R2C3', 'R2C4'),
  new Cage(11, 'R2C6', 'R2C5', 'R3C5'),
  new Cage(11, 'R3C6', 'R3C7', 'R4C7'),
  new Cage(11, 'R4C8', 'R5C8', 'R5C7'),
  new Cage(15, 'R6C8', 'R7C8', 'R7C7'),
  new Cage(12, 'R8C7', 'R8C8', 'R9C8'),
  new Cage(18, 'R4C1', 'R5C1', 'R5C2'),
  new Cage(17, 'R4C5', 'R4C6', 'R5C6'),
  new Cage(18, 'R8C5', 'R9C5', 'R9C6'),
  new Cage(21, 'R7C2', 'R7C3', 'R8C3'),
  new Cage(10, 'R8C1', 'R9C1', 'R9C2'),

  // Arrows (bulb cell first, then arm cells). Four arrows share the bulb at
  // R6C4, radiating in four separate directions; each arm sums independently
  // to the R6C4 digit.
  new Arrow('R2C8', 'R1C8', 'R1C9', 'R2C9'),
  new Arrow('R3C1', 'R4C2', 'R5C3'),
  new Arrow('R9C7', 'R8C6', 'R7C5'),
  new Arrow('R6C4', 'R5C4', 'R4C4'),
  new Arrow('R6C4', 'R6C5', 'R6C6'),
  new Arrow('R6C4', 'R7C4', 'R8C4', 'R9C4'),
  new Arrow('R6C4', 'R6C3', 'R6C2', 'R6C1'),
];
