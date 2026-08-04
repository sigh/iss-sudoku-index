// Title: [\]
// Author: Sotek
// Video: https://www.youtube.com/watch?v=lBwi5xckpGE
// Source: https://app.crackingthecryptic.com/sudoku/P7j2jrgNNJ

// Rules: Normal sudoku rules apply. Digits on the marked diagonal do not
// repeat (Diagonal). Adjacent digits along a green line have a difference of
// at least 5 (Whisper, default difference is 5).
//
// The green marks are drawn as 21 separate two-cell strokes (some sharing an
// endpoint cell, e.g. three strokes meet at R3C3). The rule only constrains
// digits directly adjacent along a line, so each stroke is encoded as its own
// independent Whisper pair rather than merged into longer chains through the
// shared cell -- merging would additionally constrain the two non-adjacent
// far cells of the meeting strokes, which the rule text does not require.
// Cell pairs are transcribed from the drawn line segments.
const whiskerEdges = [
  ['R2C2', 'R3C3'],
  ['R3C3', 'R3C4'],
  ['R3C3', 'R4C3'],
  ['R3C1', 'R3C2'],
  ['R1C3', 'R2C3'],
  ['R5C3', 'R6C3'],
  ['R7C3', 'R8C3'],
  ['R3C5', 'R3C6'],
  ['R3C7', 'R3C8'],
  ['R4C4', 'R5C5'],
  ['R6C6', 'R7C7'],
  ['R8C8', 'R9C9'],
  ['R6C5', 'R6C6'],
  ['R6C3', 'R6C4'],
  ['R6C1', 'R6C2'],
  ['R6C8', 'R6C9'],
  ['R3C6', 'R4C6'],
  ['R5C6', 'R6C6'],
  ['R8C6', 'R9C6'],
  ['R8C2', 'R9C2'],
  ['R2C8', 'R2C9'],
  ['R8C9', 'R9C8'],
];

return [
  new Shape('9x9'),

  new Given('R1C2', 2),
  new Given('R2C5', 3),
  new Given('R4C8', 9),
  new Given('R5C2', 1),
  new Given('R8C4', 9),

  // Direction -1 is the top-left-to-bottom-right diagonal, matching the
  // drawn R1C1-R9C9 line.
  new Diagonal(-1),

  ...whiskerEdges.map(([a, b]) => new Whisper(5, a, b)),
];
