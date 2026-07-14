// Title: Variant Lesson: Arrows
// Author: Deckatron
// Video: https://www.youtube.com/watch?v=5GEmnRO9u1I
// Source: https://sudokupad.app/ot1vgzjxce

// 6x6 grid, but digits are drawn from 1-9 and only 6 of the 9 are used, each
// appearing 6 times ("which 6 digits to use must be determined"). Extend the
// value range to 9 while keeping the 6x6 cell count.
const shape = new Shape('6x6', 9);
const graph = cellGraph(shape);
const allCells = graph.cells();

// The default boxes are the drawn 2x3 regions: the tiling is sized to the grid,
// so extending the value range to 9 leaves it alone.

// "6 unique digits, each appears 6 times" collapses to one constraint: the
// grid holds exactly 6 distinct digits. The default row all-different groups
// (6 rows of size 6) already cap every digit at <=6 occurrences -- at most
// once per row -- so distributing 36 cells over exactly 6 such digits forces
// every one of them to hit its cap of 6. A control Var pinned to 6, tied to
// the whole grid via CountDistinct, is therefore a faithful encoding of both
// clauses together.
const digitCount = new Var('D');

// Arrows: first cell is the circle (the sum), the rest is the summed path.
// The circle's own cell is not part of the path it sums.
const arrows = [
  ['R3C6', ['R3C5', 'R3C4', 'R4C4']],
  ['R5C6', ['R5C5', 'R5C4', 'R5C3', 'R6C3']],
  ['R1C5', ['R1C4', 'R1C3', 'R1C2', 'R2C2']],
  ['R5C2', ['R6C2', 'R6C1']],
  ['R5C1', ['R4C1', 'R3C2']],
  ['R2C4', ['R2C5', 'R1C6']],
];

return [
  shape,
  digitCount,
  new Given(digitCount.cell(1), 6),
  new CountDistinct(digitCount.cell(1), ...allCells),
  ...arrows.map(([circle, path]) => new Arrow(circle, ...path)),
];
