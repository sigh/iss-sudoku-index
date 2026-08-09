// Title: Killer Convergence
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=zxT9wi6z8nc
// Source: https://app.crackingthecryptic.com/sudoku/fRrnrqL873

// Normal sudoku rules apply (rows, columns, and boxes all-different --
// standard for a plain 9x9 Shape).
//
// There are three outside clues (payload overlays #0-#2, each centred on a
// single row/column lane at depth 0.5 outside the grid -- SudokuPad's
// standard single-outside-clue position, e.g. [-0.5, 6.5] sits directly
// above column 7's cell centre 6.5, not on a grid-line vertex): 13 left of
// row 4, 13 above column 7, 16 right of row 7. Per the rules each is both:
//   (a) a Sandwich total for its row/column (sum of the digits strictly
//       between the 1 and the 9 in that line), and
//   (b) a little-killer diagonal-sum clue "in both directions" from its
//       entry cell (R4C1, R1C7, R7C9 respectively) -- "on each diagonal
//       from the number, the digits must sum to the number provided;
//       digits can repeat along these diagonals".
//
// None of the three entry cells is a grid corner, so each has two distinct
// candidate diagonals into the grid, and the payload draws no arrow to pick
// one. Requiring *both* diagonals of every clue to independently equal its
// total (the literal "in both directions") is unsatisfiable -- checked with
// solve.js at a 5000-backtrack cap, immediate reject, well inside the "debug
// a specific rejection" allowance. With that literal reading eliminated,
// the two remaining directions per clue are equally supported by the source,
// so each is encoded as an open disjunction over its two candidate
// diagonals (never selected by which one solves the puzzle).

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

const sandwiches = [
  Sandwich.fromCells(13, graph.row(4), geometry),
  Sandwich.fromCells(16, graph.row(7), geometry),
  Sandwich.fromCells(13, graph.column(7), geometry),
];

// Little-killer diagonals: cell lists run outward from each clue's entry
// cell (R4C1, R1C7, R7C9), one per candidate direction.
const leftR4 = new Or([
  LittleKiller.fromCells(13, graph.ray('R4C1', 1, 1), geometry),
  LittleKiller.fromCells(13, graph.ray('R4C1', -1, 1), geometry),
]);
const topC7 = new Or([
  LittleKiller.fromCells(13, graph.ray('R1C7', 1, -1), geometry),
  LittleKiller.fromCells(13, graph.ray('R1C7', 1, 1), geometry),
]);
const rightR7 = new Or([
  LittleKiller.fromCells(16, graph.ray('R7C9', -1, -1), geometry),
  LittleKiller.fromCells(16, graph.ray('R7C9', 1, -1), geometry),
]);

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C9', 4),
  new Given('R3C3', 1),
  new Given('R7C7', 5),
  new Given('R9C1', 5),

  ...sandwiches,
  leftR4,
  topC7,
  rightR7,
];
