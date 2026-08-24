// Title: BetSandwichween
// Author: Levi Kegel
// Video: https://www.youtube.com/watch?v=lBoVp-QLFp8
// Source: https://app.crackingthecryptic.com/sudoku/pG7f49Q4f4

// Standard 9x9 sudoku, no givens.
// Between lines (hollow circles at both ends): digits on the line strictly
// between the two circle values -> Between, ends first/last per its handler.
// The line R3C3-R2C4-R2C5-R2C6-R3C7 carries a third circle, identical in
// style to the end circles, on its middle cell R2C5 -- that circle splits the
// drawn path into two Between clues sharing R2C5 as a common end.
// Outside sums: digits strictly between the 1 and 9 in that row/column sum to
// the given total -> Sandwich.
// Greater-than: a small chevron on an edge points at the lower digit -> the
// two chevrons (R7C3/R8C3, R7C7/R8C7) each read as GreaterThan(top, bottom),
// since the drawn glyph is an unrotated "V" (point down) on both.
const shape = new Shape('9x9');
const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

const betweenLines = [
  ['R3C1', 'R4C2', 'R5C1', 'R6C2', 'R7C1'],
  ['R9C4', 'R9C5', 'R9C6'],
  ['R3C3', 'R2C4', 'R2C5'],
  ['R2C5', 'R2C6', 'R3C7'],
  ['R3C9', 'R4C8', 'R5C9', 'R6C8', 'R7C9'],
  ['R4C4', 'R3C5', 'R4C6'],
  ['R7C3', 'R6C3', 'R5C4', 'R5C5', 'R5C6', 'R6C7', 'R7C7'],
];

const sandwichRows = [
  [1, 2], [3, 13], [5, 17], [7, 30], [9, 27],
];
const sandwichColumns = [
  [1, 25], [5, 27], [9, 10],
];

const greaterThanEdges = [
  ['R7C3', 'R8C3'],
  ['R7C7', 'R8C7'],
];

return [
  shape,
  ...betweenLines.map(cells => new Between(...cells)),
  ...sandwichRows.map(([r, total]) =>
    Sandwich.fromCells(total, graph.row(r), geometry)),
  ...sandwichColumns.map(([c, total]) =>
    Sandwich.fromCells(total, graph.column(c), geometry)),
  ...greaterThanEdges.map(([hi, lo]) => new GreaterThan(hi, lo)),
];
