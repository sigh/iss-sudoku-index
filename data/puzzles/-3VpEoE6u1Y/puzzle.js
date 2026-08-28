// Title: Attack of the Killer Sandwich
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=-3VpEoE6u1Y
// Source: https://tinyurl.com/5cfw445u

// Normal sudoku rules apply (rows, columns and boxes all-different --
// standard for a plain 9x9 Shape). Black dot: adjacent cells in a 1:2
// ratio; not all dots are given, so this is a plain BlackDot (no StrictKropki
// negative over the rest of the grid). Each outside clue is both a sandwich
// clue (sum strictly between the 1 and the 9 in its row/column) and a little
// killer clue (sum along its indicated diagonal, repeats allowed); the two
// share the same printed value, so each payload littlekillersum entry below
// becomes one Sandwich and one LittleKiller, both built from the payload's
// own cells/direction rather than hand-walked.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Each outside marker names a sandwich lane (the row/column its off-grid
// position addresses) and a little-killer diagonal (the ray from its entry
// cell). Lane and ray both come from the payload's littlekillersum entries
// (marker cell R#C0/R0C#/R#C10/R10C# -> lane; cells/direction -> diagonal).
const clues = [
  // [value, lane fn, diagonal entry cell, dRow, dCol]
  [33, () => graph.column(5), 'R9C6', -1, 1],  // marker R10C5
  [29, () => graph.row(6), 'R5C9', -1, -1],    // marker R6C10
  [28, () => graph.column(6), 'R1C5', 1, -1],  // marker R0C6
  [26, () => graph.row(5), 'R6C1', 1, 1],      // marker R5C0
  [17, () => graph.row(3), 'R2C1', -1, 1],     // marker R3C0
  [30, () => graph.column(3), 'R9C4', -1, 1],  // marker R10C3
  [13, () => graph.column(7), 'R9C8', -1, 1],  // marker R10C7
];

const sandwiches = clues.map(
  ([value, lane]) => Sandwich.fromCells(value, lane(), geometry));
const littleKillers = clues.map(
  ([value, , entry, dRow, dCol]) =>
    LittleKiller.fromCells(value, graph.ray(entry, dRow, dCol), geometry));

return [
  new Shape('9x9'),
  new BlackDot('R6C6', 'R7C6'),
  ...sandwiches,
  ...littleKillers,
];
