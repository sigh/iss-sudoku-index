// Title: Indian Independence Sudoku
// Author: Nityant Agarwal
// Video: https://www.youtube.com/watch?v=2_Kl1zD17AA
// Source: https://cracking-the-cryptic.web.app/sudoku/8p98RJL4P6

// Normal sudoku rules apply (rows, columns and boxes all-different --
// standard for a plain 9x9 Shape). Outside clues without an arrow are
// Sandwich clues (sum strictly between the 1 and the 9 in that row/column).
// Outside clues with an arrow are LittleKiller clues (sum along the
// indicated diagonal, repeats allowed). The two clue families are disjoint
// here (sandwich clues sit on the top/left edges; little-killer arrows sit
// on the bottom/right edges and the bottom-right corner), unlike puzzles
// where one marker serves both roles.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Sandwich clues: value + full row/column, transcribed from the outside
// clue badges without an arrow.
const sandwichClues = [
  [19, () => graph.row(1)],
  [4, () => graph.row(2)],
  [7, () => graph.row(3)],
  [35, () => graph.row(5)],
  [19, () => graph.row(7)],
  [4, () => graph.row(8)],
  [7, () => graph.row(9)],
  [19, () => graph.column(1)],
  [5, () => graph.column(2)],
  [0, () => graph.column(3)],
  [35, () => graph.column(5)],
  [23, () => graph.column(7)],
  [8, () => graph.column(9)],
];

// Little-killer clues: value + diagonal entry cell/direction, transcribed
// from the four outside arrows and their attached sum badges.
const littleKillerClues = [
  [11, 'R9C7', -1, 1],
  [8, 'R9C8', -1, 1],
  [49, 'R9C9', -1, -1],
  [29, 'R5C9', -1, -1],
];

const sandwiches = sandwichClues.map(
  ([value, lane]) => Sandwich.fromCells(value, lane(), geometry));
const littleKillers = littleKillerClues.map(
  ([value, entry, dRow, dCol]) =>
    LittleKiller.fromCells(value, graph.ray(entry, dRow, dCol), geometry));

return [
  new Shape('9x9'),
  ...sandwiches,
  ...littleKillers,
];
