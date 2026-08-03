// Title: 4/30: Silent Green is, People
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=xVCTL0Bc52o
// Source: https://tinyurl.com/227e6ckj

// Normal sudoku rules apply.
// German Whispers: digits directly connected by a green line must differ by
// at least 5 (the default difference for Whisper, so it is omitted below).
// Four separate lines are drawn (no shared cells); each is encoded as its
// own Whisper so the difference applies only within each line.

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R1C8', 8),
  new Given('R1C9', 6),
  new Given('R2C1', 2),
  new Given('R4C4', 1),
  new Given('R4C5', 2),
  new Given('R4C6', 3),
  new Given('R5C4', 4),
  new Given('R5C5', 5),
  new Given('R5C6', 6),
  new Given('R6C4', 7),
  new Given('R6C5', 8),
  new Given('R6C6', 9),
  new Given('R8C9', 7),
  new Given('R9C1', 4),
  new Given('R9C2', 3),
  new Given('R9C9', 9),

  new Whisper('R6C3', 'R5C3', 'R4C3', 'R3C3', 'R2C3', 'R1C3'),
  new Whisper('R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9'),
  new Whisper('R4C7', 'R5C7', 'R6C7', 'R7C7', 'R8C7', 'R9C7'),
  new Whisper('R7C6', 'R7C5', 'R7C4', 'R7C3', 'R7C2', 'R7C1'),
];
