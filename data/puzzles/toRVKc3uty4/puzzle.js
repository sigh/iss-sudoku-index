// Title: 2D Wave Particles
// Author: zetamath
// Video: https://www.youtube.com/watch?v=toRVKc3uty4
// Source: https://app.crackingthecryptic.com/sudoku/F3NGgR7RnB

// Normal sudoku on a 9x9 grid with standard boxes (default). "No two cells in
// the same position within a box can contain the same digit" is DisjointSets.
// "Black dot ... ratio of 2:1" with "not all possible dots ... given" means
// the relation applies only at the one drawn dot -- BlackDot on that single
// pair, no strict/negative variant.
//
// The nine box-centre cells form a 3x3 grid graph; all twelve graph edges are
// drawn. Eleven are 4-cell purple "between" lines (the circled centre cells
// are the line's own endpoints, so Between's first/last args already are the
// circles). The twelfth (R2C8-R5C8) is the rules' "upper right vertical
// line", encoded as the Arrow instead, bulb (circle) first: R2C8 is the sum
// of R3C8, R4C8, R5C8.

const betweenLines = [
  ['R2C2', 'R2C3', 'R2C4', 'R2C5'],
  ['R2C2', 'R3C2', 'R4C2', 'R5C2'],
  ['R5C2', 'R6C2', 'R7C2', 'R8C2'],
  ['R8C2', 'R8C3', 'R8C4', 'R8C5'],
  ['R5C5', 'R6C5', 'R7C5', 'R8C5'],
  ['R2C5', 'R3C5', 'R4C5', 'R5C5'],
  ['R5C2', 'R5C3', 'R5C4', 'R5C5'],
  ['R5C5', 'R5C6', 'R5C7', 'R5C8'],
  ['R8C5', 'R8C6', 'R8C7', 'R8C8'],
  ['R5C8', 'R6C8', 'R7C8', 'R8C8'],
  ['R2C5', 'R2C6', 'R2C7', 'R2C8'],
];

return [
  new Shape('9x9'),
  new DisjointSets(),
  new BlackDot('R7C6', 'R8C6'),
  new Arrow('R2C8', 'R3C8', 'R4C8', 'R5C8'),
  ...betweenLines.map(cells => new Between(...cells)),
];
