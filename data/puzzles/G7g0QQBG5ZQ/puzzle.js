// Title: Dorlir's unsquished sudoku
// Author: Jonesy
// Video: https://www.youtube.com/watch?v=G7g0QQBG5ZQ
// Source: https://sudokupad.app/01lue6wf81

// Normal sudoku rules apply: rows, columns, and 3x3 boxes all-different
// (ISS's default boxes; the payload's own `regions` array is exactly the
// nine standard boxes, so no Jigsaw/NoBoxes is needed).
//
// Counting circles: "A digit in a circle indicates how many times that
// digit must appear in circles" -- CountingCircles below, over the ten
// drawn circled cells.
//
// "Each counting circle is the center of a 3x3 area which contains 9
// unique digits. (The circle on the edge of the grid only reaches 6
// cells.)" -- one AllDifferent per circle, over the circle cell plus its
// king-move neighbours; `kingNeighbours` already clips to the grid, which
// gives the one edge circle (R4C1) exactly 6 cells instead of 9.
//
// "Digits separated by an X sum to 10." -- one X per drawn edge mark.

const graph = cellGraph('9x9');

// The ten drawn circled cells.
const circles = [
  'R3C3', 'R4C1', 'R4C4', 'R4C6', 'R5C3',
  'R5C7', 'R6C4', 'R6C6', 'R7C5', 'R8C7',
];

const windows = circles.map(
  c => new AllDifferent(c, ...graph.kingNeighbours(c))
);

// The four drawn "X" edge marks.
const xMarks = [
  new X('R2C5', 'R3C5'),
  new X('R7C5', 'R8C5'),
  new X('R5C2', 'R5C3'),
  new X('R5C7', 'R5C8'),
];

return [
  new Shape('9x9'),
  new CountingCircles(...circles),
  ...windows,
  ...xMarks,
];
