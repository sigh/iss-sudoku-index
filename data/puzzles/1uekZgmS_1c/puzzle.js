// Title: X-Box 180
// Author: ZegreS
// Video: https://www.youtube.com/watch?v=1uekZgmS_1c
// Source: https://app.crackingthecryptic.com/sudoku/jJRTHJfDQG

// Normal sudoku rules (default row/column/box all-different from Shape('9x9')
// on the standard 3x3 regions).
//
// Each arrow's circle cell equals the sum of its arm's two cells. The four
// circles are unlabelled (no printed digit); each anchors two arrows.
const arrows = [
  new Arrow('R2C4', 'R2C5', 'R2C6'),
  new Arrow('R2C4', 'R1C5', 'R1C6'),
  new Arrow('R8C6', 'R8C5', 'R8C4'),
  new Arrow('R8C6', 'R9C5', 'R9C4'),
  new Arrow('R4C8', 'R5C8', 'R6C8'),
  new Arrow('R4C8', 'R5C9', 'R6C9'),
  new Arrow('R6C2', 'R5C2', 'R4C2'),
  new Arrow('R6C2', 'R5C1', 'R4C1'),
];

// Green lines: adjacent cells differ by at least 5. Two diagonals per corner
// box (an X through the box's centre cell) plus two vertical lines in the
// centre box's left and right columns.
const greenLines = [
  new Whisper(5, 'R1C1', 'R2C2', 'R3C3'),
  new Whisper(5, 'R3C1', 'R2C2', 'R1C3'),
  new Whisper(5, 'R1C7', 'R2C8', 'R3C9'),
  new Whisper(5, 'R1C9', 'R2C8', 'R3C7'),
  new Whisper(5, 'R7C1', 'R8C2', 'R9C3'),
  new Whisper(5, 'R7C3', 'R8C2', 'R9C1'),
  new Whisper(5, 'R7C7', 'R8C8', 'R9C9'),
  new Whisper(5, 'R7C9', 'R8C8', 'R9C7'),
  new Whisper(5, 'R4C4', 'R5C4', 'R6C4'),
  new Whisper(5, 'R4C6', 'R5C6', 'R6C6'),
];

// Kropki dots. Not all possible dots are given, so no negative constraint
// elsewhere.
const dots = [
  new WhiteDot('R3C6', 'R3C7'),
  new WhiteDot('R6C7', 'R6C8'),
  new WhiteDot('R7C3', 'R7C4'),
  new BlackDot('R6C1', 'R7C1'),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...greenLines,
  ...dots,
];
