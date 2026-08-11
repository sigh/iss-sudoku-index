// Title: Assassin8
// Author: Ore
// Video: https://www.youtube.com/watch?v=sMBKLYJ31t8
// Source: https://app.crackingthecryptic.com/sudoku/j6Bm2nrgLB

// 8x8 grid, digits 1-8, jigsaw regions (drawn boxes) replace the default
// 2x4 tiling -- NoBoxes + Jigsaw per region. No given digits.
//
// Arrows: "Digits along an arrow sum to the digit in that arrow's circle,
// and can include repeat digits." The circle sits on an ordinary grid cell
// (its own digit is the sum), matching ISS's Arrow semantics exactly --
// Arrow(bulbCell, ...armCells). Repeats along the arm need no extra
// encoding: Arrow does not itself forbid them.
//
// Cages: "Digits in a cage sum to the small number in the top left corner."
// Every cage here lies entirely within one row or one column (noted per
// cage below), so Sudoku's own row/column all-different already forbids a
// repeat inside it -- Cage's built-in uniqueness is therefore redundant
// with, not stronger than, the stated rule, and is used for that reason.

const shape = new Shape('8x8');
const graph = cellGraph(shape);
const shapeName = graph.gridGeometry().name;
const id = (r, c) => makeCellId(r, c);

// Jigsaw regions, per the drawn region borders.
const REGIONS = [
  [[1, 1], [1, 2], [1, 3], [2, 1], [2, 2], [2, 3], [3, 2], [3, 3]],
  [[1, 6], [1, 7], [1, 8], [2, 6], [2, 7], [2, 8], [3, 6], [3, 7]],
  [[3, 1], [4, 1], [4, 2], [4, 3], [5, 1], [5, 2], [5, 3], [6, 1]],
  [[1, 4], [1, 5], [2, 4], [2, 5], [3, 4], [3, 5], [4, 4], [4, 5]],
  [[5, 4], [6, 2], [6, 3], [6, 4], [7, 1], [7, 2], [8, 1], [8, 2]],
  [[3, 8], [4, 6], [4, 7], [4, 8], [5, 6], [5, 7], [5, 8], [6, 8]],
  [[7, 3], [7, 4], [7, 5], [7, 6], [8, 3], [8, 4], [8, 5], [8, 6]],
  [[5, 5], [6, 5], [6, 6], [6, 7], [7, 7], [7, 8], [8, 7], [8, 8]],
];
const jigsaw = REGIONS.map(cells => new Jigsaw(shapeName, ...cells.map(([r, c]) => id(r, c))));

// Cages, per the drawn cage outlines and their top-left totals. Each is
// confined to a single row or column, noted per cage.
const cages = [
  // R1C3-R1C6, total 20 -- confined to row 1.
  new Cage(20, id(1, 3), id(1, 4), id(1, 5), id(1, 6)),
  // R3C5-R4C5, total 11 -- confined to column 5.
  new Cage(11, id(3, 5), id(4, 5)),
  // R4C6-R4C8, total 12 -- confined to row 4.
  new Cage(12, id(4, 6), id(4, 7), id(4, 8)),
  // R8C2-R8C3, total 8 -- confined to row 8.
  new Cage(8, id(8, 2), id(8, 3)),
];

// Arrows, per the drawn arrow paths and circle positions. Bulb (circle)
// cell is each path's first cell.
const arrows = [
  new Arrow(id(1, 8), id(1, 7), id(2, 7), id(3, 7)),
  new Arrow(id(3, 2), id(3, 3), id(2, 3), id(2, 4)),
  new Arrow(id(6, 1), id(5, 1), id(4, 1), id(4, 2)),
  new Arrow(id(7, 1), id(7, 2), id(6, 2), id(6, 3)),
  new Arrow(id(8, 5), id(8, 4), id(7, 4)),
  new Arrow(id(6, 7), id(6, 6), id(6, 5), id(5, 5)),
];

return [
  shape,
  new NoBoxes(),
  ...jigsaw,
  ...cages,
  ...arrows,
];
