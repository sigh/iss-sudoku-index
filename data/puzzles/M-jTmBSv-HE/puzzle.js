// Title: Kineticism
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=M-jTmBSv-HE
// Source: https://app.crackingthecryptic.com/sudoku/2LJ7ggN9D4

// Normal Sudoku rules apply. Each outside clue is an X-Sum: the sum of the
// first X digits of its row/column read from the clue's side, where X is the
// digit in the cell nearest the clue (that cell counts as the first digit
// summed). Encoded with the native XSum class, built from each clue's full
// line of cells via XSum.fromCells so the direction matches the clue side
// exactly (top/left read inward, bottom/right read from the far end back).
const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Column clues (value, start cell, row step): read down from the top or up
// from the bottom.
const columnClues = [
  [15, 'R1C3', 1], [15, 'R1C5', 1], [15, 'R1C7', 1],
  [21, 'R9C2', -1], [21, 'R9C5', -1], [21, 'R9C8', -1],
];
// Row clues (value, start cell, col step): read right from the left or left
// from the right.
const rowClues = [
  [14, 'R3C1', 1], [23, 'R7C1', 1],
  [14, 'R3C9', -1], [15, 'R7C9', -1],
];

return [
  new Shape('9x9'),
  new Given('R4C4', 4), new Given('R4C6', 2),
  ...columnClues.map(([value, cell, dRow]) =>
    XSum.fromCells(value, graph.ray(cell, dRow, 0), geometry)),
  ...rowClues.map(([value, cell, dCol]) =>
    XSum.fromCells(value, graph.ray(cell, 0, dCol), geometry)),
];
