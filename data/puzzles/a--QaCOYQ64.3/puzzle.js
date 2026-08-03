// Title: June 19, 2023: Sudokurve
// Author: clover!
// Video: https://www.youtube.com/watch?v=a--QaCOYQ64
// Source: https://tinyurl.com/4fypmk2r

// Rules: Fill each 3x3 region with the digits 1 through 9 exactly once each.
// Also, digits must not repeat along the 'curved' length-9 lines indicated by
// the lines outside of the grid.
//
// The board holds only 27 cells: three detached 3x3 regions on the main
// diagonal of a 9x9 frame -- R1-3C1-3, R4-6C4-6, R7-9C7-9. No cells are drawn
// anywhere else in the frame; the strokes in those areas are the curve
// connectors, which lead a curve out of one region and into the next.
//
// Six curves of nine cells each are drawn, and every cell lies on exactly two
// of them. A curve crosses three cells of each region in turn: three in a
// straight line across region 1, a connector, three across region 2, a
// connector, three across region 3.
//
// A 27-cell board is not an ISS grid shape, so the puzzle is re-coordinatised
// onto a 3x9 grid: one row per region, and the nine columns indexed by the
// pair of curves through a cell. That grid's own row, box and column groups
// then carry the region rule, one curve family, and a consequence of the
// other (see below); the remaining curve family is stated explicitly. Nothing
// else is imposed. Digits are reported on the 3x9 grid, not on the frame.

// Source geometry, transcribed from the three drawn 3x3 regions.
const REGIONS = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'],
  ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'],
  ['R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
];

// The six curves in frame coordinates, traced along the connector strokes
// drawn outside the regions. Family H is the three that leave region 1
// through its right edge and enter region 2 from above; family V is the three
// that leave region 1 through its bottom edge and enter region 2 from the
// left. Cells are listed in the order the curve visits them.
const CURVES_H = [
  ['R1C1', 'R1C2', 'R1C3', 'R4C6', 'R5C6', 'R6C6', 'R7C7', 'R7C8', 'R7C9'],
  ['R2C1', 'R2C2', 'R2C3', 'R4C5', 'R5C5', 'R6C5', 'R8C7', 'R8C8', 'R8C9'],
  ['R3C1', 'R3C2', 'R3C3', 'R4C4', 'R5C4', 'R6C4', 'R9C7', 'R9C8', 'R9C9'],
];
const CURVES_V = [
  ['R1C1', 'R2C1', 'R3C1', 'R6C4', 'R6C5', 'R6C6', 'R7C7', 'R8C7', 'R9C7'],
  ['R1C2', 'R2C2', 'R3C2', 'R5C4', 'R5C5', 'R5C6', 'R7C8', 'R8C8', 'R9C8'],
  ['R1C3', 'R2C3', 'R3C3', 'R4C4', 'R4C5', 'R4C6', 'R7C9', 'R8C9', 'R9C9'],
];

// Givens, transcribed from the frame (three per region).
const GIVENS = {
  R1C3: 2, R3C1: 3, R3C3: 1,
  R4C6: 8, R5C4: 4, R5C6: 5,
  R7C7: 1, R8C8: 6, R9C9: 7,
};

// The re-coordinatisation. A cell's region gives its 3x9 row; its H curve and
// V curve give its column, 3*(h-1)+v. Each region meets each (h, v) pair
// exactly once, so this is a bijection onto the 3x9 grid.
const indexOfCurve = (curves, cell) => curves.findIndex(c => c.includes(cell));
const issCell = (cell) => makeCellId(
  1 + indexOfCurve(REGIONS, cell),
  1 + 3 * indexOfCurve(CURVES_H, cell) + indexOfCurve(CURVES_V, cell));

// What the 3x9 grid enforces on its own:
//   rows    -- the nine cells of one region, all different (the region rule);
//   boxes   -- the 3x3 blocks are columns 3h-2..3h, i.e. the nine cells of
//              curve H_h, all different (curve family H);
//   columns -- the three cells sharing an (h, v) pair, one per region. These
//              already lie together on curve H_h, so this group adds nothing.
// Only curve family V is left to state.
const vCurves = CURVES_V.map(curve => new AllDifferent(...curve.map(issCell)));

return [
  new Shape('3x9'),
  ...Object.entries(GIVENS).map(([cell, v]) => new Given(issCell(cell), v)),
  ...vCurves,
];
