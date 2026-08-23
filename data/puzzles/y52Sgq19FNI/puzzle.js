// Title: Invisible Grids
// Author: Noah Bennett
// Video: https://www.youtube.com/watch?v=y52Sgq19FNI
// Source: https://app.crackingthecryptic.com/sudoku/24fR33JG4f
//
// Normal sudoku rules (standard rows/cols/boxes). One thermometer increases
// from its bulb. White dots mark consecutive adjacent digits, black dots
// mark a 1:2 ratio between adjacent digits (both scoped to the drawn dots
// only -- the rules never state all such dots are given). Seven arrows sum
// their arm cells to the circled bulb digit; two arrows share the circle
// at R2C4. Anti-knight and anti-king: identical digits may not be a
// knight's move or a king's move apart, anywhere in the grid.

return [
  new Shape('9x9'),

  new Given('R4C1', 1),
  new Given('R7C8', 9),

  // Single thermometer, bulb-first; bulb confirmed by the grey circle
  // overlay at R3C4, matching the line's first waypoint.
  new Thermo('R3C4', 'R4C5', 'R3C5', 'R3C6', 'R4C6', 'R5C6'),

  // Arrows: bulb cell first, then arm cells in drawn order. Two arrows
  // share the R2C4 circle (both drawn starting there).
  new Arrow('R2C4', 'R2C3', 'R3C3', 'R4C2'),
  new Arrow('R2C4', 'R2C5', 'R1C6'),
  new Arrow('R1C8', 'R2C7', 'R2C8', 'R3C8'),
  new Arrow('R5C6', 'R6C6', 'R6C7', 'R5C8'),
  new Arrow('R4C9', 'R5C9', 'R6C8'),
  new Arrow('R8C7', 'R7C7', 'R8C8', 'R9C9'),
  new Arrow('R8C2', 'R8C3', 'R7C3', 'R7C4'),

  // Kropki dots (edge overlays; WhiteDot/BlackDot bind by grid adjacency).
  new WhiteDot('R4C5', 'R5C5'),
  new WhiteDot('R1C4', 'R2C4'),
  new WhiteDot('R2C3', 'R3C3'),
  new WhiteDot('R8C1', 'R9C1'),

  new BlackDot('R3C3', 'R4C3'),
  new BlackDot('R5C5', 'R6C5'),
  new BlackDot('R5C7', 'R6C7'),
  new BlackDot('R4C8', 'R5C8'),

  new AntiKnight(),
  new AntiKing(),
];
