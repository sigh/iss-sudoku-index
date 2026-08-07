// Title: Effervescence
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=OdiaFCgFt0o
// Source: https://app.crackingthecryptic.com/sudoku/4mH66tpGmM

// Normal sudoku rules apply. A number in a circle gives how many times that
// number appears in circles (anywhere in the puzzle). A clue outside the grid
// gives the sum of the first X digits from that direction, where X is the digit
// next to the clue.
//
// The puzzle has no givens: every circle is drawn empty, including the ten
// outside the grid that carry the outside-clue values.
//
// The outside clue values are fixed at 10 by the circle rule alone, before any
// solving. There are 46 circles in all. A number n that appears in a circle
// must appear in exactly n circles, so the distinct numbers used partition the
// 46 circles and therefore sum to 46. The 36 in-grid circles hold sudoku digits
// 1-9, whose distinct values sum to at most 45, so at least one number above 9
// is used, and any such number occupies at least 10 circles. Only the 10
// outside circles can hold it, so there is exactly one such number, it is 10,
// and it fills all ten outside circles. The remaining distinct values sum to
// 46 - 10 = 36, matching the 36 in-grid circles exactly, so no digit 1-9 sits
// outside the grid and the counting rule over the in-grid circles is self
// contained.

// The 36 in-grid circles, transcribed from the drawn circle underlays.
const circleCells = [
  'R1C1', 'R1C3', 'R1C4', 'R1C6',
  'R2C4', 'R2C6', 'R2C9',
  'R3C1', 'R3C2', 'R3C4', 'R3C7', 'R3C8',
  'R4C3', 'R4C5', 'R4C7', 'R4C9',
  'R5C5', 'R5C6', 'R5C9',
  'R6C1', 'R6C2', 'R6C3', 'R6C5',
  'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9',
  'R8C2', 'R8C4', 'R8C5',
  'R9C1', 'R9C2', 'R9C7', 'R9C8',
];

// The ten outside circles, as the off-grid [row, column] slot each was drawn
// in: column 0 is left of the grid, column 10 right of it, row 0 above it and
// row 10 below it.
const outsideCircles = [
  [2, 0], [5, 0], [8, 0],
  [0, 5], [0, 9],
  [1, 10], [6, 10], [9, 10],
  [10, 3], [10, 6],
];

// An off-grid slot reads along the whole row or column it borders, starting at
// the grid cell it touches and running away from itself.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const clueCells = ([row, col]) =>
  col === 0 ? graph.ray(makeCellId(row, 1), 0, 1)
    : col === 10 ? graph.ray(makeCellId(row, 9), 0, -1)
      : row === 0 ? graph.ray(makeCellId(1, col), 1, 0)
        : graph.ray(makeCellId(9, col), -1, 0);

return [
  new Shape('9x9'),
  new CountingCircles(...circleCells),
  ...outsideCircles.map(slot => XSum.fromCells(10, clueCells(slot), geometry)),
];
