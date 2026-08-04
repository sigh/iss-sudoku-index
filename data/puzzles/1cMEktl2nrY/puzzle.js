// Title: Two Lines and a Dot
// Author: Jim Taylor
// Video: https://www.youtube.com/watch?v=1cMEktl2nrY
// Source: https://app.crackingthecryptic.com/sudoku/f7hr9rq96H

// Normal sudoku, plus anti-knight (identical digits cannot be a knight's
// move apart). Each yellow-green line is a "difference line": no digit
// repeats anywhere on the line (AllDifferent), and orthogonally adjacent
// cells on it differ by at least 5 (Whisper(5)). One black Kropki dot
// enforces a 1:2 ratio between its two cells. The `cages` array in the
// source payload holds only metadata stubs (title/author/rules text), no
// real cages.

// Line cells, transcribed from the two drawn yellow-green polylines.
const lineA = ['R5C3', 'R4C4', 'R3C5', 'R2C6', 'R3C7', 'R4C7', 'R5C7', 'R6C7'];
const lineB = ['R5C1', 'R6C1', 'R7C2', 'R8C3', 'R9C4', 'R8C4', 'R9C5', 'R8C6'];

return [
  new Shape('9x9'),
  new AntiKnight(),

  new Whisper(5, ...lineA),
  new AllDifferent(...lineA),
  new Whisper(5, ...lineB),
  new AllDifferent(...lineB),

  // Black dot: drawn edge-sized rounded mark on the row-edge between
  // R5C3 and R6C3 (col 3).
  new BlackDot('R5C3', 'R6C3'),
];
