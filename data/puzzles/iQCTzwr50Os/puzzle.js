// Title: Anti-Fortress Arrow Sudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=iQCTzwr50Os
// Source: https://app.crackingthecryptic.com/sudoku/bphB49D4R8

// Normal sudoku rules apply (standard 3x3 boxes).
// Arrow: digits along the arrow sum to the digit in its circle; digits may
// repeat along an arrow.
// Anti-fortress: each grey cell (R2C6, R5C5, R6C8, from the payload's shaded
// underlays) is smaller than every orthogonally-adjacent cell.
// The payload's 12 short (headLength 0.2) chevron-stub arrow entries ringing
// the three grey cells are the UI's direction indicators for the
// anti-fortress rule, not additional sum-arrow clues, so they are not encoded
// separately.
return [
  new Shape('9x9'),

  // GreaterThan lists a cell before every later cell it must exceed, but only
  // enforces a pair when the two are grid-adjacent; listing each grey cell's
  // orthogonal neighbours first (none of which are adjacent to each other)
  // and the grey cell last yields exactly "grey cell < each neighbour".
  new GreaterThan('R1C6', 'R3C6', 'R2C5', 'R2C7', 'R2C6'),
  new GreaterThan('R4C5', 'R6C5', 'R5C4', 'R5C6', 'R5C5'),
  new GreaterThan('R5C8', 'R7C8', 'R6C7', 'R6C9', 'R6C8'),

  // Arrows: bulb cell first, then arm cells in path order (transcribed from
  // the payload's arrow waypoints and circle underlays).
  new Arrow('R2C3', 'R1C2', 'R2C1'),
  new Arrow('R3C1', 'R4C2', 'R5C3'),
  new Arrow('R4C1', 'R5C2', 'R6C3'),
  new Arrow('R3C4', 'R4C5', 'R5C6'),
  new Arrow('R8C7', 'R9C8', 'R9C9'),
  new Arrow('R1C5', 'R2C5', 'R3C5'),
  new Arrow('R3C9', 'R4C9', 'R5C9', 'R5C8'),
  new Arrow('R7C8', 'R7C9', 'R6C9'),
  new Arrow('R7C5', 'R8C5', 'R9C5'),
  new Arrow('R7C3', 'R8C3', 'R9C3'),
  new Arrow('R7C6', 'R6C5', 'R5C4'),
  new Arrow('R1C8', 'R2C7', 'R1C6'),
];
