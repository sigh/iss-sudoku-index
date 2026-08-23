// Title: A Miracle Sudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=vDmrvWpPPOc
// Source: https://app.crackingthecryptic.com/sudoku/tqq9HTQB9M

// Standard row/column all-different apply. There are no standard 3x3 boxes;
// the grid is instead divided into 9 irregular jigsaw regions, each also
// all-different (bold-bordered areas per the rules text). Orthogonally
// adjacent cells may not hold consecutive digits, nor may they be in a 2:1
// ratio.
//
// The regions array is transcribed from the source's drawn region geometry,
// one Jigsaw per listed region.
//
// StrictKropki forbids consecutive and 2:1-ratio pairs on every orthogonally
// adjacent cell pair in the grid (no Kropki dots are drawn, so this is a
// global negative over the whole adjacency graph) -- exactly the stated
// "may not be consecutive, nor may they be in a ratio of 2:1" rule.

const regions = [
  ['R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R8C2', 'R9C2'],
  ['R1C1', 'R2C1', 'R1C2', 'R2C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R1C8', 'R2C8', 'R2C9', 'R1C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
  ['R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R3C7', 'R3C8', 'R4C8', 'R4C7'],
  ['R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R4C6', 'R5C6', 'R5C7', 'R5C8'],
  ['R4C2', 'R4C3', 'R4C4', 'R4C5', 'R5C5', 'R6C5', 'R6C6', 'R6C7', 'R6C8'],
  ['R5C2', 'R5C3', 'R5C4', 'R6C4', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8'],
  ['R6C2', 'R7C2', 'R7C3', 'R6C3', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7'],
  ['R8C8', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3'],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),
  new Given('R6C3', 4),
  new Given('R9C2', 7),
  new StrictKropki(),
];
