// Title: That's [redacted] in the Corner
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=Sf4HrHEP7ic
// Source: https://beta.sudokupad.app/q3R9PRg4qF
//
// Normal sudoku rules apply (rows, columns, boxes). Cages show sums with
// distinct digits within the cage. Digits on arrows sum to the digit in the
// connected circle, repeats allowed on the arrow. Along the green line,
// consecutive digits differ by at least 5. The gray-square cell's digit is
// even. Black dots mark a 1:2 ratio between the two cells they join.
//
// The fog/light-source mechanic is solving-progress UI (two seeded reveal
// blocks, digits reveal neighbours as they're placed); it constrains what is
// visible during solving, not the completed grid, so it is not encoded.

return [
  new Shape('9x9'),

  // Killer cages (cells from the payload's `cages` array).
  new Cage(6, 'R2C1', 'R2C2', 'R3C2'),
  new Cage(14, 'R8C8', 'R8C9'),

  // Arrows: bulb cell first, then arm cells (payload `arrows`, bulb snapped
  // to the matching circle overlay).
  new Arrow('R1C4', 'R2C4', 'R3C3'),
  new Arrow('R6C5', 'R5C4', 'R6C3'),
  new Arrow('R6C7', 'R7C8'),

  // Green difference line: adjacent cells differ by at least 5 (payload's
  // single `lines` entry, color #A3E048).
  new Whisper(5,
    'R3C9', 'R2C9', 'R1C9', 'R1C8', 'R1C7', 'R2C7', 'R3C6', 'R4C6', 'R4C5',
    'R5C5', 'R5C4', 'R5C3', 'R6C3', 'R6C2', 'R7C1', 'R8C1', 'R9C2', 'R9C3',
    'R8C4', 'R9C5'),

  // Gray square: digit must be even. No dedicated Even class, so restrict
  // the candidate set directly (payload's single `underlays` entry).
  new Given('R5C6', 2, 4, 6, 8),

  // Black dots: 1:2 ratio between the joined pair (payload's small
  // edge-centered `overlays` marks).
  new BlackDot('R2C1', 'R2C2'),
  new BlackDot('R3C2', 'R3C3'),
  new BlackDot('R5C1', 'R6C1'),
  new BlackDot('R7C4', 'R8C4'),
  new BlackDot('R7C8', 'R8C8'),
  new BlackDot('R8C9', 'R9C9'),
  new BlackDot('R9C8', 'R9C9'),
];
