// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=-zQ7AfCwJZI
// Source: https://cracking-the-cryptic.web.app/sudoku/PgpmP3Gf8B

// Normal Sudoku rules apply. German whispers: adjacent digits along a grey
// line must differ by at least 5.
//
// The source payload carries no rules text; the ruleset comes from the video
// description, which links this exact source URL and calls it a German
// Whispers puzzle, and from the video title "Searching High and Low".

return [
  new Shape('9x9'),

  // Givens, from the payload's cell values.
  new Given('R1C3', 4),
  new Given('R1C4', 9),
  new Given('R5C4', 3),
  new Given('R5C9', 5),
  new Given('R8C1', 2),
  new Given('R9C5', 8),

  // The six grey strokes, in drawn order. All are the same colour and
  // thickness, and together they spell the series label "SVS" over "271".
  //
  // The V, 2, 7 and 1 run vertex-to-vertex through cell centres.
  //
  // Each S is one continuous stroke -- arch, 45-degree diagonal, cup -- drawn
  // with chamfered rather than square corners, so its cells are read by
  // arc-length occupancy: seven cells carrying 0.88-1.41 cell-widths of ink
  // each, consecutive ones meeting at a shared grid corner. The chamfers
  // remove the square corners, which is why R1C1/R1C3/R5C1/R5C3 (left S) and
  // R1C7/R1C9/R5C7/R5C9 (right S) are not on the line: no ink falls in them.
  new Whisper(5, 'R2C3', 'R1C2', 'R2C1', 'R3C2', 'R4C3', 'R5C2', 'R4C1'), // S
  new Whisper(5, 'R2C4', 'R3C4', 'R4C4', 'R5C5', 'R4C6', 'R3C6', 'R2C6'), // V
  new Whisper(5, 'R2C9', 'R1C8', 'R2C7', 'R3C8', 'R4C9', 'R5C8', 'R4C7'), // S
  new Whisper(5, 'R7C2', 'R7C3', 'R8C3', 'R8C2', 'R9C2', 'R9C3'),         // 2
  new Whisper(5, 'R7C5', 'R7C6', 'R8C6', 'R9C6'),                         // 7
  new Whisper(5, 'R7C9', 'R8C9', 'R9C9'),                                 // 1
];
