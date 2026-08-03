// Title: 6/7/23: S
// Author: ???
// Video: https://www.youtube.com/watch?v=PZ1W_HIMqdI
// Source: https://tinyurl.com/yc2uthsz
//
// No rules text is present in the source payload; the only drawn clues are
// four unlabelled two-cell difference dots and sixteen quadruple clues, on a
// grid with no givens and default 3x3 boxes. An unlabelled difference dot is
// the format's standard Kropki-white-dot default (digits differ by 1) --
// every quadruple entry below carries an explicit digit list, so the absence
// of a value on every difference entry is the tool default, not a missing
// field. Quad(topLeftCell, ...values) requires each listed value to appear
// among the surrounding 2x2 square, with a doubled value requiring two
// occurrences.

return [
  new Shape('9x9'),

  // Difference dots, row 5 columns 3-7 (drawn as the payload's `difference`
  // marks).
  new WhiteDot('R5C3', 'R5C4'),
  new WhiteDot('R5C4', 'R5C5'),
  new WhiteDot('R5C5', 'R5C6'),
  new WhiteDot('R5C6', 'R5C7'),

  // Quadruple clues (drawn as the payload's `quadruple` marks).
  new Quad('R1C3', 1, 1, 2, 2),
  new Quad('R1C4', 5),
  new Quad('R1C5', 9),
  new Quad('R1C6', 3, 3, 8, 8),
  new Quad('R2C2', 2, 3, 4, 5),
  new Quad('R2C7', 2, 3),
  new Quad('R3C2', 2),
  new Quad('R4C2', 7),
  new Quad('R5C7', 3),
  new Quad('R6C7', 1, 2, 3, 4),
  new Quad('R7C2', 4, 5, 6, 7),
  new Quad('R7C7', 7, 8),
  new Quad('R8C3', 3, 3, 4, 4),
  new Quad('R8C4', 2),
  new Quad('R8C5', 1),
  new Quad('R8C6', 6, 6, 7, 7),
];
