// Title: Variant Lesson: Region Sum Lines
// Author: Deckatron
// Video: https://www.youtube.com/watch?v=5GEmnRO9u1I
// Source: https://sudokupad.app/1rhx7kuw9k

// Standard 6x6 sudoku (2x3 boxes), except the digit alphabet is an unknown
// 6-element subset of 1-9. `Shape('6x6', 9)` lets grid cells hold 1-9; a
// fixed aux cell plus `CountDistinct` over the whole grid pins the number of
// distinct digits actually used to 6. Rows/columns/boxes are already
// all-different, so each is forced to use that same 6-digit set -- which in
// turn forces every one of the 6 digits to appear exactly 6 times across the
// grid, so that clause needs no separate encoding.

const graph = cellGraph('6x6');
const digitCount = new Var('D', 'digit count', 1);

// Region Sum Lines: box borders split each line into equal-sum segments.
const regionSumLines = [
  ['R4C2', 'R3C2', 'R2C1'],
  ['R5C2', 'R4C3', 'R3C3', 'R2C3', 'R2C4', 'R1C4'],
  ['R6C3', 'R6C4', 'R6C5', 'R6C6'],
  ['R5C1', 'R6C2', 'R5C3', 'R4C4', 'R4C5', 'R5C4', 'R5C5', 'R4C6', 'R3C5'],
];

return [
  new Shape('6x6', 9),

  digitCount,
  new Given(digitCount.cell(), 6),
  new CountDistinct(digitCount.cell(), ...graph.cells()),

  ...regionSumLines.map(cells => new RegionSumLine(...cells)),

  // White Kropki dot: the two separated cells are consecutive.
  new WhiteDot('R2C6', 'R3C6'),
];
