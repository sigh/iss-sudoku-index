// Title: German Whiskers
// Author: Subtitle
// Video: https://www.youtube.com/watch?v=NnxfeihfOXc
// Source: https://app.crackingthecryptic.com/sudoku/dqb9NQbrj7

// Normal sudoku rules apply (default row/col/box all-different). Along
// thermometers, digits increase from the bulb. Grey circles without lines
// represent odd digits. Neighbouring cells along green lines must have a
// difference of at least 5 (German whisper).
//
// Two thermometers share the bulb at R5C5 and the R5C5-R6C5-R7C5 segment,
// then split to two different tips; both are encoded as separate Thermo
// constraints sharing the common cells.
//
// The grey circle drawn at R5C5 is the shared bulb marker for the two
// thermometers, not a separate odd-digit clue: a thermometer line passes
// through that cell, so it is excluded by "circles without lines".

return [
  new Shape('9x9'),

  // Givens (R1C1=7 R1C5=2 R1C9=9 R2C3=8 R2C7=2 R9C1=8 R9C9=3)
  new Given('R1C1', 7),
  new Given('R1C5', 2),
  new Given('R1C9', 9),
  new Given('R2C3', 8),
  new Given('R2C7', 2),
  new Given('R9C1', 8),
  new Given('R9C9', 3),

  // Odd-digit circles (grey, no line through the cell)
  new Given('R3C4', 1, 3, 5, 7, 9),
  new Given('R3C6', 1, 3, 5, 7, 9),

  // Thermometers, bulb first
  new Thermo('R5C5', 'R6C5', 'R7C5', 'R8C4'),
  new Thermo('R5C5', 'R6C5', 'R7C5', 'R8C6'),

  // German whisper lines (default difference 5)
  new Whisper('R2C4', 'R1C3', 'R2C2'),
  new Whisper('R2C6', 'R1C7', 'R2C8'),
  new Whisper('R5C1', 'R5C2', 'R5C3', 'R5C4', 'R6C3', 'R6C2', 'R6C1'),
  new Whisper('R5C9', 'R5C8', 'R5C7', 'R5C6', 'R6C7', 'R6C8'),
  new Whisper('R5C4', 'R6C4', 'R7C3', 'R7C2'),
  new Whisper('R5C6', 'R6C6', 'R7C7', 'R7C8', 'R7C9'),
];
