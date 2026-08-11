// Title: Jan 10, 2022: Thermo Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=SD7p63H_NpA
// Source: https://tinyurl.com/2p8swf26

// Normal Sudoku rules apply (default row/column/box all-different on the
// 9x9 Shape). Each thermometer's values strictly increase starting from the
// bulb (its first-listed cell); Thermo's DESCRIPTION is "Values must be in
// increasing order starting at the bulb", a verbatim match, and its fnKey
// uses strict `a < b`, matching "strictly increase". Thermometer cell paths
// are transcribed directly from the puzzle's drawn thermometer geometry.

return [
  new Shape('9x9'),

  new Given('R2C1', 1), new Given('R2C2', 2),
  new Given('R2C8', 8), new Given('R2C9', 9),
  new Given('R5C1', 4), new Given('R5C2', 1),
  new Given('R5C8', 5), new Given('R5C9', 8),
  new Given('R8C1', 7), new Given('R8C2', 9),
  new Given('R8C8', 6), new Given('R8C9', 5),

  new Thermo('R1C3', 'R1C2', 'R1C1'),
  new Thermo('R3C3', 'R2C4', 'R2C5', 'R2C6', 'R1C7'),
  new Thermo('R6C3', 'R5C4', 'R5C5', 'R5C6', 'R4C7'),
  new Thermo('R9C3', 'R8C4', 'R8C5', 'R8C6', 'R7C7'),
  new Thermo('R9C9', 'R9C8', 'R9C7'),
  new Thermo('R6C9', 'R7C9'),
  new Thermo('R3C1', 'R4C1'),
  new Thermo('R3C6', 'R3C5'),
  new Thermo('R7C5', 'R7C4'),
];
