// Title: In Between Disjoint Killings
// Author: Arun Iyer
// Video: https://www.youtube.com/watch?v=BRzHWLLNVPk
// Source: https://app.crackingthecryptic.com/sudoku/QjJH8HpB3F

// Standard 9x9 sudoku (rows/columns/3x3 boxes) plus:
// - Disjoint groups: no digit repeats in the same box-relative position
//   across boxes -> DisjointSets.
// - Little-killer diagonals: outside sum clues along a diagonal, digits may
//   repeat -> LittleKiller.fromCells (rules: "Clues outside the grid give
//   the sum of the digits along the indicated diagonal. Digits along such a
//   diagonal may repeat if allowed by other rules."). Cell rays derived from
//   each drawn arrow's on-grid entry cell and heading, paired to its outside
//   sum badge by nearest waypoint distance -- both verified by hand against
//   the drawn coordinates.
// - Between lines: digits on the grey line must be strictly between the
//   two digits held in the line's end circles, repeats allowed ->
//   Between(...cells), first/last cell in each list is a circled endpoint.
//   Line paths and circle endpoints transcribed from the drawn geometry,
//   cross-checked: all 8 drawn circles are exactly the 4 lines' 8 endpoints.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Little-killer diagonal rays: [start cell, dRow, dCol, sum].
// dRow/dCol from each arrow's drawn heading; sum from its paired outside badge.
const littleKillers = [
  ['R1C2', 1, 1, 37],
  ['R1C5', 1, 1, 25],
  ['R3C1', 1, 1, 25],
  ['R5C1', 1, 1, 16],
  ['R8C1', 1, 1, 11],
  ['R7C9', 1, -1, 12],
];

// Between lines, cell paths transcribed from the drawn line waypoints.
const betweenLines = [
  ['R6C1', 'R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5', 'R9C4'],
  ['R3C1', 'R4C2', 'R5C3', 'R6C4', 'R7C5', 'R8C6', 'R9C7'],
  ['R3C4', 'R4C5', 'R5C6', 'R6C7'],
  ['R2C5', 'R3C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9'],
];

return [
  new Shape('9x9'),

  new Given('R1C8', 9),
  new Given('R2C9', 8),

  new DisjointSets(),

  ...littleKillers.map(([start, dRow, dCol, sum]) =>
    LittleKiller.fromCells(sum, graph.ray(start, dRow, dCol), geometry)),

  ...betweenLines.map(cells => new Between(...cells)),
];
