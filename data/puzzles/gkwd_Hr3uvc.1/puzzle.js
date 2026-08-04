// Title: 3/3/23: Killing Me Softly
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=gkwd_Hr3uvc
// Source: https://tinyurl.com/46dx5asu

// Normal sudoku rules apply (default row/column/box all-different, no givens).
// Killer: each cage's digits are all different and sum to the given total
// (Cage enforces both). Cage cells and totals are transcribed from the
// `killercage` array.
// German Whispers: adjacent digits along a green line differ by at least 5
// (Whisper's default difference is 5, matching the rule). Line cells are
// transcribed from the `whispers` array, each whisper as one continuous path
// in its listed cell order.

const cages = [
  new Cage(9, 'R1C3', 'R1C4', 'R2C3'),
  new Cage(10, 'R1C6', 'R1C7', 'R2C7'),
  new Cage(20, 'R8C3', 'R9C3', 'R9C4'),
  new Cage(21, 'R8C7', 'R9C6', 'R9C7'),
  new Cage(19, 'R6C1', 'R7C1', 'R7C2'),
  new Cage(11, 'R3C8', 'R3C9', 'R4C9'),
  new Cage(12, 'R6C9', 'R7C8', 'R7C9'),
  new Cage(18, 'R3C1', 'R3C2', 'R4C1'),
  new Cage(8, 'R3C3', 'R3C4', 'R4C3'),
  new Cage(22, 'R6C7', 'R7C6', 'R7C7'),
  new Cage(17, 'R6C3', 'R6C4', 'R7C4'),
  new Cage(13, 'R3C6', 'R4C6', 'R4C7'),
];

const whispers = [
  new Whisper('R9C6', 'R9C7'),
  new Whisper('R1C6', 'R1C7', 'R2C7'),
  new Whisper('R8C3', 'R9C3', 'R9C4'),
  new Whisper('R7C1', 'R7C2', 'R6C1'),
  new Whisper('R3C9', 'R3C8', 'R4C9'),
  new Whisper('R7C8', 'R6C9', 'R7C9'),
  new Whisper('R3C2', 'R4C1', 'R3C1'),
  new Whisper('R1C3', 'R1C4'),
  new Whisper('R5C4', 'R6C4'),
  new Whisper('R5C6', 'R4C6'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...whispers,
];
