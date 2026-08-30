// Title: unknown
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=RjznoTdOHRM
// Source: https://cracking-the-cryptic.web.app/sudoku/BppQhB6fLJ

// Normal sudoku rules apply (rows, columns and boxes all-different --
// standard for a plain 9x9 Shape). Ten outside arrows each give a
// LittleKiller diagonal-sum clue (repeats allowed) from the entry cell to
// the grid's far corner, transcribed from the arrow directions and their
// paired sum badges.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Little-killer clues: value + diagonal entry cell/direction, transcribed
// from the ten outside arrows and their attached sum badges.
const littleKillerClues = [
  [20, 'R1C4', 1, -1],
  [10, 'R1C5', 1, -1],
  [21, 'R1C6', 1, -1],
  [16, 'R7C1', 1, 1],
  [13, 'R8C1', 1, 1],
  [31, 'R9C3', -1, 1],
  [15, 'R9C4', -1, 1],
  [16, 'R9C5', -1, 1],
  [12, 'R3C9', -1, -1],
  [5, 'R2C9', -1, -1],
];

const littleKillers = littleKillerClues.map(
  ([value, entry, dRow, dCol]) =>
    LittleKiller.fromCells(value, graph.ray(entry, dRow, dCol), geometry));

return [
  new Shape('9x9'),
  ...littleKillers,
];
