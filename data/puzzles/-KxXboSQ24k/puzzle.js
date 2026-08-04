// Title: Happy Valentine's Day
// Author: Jackisaacbryan
// Video: https://www.youtube.com/watch?v=-KxXboSQ24k
// Source: https://app.crackingthecryptic.com/sudoku/P38mrJ6NHg

// Normal sudoku rules apply (standard rows/cols/boxes, from the default
// 9x9 Shape). Anti-knight: no two cells a knight's move apart share a digit.
// Seven red lines (all one colour/weight): adjacent cells along each line
// must differ by at least 5 -- Whisper's default difference is 5, matching
// the rules text, so no explicit difference argument is passed.
// Closed loops repeat their first cell at the end of the cell list so
// Whisper's consecutive-pair binding covers the wrap-around edge too.
// An eighth `lines[]` entry in the source has no wayPoints (no geometry) and
// is omitted -- it covers no cells.

const smallLoop = new Whisper(
  'R1C2', 'R2C2', 'R2C3', 'R1C3', 'R1C2');

// Two independent 2-cell diagonal whisper lines (no shared endpoints).
const diagonalPair1 = new Whisper('R2C4', 'R3C5');
const diagonalPair2 = new Whisper('R2C5', 'R3C4');

// Vertical and horizontal whisper lines crossing at R7C3; drawn as two
// separate entries in the source, not one continuous path.
const verticalLine = new Whisper('R6C3', 'R7C3', 'R8C3');
const horizontalLine = new Whisper('R7C2', 'R7C3', 'R7C4');

// Two mirrored 8-cell closed heart-shaped whisper loops.
const heartLoopLeft = new Whisper(
  'R4C5', 'R5C5', 'R6C5', 'R5C6', 'R4C7', 'R3C7', 'R4C6', 'R3C6', 'R4C5');
const heartLoopRight = new Whisper(
  'R6C6', 'R5C7', 'R6C7', 'R5C8', 'R6C8', 'R7C7', 'R8C6', 'R7C6', 'R6C6');

return [
  new Shape('9x9'),
  new Given('R2C8', 2),
  new AntiKnight(),
  smallLoop,
  diagonalPair1,
  diagonalPair2,
  verticalLine,
  horizontalLine,
  heartLoopLeft,
  heartLoopRight,
];
