// Title: Jan. 12, 2022: Greater Than
// Author: clover!
// Video: https://www.youtube.com/watch?v=qSatXlZTaU0
// Source: https://tinyurl.com/kkrvnps7

// Normal sudoku rules apply. Some inequality signs (< or >) are drawn on
// the shared border of orthogonally adjacent cell pairs; the two digits
// must obey the sign, whose open end points to the larger digit.
//
// The payload's `circle` array gives each sign as two cells plus the
// drawn glyph. For a horizontal pair (no rotation), the glyph is read
// literally left cell <glyph> right cell, and this reading is
// self-consistent across every row it appears in (each affected row
// alternates rise/fall with no contradiction).
//
// For a vertical pair the glyph is rotated +90 or -90 degrees, and the
// payload does not pin down which physical cell (top or bottom) plays
// the "read first" role under a rotation -- both possible readings are
// independently self-consistent along every affected column, so neither
// can be selected from the local data or from the rules text. This is a
// single global fact about the drawing convention, not a per-mark
// choice: either every rotated sign is read top-then-glyph-then-bottom,
// or every one of them is read bottom-then-glyph-then-top. The disjunction
// below encodes exactly that global two-way choice, applied to the full
// set of 14 rotated signs (transcribed from the `circle` entries with a
// non-zero `angle`) at once.

return [
  new Shape('9x9'),

  new Given('R1C1', 6),
  new Given('R1C3', 9),
  new Given('R1C9', 4),
  new Given('R2C7', 5),
  new Given('R3C1', 7),
  new Given('R3C3', 8),
  new Given('R4C4', 2),
  new Given('R4C6', 3),
  new Given('R6C4', 1),
  new Given('R6C6', 4),
  new Given('R7C7', 6),
  new Given('R7C9', 8),
  new Given('R8C3', 5),
  new Given('R9C1', 1),
  new Given('R9C7', 7),
  new Given('R9C9', 9),

  // Horizontal inequality signs (angle 0): read directly, left cell then
  // right cell, per the drawn glyph. Transcribed from `circle`.
  new GreaterThan('R2C1', 'R2C2'),
  new GreaterThan('R2C3', 'R2C2'),
  new GreaterThan('R2C3', 'R2C4'),
  new GreaterThan('R2C6', 'R2C7'),
  new GreaterThan('R2C8', 'R2C7'),
  new GreaterThan('R2C8', 'R2C9'),
  new GreaterThan('R5C3', 'R5C4'),
  new GreaterThan('R5C4', 'R5C5'),
  new GreaterThan('R5C6', 'R5C5'),
  new GreaterThan('R5C7', 'R5C6'),
  new GreaterThan('R8C2', 'R8C1'),
  new GreaterThan('R8C2', 'R8C3'),
  new GreaterThan('R8C4', 'R8C3'),
  new GreaterThan('R8C7', 'R8C6'),
  new GreaterThan('R8C7', 'R8C8'),
  new GreaterThan('R8C9', 'R8C8'),

  // Vertical inequality signs (angle +90 or -90, opposite rotations): the
  // drawing convention that decides which physical cell (top or bottom)
  // reads first is not recoverable from the payload (see header). This is
  // a single global fact about the rotation, not a per-mark choice, so
  // it applies oppositely to the two angle values within one branch: one
  // branch reads angle:90 marks top-first and angle:-90 marks
  // bottom-first, the other branch reads the opposite way round for both
  // angles. Every mark below is transcribed with its glyph and rotation
  // resolved into one committed reading per branch.
  new Or([
    new And([
      new GreaterThan('R1C2', 'R2C2'),
      new GreaterThan('R2C8', 'R1C8'),
      new GreaterThan('R3C2', 'R2C2'),
      new GreaterThan('R2C8', 'R3C8'),
      new GreaterThan('R3C2', 'R4C2'),
      new GreaterThan('R4C8', 'R3C8'),
      new GreaterThan('R4C5', 'R5C5'),
      new GreaterThan('R6C5', 'R5C5'),
      new GreaterThan('R6C2', 'R7C2'),
      new GreaterThan('R7C8', 'R6C8'),
      new GreaterThan('R8C2', 'R7C2'),
      new GreaterThan('R7C8', 'R8C8'),
      new GreaterThan('R8C2', 'R9C2'),
      new GreaterThan('R9C8', 'R8C8'),
    ]),
    new And([
      new GreaterThan('R2C2', 'R1C2'),
      new GreaterThan('R1C8', 'R2C8'),
      new GreaterThan('R2C2', 'R3C2'),
      new GreaterThan('R3C8', 'R2C8'),
      new GreaterThan('R4C2', 'R3C2'),
      new GreaterThan('R3C8', 'R4C8'),
      new GreaterThan('R5C5', 'R4C5'),
      new GreaterThan('R5C5', 'R6C5'),
      new GreaterThan('R7C2', 'R6C2'),
      new GreaterThan('R6C8', 'R7C8'),
      new GreaterThan('R7C2', 'R8C2'),
      new GreaterThan('R8C8', 'R7C8'),
      new GreaterThan('R9C2', 'R8C2'),
      new GreaterThan('R8C8', 'R9C8'),
    ]),
  ]),
];
