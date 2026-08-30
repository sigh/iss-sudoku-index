// Title: Skyscrapers
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=Lh_j9DLhIY4
// Source: https://tinyurl.com/y8k9hdlm

// 6x6 grid, 1-6 once each per row/column, no boxes (rules text names only
// rows and columns). Native Skyscraper outside clues, one per marked
// row/column edge; unmarked edges carry no constraint.

const geometry = cellGeometry('6x6');

// Clue table transcribed from the payload's `number` layer: each entry sits
// in the one-cell margin ring around the 6x6 board (penpa point index ->
// R#C# via the cell-layer formula, nx0=12), so it is an outside clue rather
// than an in-grid given. axis/index use the 6x6 play-grid numbering.
const CLUES = [
  ['R', 1, 1, 3],   // R2C1=3 in payload margin -> row 1, viewed from the left
  ['R', 3, 1, 4],   // R4C1=4 -> row 3, viewed from the left
  ['R', 4, -1, 3],  // R5C8=3 -> row 4, viewed from the right
  ['R', 5, 1, 6],   // R6C1=6 -> row 5, viewed from the left
  ['C', 4, 1, 5],   // R1C5=5 -> column 4, viewed from the top
  ['C', 6, 1, 2],   // R1C7=2 -> column 6, viewed from the top
];

const clueCells = (axis, index, direction) => Array.from({ length: 6 }, (_, offset) => (
  axis === 'C'
    ? makeCellId(direction > 0 ? offset + 1 : 6 - offset, index)
    : makeCellId(index, direction > 0 ? offset + 1 : 6 - offset)
));

const skyscrapers = CLUES.map(([axis, index, direction, value]) => (
  Skyscraper.fromCells(value, clueCells(axis, index, direction), geometry)
));

return [
  new Shape('6x6'),
  new NoBoxes(),
  ...skyscrapers,
];
