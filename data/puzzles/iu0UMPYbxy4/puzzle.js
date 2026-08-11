// Title: Perpetual Motion Of Kind '0'
// Author: Sumanta Mukherjee
// Video: https://www.youtube.com/watch?v=iu0UMPYbxy4
// Source: https://app.crackingthecryptic.com/sudoku/BthBMRbt7M

// Normal sudoku rules apply (standard 3x3 boxes, drawn regions confirm this).
// Thermometers: digits strictly increase away from the bulb (Thermo's own
// semantics). The R5C2 thermometer forks into two arms (R4C1 and R6C1); the
// underlay bulb circle sits only at R5C2, so this is one Y-shaped clue, not
// two independent thermometers -- encoded as two Thermo constraints sharing
// the bulb cell.
// Dots: black = 1:2 ratio, white = consecutive (Kropki). "Not all dots are
// given" is a disclaimer against inferring absence elsewhere; no negative
// constraint is added.
// Blue lines: classic between-lines. Each drawn stroke curves from inside one
// circled cell, through the straight run of "between" cells, into the other
// circled cell -- Between()'s own first/last-cell-is-a-circle convention.
// Orange line: three consecutive digits in any order whose maximum is
// divisible by 3. Checking n, n+1, n+2 for n in 1..7 against (n+2) % 3 == 0
// leaves exactly three candidate triples: {1,2,3}, {4,5,6}, {7,8,9}. The
// three cells share row 5, so the row all-different constraint already forces
// any assignment drawn from one of these sets to be "in any order"; no extra
// AllDifferent is needed.
// Inequality: an unrotated "^" glyph on the edge between R8C3 (above) and
// R9C3 (below); the rules state the sign points at the lower digit, so the
// upward apex marks R8C3 as the smaller value.

return [
  new Shape('9x9'),

  new Given('R3C9', 5),
  new Given('R6C9', 4),

  // Thermometers (bulb cell first).
  new Thermo('R2C2', 'R3C1'),
  new Thermo('R2C6', 'R2C5', 'R2C4'),
  new Thermo('R3C9', 'R2C8'),
  new Thermo('R5C9', 'R4C9'),
  new Thermo('R5C6', 'R6C6', 'R6C5'),
  new Thermo('R5C4', 'R4C4', 'R4C5'),
  new Thermo('R5C2', 'R4C1'),
  new Thermo('R5C2', 'R6C1'),
  new Thermo('R8C2', 'R7C1'),
  new Thermo('R8C4', 'R8C5', 'R8C6'),
  new Thermo('R8C8', 'R7C9'),

  // Dots.
  new BlackDot('R1C1', 'R1C2'),
  new WhiteDot('R1C6', 'R1C7'),
  new WhiteDot('R7C5', 'R7C6'),
  new WhiteDot('R6C8', 'R7C8'),

  // Between-lines (endpoints are the circled cells).
  new Between('R2C3', 'R3C4', 'R3C5', 'R3C6', 'R2C7'),
  new Between('R8C3', 'R7C4', 'R7C5', 'R7C6', 'R8C7'),

  // Orange line: exactly one of {1,2,3}, {4,5,6}, {7,8,9}.
  new Or([
    new And([
      new Given('R5C4', 1, 2, 3),
      new Given('R5C5', 1, 2, 3),
      new Given('R5C6', 1, 2, 3)]),
    new And([
      new Given('R5C4', 4, 5, 6),
      new Given('R5C5', 4, 5, 6),
      new Given('R5C6', 4, 5, 6)]),
    new And([
      new Given('R5C4', 7, 8, 9),
      new Given('R5C5', 7, 8, 9),
      new Given('R5C6', 7, 8, 9)])]),

  // Inequality: R8C3 < R9C3.
  new GreaterThan('R9C3', 'R8C3'),
];
