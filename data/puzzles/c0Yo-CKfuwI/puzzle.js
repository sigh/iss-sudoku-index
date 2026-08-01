// Title: Pentominophibian
// Author: Lil Gunga Jr
// Video: https://www.youtube.com/watch?v=c0Yo-CKfuwI
// Source: https://app.crackingthecryptic.com/t4vu4ndtl3

// Normal Sudoku, the gray-square/circle parity clues, and the drawn Kropki dots.
// Omitted: the three solver-discovered snakes, their surrounding-cell counts,
// their pentomino partition and shape uniqueness, and their line-rule assignment.
return [
  new Shape('9x9'),

  // Gray squares in the drawn underlays are even; gray circles are odd.
  new Regex('[2468]', 'R3C9'),
  new Regex('[2468]', 'R4C5'),
  new Regex('[2468]', 'R6C1'),
  new Regex('[13579]', 'R8C5'),
  new Regex('[13579]', 'R6C5'),
  new Regex('[13579]', 'R9C3'),

  // The three drawn Kropki dots.
  new BlackDot('R3C2', 'R4C2'),
  new BlackDot('R3C8', 'R3C9'),
  new WhiteDot('R8C7', 'R8C8'),
];
