// Title: The Struggle
// Author: Jeet Sampat
// Video: https://www.youtube.com/watch?v=7TznfjqLxEY
// Source: https://app.crackingthecryptic.com/sudoku/JmJmTrt6T4

// Normal sudoku rules apply (9x9, standard rows/cols/boxes).
// Black dot: the two separated cells are in a 1:2 ratio (BlackDot's own
// semantics -- "one value must be double the other" -- match this rule
// verbatim).
// Arrow: digits along the arrow sum to the digit in its circle (Arrow's own
// semantics -- "values along the arrow must sum to the value in the circle"
// -- match this rule verbatim; the bulb/control cell is passed first).
// Four circles anchor two arrows each (a long bent arm and a short one-cell
// arm); one circle anchors a single arm. That asymmetry is the drawn
// geometry itself, not an encoding choice.

const shape = new Shape('9x9');
const at = (r, c) => makeCellId(r, c);

const dots = [
  [[2, 2], [2, 3]],
  [[2, 8], [3, 8]],
  [[7, 2], [8, 2]],
  [[8, 7], [8, 8]],
].map(([a, b]) => new BlackDot(at(...a), at(...b)));

// Bulb cell first, then arm cells, per each arrow's own drawn path.
const arrows = [
  [[4, 3], [3, 3], [3, 2], [2, 1]],
  [[4, 3], [5, 4]],
  [[3, 6], [3, 7], [2, 7], [1, 8]],
  [[3, 6], [4, 5]],
  [[6, 7], [7, 7], [7, 8], [8, 9]],
  [[6, 7], [5, 6]],
  [[7, 4], [7, 3], [8, 3], [9, 2]],
  [[7, 4], [6, 5]],
  [[3, 4], [2, 4], [1, 3]],
].map(line => new Arrow(...line.map(rc => at(...rc))));

return [shape, ...dots, ...arrows];
