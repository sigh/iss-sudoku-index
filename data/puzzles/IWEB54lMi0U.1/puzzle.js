// Title: September 29, 2023: Pair Up Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=IWEB54lMi0U
// Source: https://tinyurl.com/ywvmz9we

// Normal 9x9 Sudoku with the standard 3x3 boxes, plus the Pair Up rule:
// wherever an arrow cell holds X, the digit 10-X must appear exactly X steps
// away in the direction the arrow points.  All twelve drawn arrows are
// encoded; no rule is omitted.

// Read off the drawn grid.
const givens = [
  ['R1C1', 3], ['R1C5', 7], ['R1C9', 4], ['R2C2', 4], ['R2C8', 5],
  ['R4C3', 4], ['R5C3', 6], ['R5C7', 4], ['R6C7', 8], ['R8C2', 1],
  ['R8C8', 6], ['R9C1', 2], ['R9C5', 3], ['R9C9', 5],
];

// The twelve drawn arrow glyphs: the cell each sits in, then its unit step as a
// [row, col] delta taken along the glyph's own tail-to-tip axis.  The rules'
// worked example -- "if r5c6 is a 2, then there must be an 8 (10-2) exactly 2
// steps to the right of the arrow, in r5c8" -- fixes the R5C6 glyph as
// rightward, and every other glyph is a rotation of that same drawing.
const arrows = [
  ['R1C3', 0, -1], ['R2C3', 0, -1], ['R3C6', 1, 0], ['R3C8', -1, 0],
  ['R3C9', -1, 0], ['R4C5', -1, 0], ['R5C6', 0, 1], ['R7C1', -1, 0],
  ['R7C2', -1, 0], ['R7C4', -1, 0], ['R8C7', 0, -1], ['R9C7', 0, -1],
];

// One branch per value X the arrow cell could take: X here, paired with 10-X in
// the cell X steps along the ray.  X is dropped when that cell is off the grid,
// since the rule requires 10-X to *appear* X steps away and there is no cell
// there to hold it.
const onGrid = (v) => v >= 1 && v <= 9;
const pairUp = ([cell, dRow, dCol]) => {
  const { row, col } = parseCellId(cell);
  const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
    (x) => onGrid(row + dRow * x) && onGrid(col + dCol * x));
  return new Or(steps.map((x) => new And([
    new Given(cell, x),
    new Given(makeCellId(row + dRow * x, col + dCol * x), 10 - x),
  ])));
};

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...arrows.map(pairUp),
];
