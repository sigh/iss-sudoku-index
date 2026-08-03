// Title: May 4, 2023: Blueberry Lemon
// Author: clover!
// Video: https://www.youtube.com/watch?v=GDV0E4mfnpI
// Source: https://tinyurl.com/hf4rtvzs

// Normal sudoku rules apply. 16 given digits (below).
//
// Lemon shapes: each lemon's 6 boundary cells sum to the 2-digit number
// formed by its 2 interior cells (repeats allowed on the boundary, so no
// AllDifferent). Along each lemon's boundary, the sum of the digits within
// each box segment is also equal (region sum lines): the rules text's own
// worked example -- "on the top-left lemon, the sum of the digits in box 1
// equals box 2" -- names the region-sum lines as the lemons, so the drawn
// lines are the lemon boundaries, not a separate shape. Each boundary is a
// closed hexagon: its first and last cells are grid-adjacent, closing the
// drawn outline. The 2 interior cells of each hexagon (not on the boundary)
// are the cells its six boundary cells enclose.

const lemons = [
  {
    // Lemon A ("top-left", named in the rules text): closes R1C3-R1C4.
    // Encloses R2C3,R2C4 (row 2, between the boundary's row-2 vertices
    // R2C2 and R2C5) -- both given, corroborating the reading: 4,2 -> 42.
    boundary: ['R1C3', 'R2C2', 'R3C3', 'R3C4', 'R2C5', 'R1C4'],
    tensCell: 'R2C3',
    onesCell: 'R2C4',
  },
  {
    // Lemon B ("top-right"): closes R4C8-R3C9 (diagonally adjacent).
    // Encloses R3C7,R3C8 (row 3, between the boundary's row-3 vertices
    // R3C6 and R3C9). Interior cells are not given.
    boundary: ['R3C9', 'R2C8', 'R2C7', 'R3C6', 'R4C7', 'R4C8'],
    tensCell: 'R3C7',
    onesCell: 'R3C8',
  },
  {
    // Lemon C ("bottom-middle/right"): closes R7C7-R7C6.
    // Encloses R8C6,R8C7 (row 8, between the boundary's row-8 vertices
    // R8C5 and R8C8) -- both given, corroborating the reading: 3,4 -> 34.
    boundary: ['R7C6', 'R8C5', 'R9C6', 'R9C7', 'R8C8', 'R7C7'],
    tensCell: 'R8C6',
    onesCell: 'R8C7',
  },
  {
    // Lemon D ("bottom-left"): closes R8C3-R7C4 (diagonally adjacent).
    // Encloses R7C2,R7C3 (row 7, between the boundary's row-7 vertices
    // R7C1 and R7C4). Interior cells are not given.
    boundary: ['R7C4', 'R6C3', 'R6C2', 'R7C1', 'R8C2', 'R8C3'],
    tensCell: 'R7C2',
    onesCell: 'R7C3',
  },
];

const givens = [
  ['R2C3', 4], ['R2C4', 2], ['R2C5', 8],
  ['R3C3', 5], ['R3C5', 4],
  ['R4C3', 8], ['R4C4', 3], ['R4C5', 7],
  ['R6C5', 1], ['R6C6', 8], ['R6C7', 7],
  ['R7C5', 5], ['R7C7', 6],
  ['R8C5', 6], ['R8C6', 3], ['R8C7', 4],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...lemons.map(l => new RegionSumLine(...l.boundary)),
  // Interior cells are not boundary members, so the pill cells and the
  // summed line cells are disjoint: PillArrow(2, tens, ones, ...boundary)
  // yields sum(boundary) == 10*tens + ones.
  ...lemons.map(l => new PillArrow(2, l.tensCell, l.onesCell, ...l.boundary)),
];
