// Title: Jan. 15, 2023: XV Pairs Thermo
// Author: clover!
// Video: https://www.youtube.com/watch?v=DnRGUWffGsc
// Source: https://tinyurl.com/y8rbsc44

// Normal sudoku rules apply (default row/column/box all-different, no
// jigsaw regions in the source). Eight 3-cell thermometers require strictly
// increasing digits starting at the round bulb (Thermo's first cell). Eight
// XV pairs are marked "X" (sum to 10); the rules state the X/V marks are not
// exhaustive, so unmarked adjacent pairs carry no sum constraint and are
// left unencoded. No "V" (sum-to-5) marks appear in the source.

return [
  new Shape('9x9'),

  // Givens (drawn grid).
  new Given('R1C3', 3),
  new Given('R2C5', 6),
  new Given('R3C7', 4),
  new Given('R4C9', 6),
  new Given('R6C1', 6),
  new Given('R7C3', 6),
  new Given('R8C5', 5),
  new Given('R9C7', 6),

  // Thermometers (drawn lines, bulb cell first).
  new Thermo('R1C1', 'R1C2', 'R1C3'),
  new Thermo('R2C5', 'R2C4', 'R2C3'),
  new Thermo('R3C5', 'R3C6', 'R3C7'),
  new Thermo('R4C9', 'R4C8', 'R4C7'),
  new Thermo('R6C3', 'R6C2', 'R6C1'),
  new Thermo('R7C3', 'R7C4', 'R7C5'),
  new Thermo('R8C7', 'R8C6', 'R8C5'),
  new Thermo('R9C7', 'R9C8', 'R9C9'),

  // XV pairs (drawn marks, all value "X" -- sum to 10).
  new X('R2C2', 'R1C2'),
  new X('R2C4', 'R3C4'),
  new X('R4C6', 'R3C6'),
  new X('R4C8', 'R5C8'),
  new X('R6C2', 'R5C2'),
  new X('R7C4', 'R6C4'),
  new X('R8C6', 'R7C6'),
  new X('R9C8', 'R8C8'),
];
