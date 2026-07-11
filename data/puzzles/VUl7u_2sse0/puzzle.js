// Title: Supersonic Slingshots
// Author: DubiousMobius
// Video: https://www.youtube.com/watch?v=VUl7u_2sse0
// Source: https://sudokupad.app/ix1pl0qk4b

// Normal sudoku (standard 3x3 boxes) plus the Kropki dots recovered from the
// source drawing. The toroidal wrap has no independent effect here (none of
// the recovered dots straddle the wrap seam), so it needs no extra
// constraint once the Supersonic Slingshot mechanic is omitted. The
// slingshot devices themselves are omitted: their cell geometry could not
// be recovered from the source payload.

return [
  new Shape('9x9'),

  new BlackDot('R1C3', 'R2C3'),
  new BlackDot('R1C9', 'R2C9'),
  new BlackDot('R7C1', 'R7C2'),

  new WhiteDot('R5C1', 'R5C2'),
  new WhiteDot('R5C5', 'R5C6'),
  new WhiteDot('R7C9', 'R8C9'),
];
