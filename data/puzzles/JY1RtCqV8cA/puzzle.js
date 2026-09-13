// Title: Karina
// Author: Balshoj
// Video: https://www.youtube.com/watch?v=JY1RtCqV8cA
// Source: https://sudokupad.app/hvqwgq1bqo

// Normal sudoku rules apply.
// German whisper (green line): adjacent digits differ by at least 5.
// Dutch whisper (orange line): adjacent digits differ by at least 4.
// X: the two connected cells sum to 10.
// Thermometer: digits increase starting from the bulb end.
//
// Several whisper lines are branching figures: two or more drawn strokes
// meet at a shared interior cell. Each stroke below is transcribed as its
// own Whisper, matching the payload's separate `line` entries, so only the
// edges actually drawn are constrained -- not every pair that happens to
// touch the shared hub cell. The comment on each branch names its hub.
// One green line's waypoints run diagonally between two consecutive cells
// (R8C4->R9C5 and R8C6->R7C7); Whisper binds consecutive cells by list
// order, not grid adjacency, so that is still one continuous line.

return [
  new Shape('9x9'),

  // Green whisper lines (diff >= 5).
  new Whisper(5, 'R1C1', 'R2C1', 'R3C1'),
  new Whisper(5, 'R1C2', 'R2C1'), // branch onto the line above, hub R2C1
  new Whisper(5, 'R3C2', 'R2C1'), // branch onto the line above, hub R2C1
  new Whisper(5, 'R3C4', 'R2C4', 'R1C5', 'R2C6', 'R3C6'),
  new Whisper(5, 'R2C5', 'R2C6'), // branch onto the line above, hub R2C6
  new Whisper(5, 'R3C7', 'R2C7', 'R1C7', 'R1C8', 'R2C8', 'R3C9'),
  new Whisper(5, 'R6C7', 'R5C7', 'R4C8', 'R5C9', 'R6C9'),
  new Whisper(5, 'R5C8', 'R5C9'), // branch onto the line above, hub R5C9
  new Whisper(5, 'R6C4', 'R5C4', 'R4C4', 'R5C5', 'R6C6', 'R5C6', 'R4C6'),
  new Whisper(5, 'R9C4', 'R8C4', 'R9C5', 'R8C6', 'R7C7', 'R8C8', 'R9C9'),

  // Orange whisper lines (diff >= 4).
  new Whisper(4, 'R6C1', 'R6C2', 'R6C3'),
  new Whisper(4, 'R5C2', 'R6C2'), // branch onto the line above, hub R6C2
  new Whisper(4, 'R4C3', 'R4C2', 'R4C1'),

  // X marks (sum to 10).
  new X('R3C2', 'R2C2'),
  new X('R9C2', 'R8C2'),

  // Thermometer, increasing from the bulb.
  new Thermo('R1C9', 'R2C9', 'R2C8'),
];
