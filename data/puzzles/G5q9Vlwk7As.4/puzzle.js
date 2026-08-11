// Title: August 7, 2022: Germane Gossip
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=G5q9Vlwk7As
// Source: https://tinyurl.com/2smu9bua

// Normal sudoku rules apply (standard rows/cols/boxes, from the default 9x9
// Shape). Two green lines: adjacent cells along each line must differ by at
// least 5 -- Whisper's default difference is 5, matching the rules text, so
// no explicit difference argument is passed. Both paths are open (their
// first and last cells differ), so no wrap-around edge is needed.

const lineA = new Whisper(
  'R4C1', 'R3C2', 'R2C3', 'R1C4', 'R2C5', 'R3C6', 'R3C5', 'R3C4', 'R4C5',
  'R5C4', 'R6C3', 'R5C3', 'R4C3', 'R5C2', 'R6C1', 'R7C2', 'R8C3', 'R9C4');

const lineB = new Whisper(
  'R6C9', 'R7C8', 'R8C7', 'R9C6', 'R8C5', 'R7C4', 'R7C5', 'R7C6', 'R6C5',
  'R5C6', 'R4C7', 'R5C7', 'R6C7', 'R5C8', 'R4C9', 'R3C8', 'R2C7', 'R1C6');

return [
  new Shape('9x9'),
  new Given('R2C4', 9),
  new Given('R3C7', 7),
  new Given('R4C2', 2),
  new Given('R4C6', 4),
  new Given('R5C5', 5),
  new Given('R6C4', 6),
  new Given('R6C8', 8),
  new Given('R7C3', 3),
  new Given('R8C6', 1),
  lineA,
  lineB,
];
