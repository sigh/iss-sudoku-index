// Title: Crowd Control
// Author: Allagem
// Video: https://www.youtube.com/watch?v=w2eA6JZULiU
// Source: https://app.crackingthecryptic.com/sudoku/7bprG39P87

// Normal sudoku rules apply (default row/column/box all-different; the
// payload's regions are the standard 3x3 boxes). Digits along grey lines
// between two circles must have values between those circles -- encoded as
// Between, whose first/last cells are the circle cells. Adjacent digits on a
// green line differ by 5 or more -- encoded as Whisper(5). Cells separated by
// the white dot must be consecutive -- WhiteDot. Cells separated by the black
// dot have a 1:2 ratio -- BlackDot. The inequality sign points to the smaller
// cell: an unrotated ">" on the edge R4C2/R4C3 points at R4C3, so R4C2 is
// greater -- GreaterThan('R4C2', 'R4C3').

// Grey between lines: hand-transcribed from the drawn line waypoints and the
// unlabelled circle overlays past each line's stub end. Line 4's middle run
// is drawn offset from the row-3 cell centres to stay visible alongside the
// green line that shares those same three cells.
const betweenLines = [
  new Between('R9C8', 'R8C8', 'R7C8', 'R6C9', 'R6C8'),
  new Between('R9C2', 'R8C2', 'R7C2', 'R6C1', 'R6C2'),
  new Between('R5C1', 'R5C2', 'R5C3', 'R6C4', 'R5C5', 'R6C6', 'R5C7', 'R5C8', 'R5C9'),
  new Between('R5C4', 'R4C4', 'R3C4', 'R3C5', 'R3C6', 'R4C6', 'R5C6'),
  new Between('R3C1', 'R3C2', 'R2C3', 'R1C2'),
  new Between('R3C9', 'R3C8', 'R2C7', 'R1C8'),
];

// Green difference lines: hand-transcribed from the drawn green line
// waypoints, in drawn walk order (two of them revisit a box, so cell order
// matters).
const greenLines = [
  new Whisper(5, 'R2C4', 'R3C4', 'R3C5', 'R3C6', 'R2C6'),
  new Whisper(5, 'R3C1', 'R4C1', 'R5C1'),
  new Whisper(5, 'R3C9', 'R4C9', 'R5C9'),
  new Whisper(5, 'R6C2', 'R7C3', 'R8C4', 'R9C3', 'R9C2'),
  new Whisper(5, 'R6C8', 'R7C7', 'R8C6', 'R9C7', 'R9C8'),
];

return [
  new Shape('9x9'),
  new Given('R1C5', 5),
  ...betweenLines,
  ...greenLines,
  new WhiteDot('R8C5', 'R9C5'),
  new BlackDot('R6C9', 'R7C9'),
  new GreaterThan('R4C2', 'R4C3'),
];
