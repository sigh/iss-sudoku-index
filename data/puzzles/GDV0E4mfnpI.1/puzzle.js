// Title: May 7, 2023: Peach Lemon
// Author: clover!
// Video: https://www.youtube.com/watch?v=GDV0E4mfnpI
// Source: https://tinyurl.com/mr3yeesu

// Normal sudoku rules apply.
//
// Entropic lines: every 3 consecutive cells along a line hold one low (1-3),
// one medium (4-6) and one high (7-9) digit.
//
// Lemon shapes: each lemon's 6 boundary cells sum to the 2-digit number
// formed by its 2 interior cells (repeats allowed on the boundary, so no
// AllDifferent). The payload draws each lemon as one 6-cell Entropic Line
// (the boundary, also entropic) plus a 2-cell chord joining its endpoints,
// present only to close the drawn outline (too short to add any entropic
// constraint of its own -- an Entropic constraint needs 3+ cells -- so it is
// omitted here). The two interior cells of each hexagon (not on the
// boundary) are the cells enclosed by the six boundary cells.

const lemons = [
  {
    // Lemon A: horizontal lemon, interior read left to right.
    boundary: ['R2C2', 'R1C3', 'R1C4', 'R2C5', 'R3C4', 'R3C3'],
    tensCell: 'R2C3',
    onesCell: 'R2C4',
  },
  {
    // Lemon B: horizontal lemon, interior read left to right.
    boundary: ['R8C5', 'R7C6', 'R7C7', 'R8C8', 'R9C7', 'R9C6'],
    tensCell: 'R8C6',
    onesCell: 'R8C7',
  },
  {
    // Lemon C: vertical lemon, interior read top to bottom.
    boundary: ['R5C2', 'R6C1', 'R7C1', 'R8C2', 'R7C3', 'R6C3'],
    tensCell: 'R6C2',
    onesCell: 'R7C2',
  },
  {
    // Lemon D: vertical lemon, interior read top to bottom.
    boundary: ['R2C8', 'R3C7', 'R4C7', 'R5C8', 'R4C9', 'R3C9'],
    tensCell: 'R3C8',
    onesCell: 'R4C8',
  },
];

const givens = [
  ['R1C5', 3],
  ['R2C2', 4],
  ['R2C3', 2],
  ['R2C4', 6],
  ['R2C9', 7],
  ['R3C2', 5],
  ['R3C4', 2],
  ['R4C1', 8],
  ['R6C9', 9],
  ['R7C6', 2],
  ['R7C8', 6],
  ['R8C1', 7],
  ['R8C6', 3],
  ['R8C7', 4],
  ['R8C8', 5],
  ['R9C5', 8],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...lemons.map(l => new Entropic(...l.boundary)),
  // Interior cells are not boundary members, so the pill cells and the
  // summed line cells are disjoint: PillArrow(2, tens, ones, ...boundary)
  // yields sum(boundary) == 10*tens + ones.
  ...lemons.map(l => new PillArrow(2, l.tensCell, l.onesCell, ...l.boundary)),
];
