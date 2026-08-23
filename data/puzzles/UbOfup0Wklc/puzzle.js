// Title: Happy Birthday muffin
// Author: Testarossa
// Video: https://www.youtube.com/watch?v=UbOfup0Wklc
// Source: https://app.crackingthecryptic.com/sudoku/9MQmRjRnTp

// Normal sudoku rules apply (standard 3x3 boxes, no givens). One killer
// cage shows its sum. Two whisper lines: adjacent digits on a line must
// differ by at least 5. Both lines carry the same rule; their colours
// (#D23BE7, #A3E048) are not distinguished by the rules text.

// Cage cells and total from the drawn cage.
const cage = new Cage(9, 'R7C4', 'R7C5');

// Line A: straight waypoint segments expanded to the cells they pass
// through, in drawn order. The path revisits R3C4 -- once partway along
// (between R2C3 and R3C5) and again as its final cell (arriving from
// R4C3) -- so R3C4 gets three whisper edges from its two visits; Whisper
// binds by list order so this is faithful to the drawn self-crossing
// stroke.
const lineA = new Whisper(
  'R2C2', 'R1C3', 'R2C3', 'R3C4', 'R3C5', 'R3C6', 'R2C6', 'R1C6', 'R1C7',
  'R2C8', 'R3C8', 'R4C8', 'R5C9', 'R6C9', 'R7C8', 'R8C7', 'R9C6', 'R9C5',
  'R8C4', 'R8C3', 'R8C2', 'R7C1', 'R6C1', 'R6C2', 'R6C3', 'R5C3', 'R4C3',
  'R3C4');

// Line B: same expansion, from the second drawn line.
const lineB = new Whisper(
  'R7C3', 'R7C2', 'R6C2', 'R5C2', 'R5C3', 'R5C4', 'R4C5', 'R3C5', 'R2C5',
  'R2C6', 'R2C7', 'R3C7');

return [
  new Shape('9x9'),
  cage,
  lineA,
  lineB,
];
