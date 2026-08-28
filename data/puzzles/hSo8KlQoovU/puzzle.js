// Title: Thermo Sandwich Sudoku
// Author: Jesper Josefsson
// Video: https://www.youtube.com/watch?v=hSo8KlQoovU
// Source: https://cracking-the-cryptic.web.app/sudoku/GR26MN8B9Q

// Normal sudoku rules apply (rows, columns and boxes all-different --
// standard for a plain 9x9 Shape). Along thermometer shapes, digits must
// increase from the bulb end (Thermo, bulb cell first). Each outside clue
// gives the sum of the digits strictly between the 1 and the 9 in the
// relevant row/column (Sandwich, built from the full row/column and the
// payload's outside-clue geometry).

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Thermometer paths (payload lines, bulb end first).
const thermos = [
  ['R1C5', 'R2C5', 'R2C6', 'R2C7', 'R3C7', 'R4C7'],
  ['R4C5', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9', 'R4C9'],
  ['R7C8', 'R8C8', 'R9C8'],
  ['R6C2', 'R5C2', 'R4C2'],
].map(cells => new Thermo(...cells));

// Sandwich clues (payload outside-clue overlays): [value, row or column].
const sandwiches = [
  [15, () => graph.row(3)],
  [7, () => graph.row(5)],
  [7, () => graph.row(9)],
  [9, () => graph.column(1)],
  [3, () => graph.column(3)],
  [20, () => graph.column(5)],
  [11, () => graph.column(7)],
].map(([value, lane]) => Sandwich.fromCells(value, lane(), geometry));

return [
  new Shape('9x9'),
  ...thermos,
  ...sandwiches,
];
