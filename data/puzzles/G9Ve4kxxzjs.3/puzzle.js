// Title: May 8, 2022: B1G3 Skyscrapers
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=G9Ve4kxxzjs
// Source: https://tinyurl.com/mrxs66n4

// Normal sudoku rules (default 6x6 Shape: rows, columns and the six 2x3
// boxes below are all-different). Four outside skyscraper clues (Skyscraper's
// own semantics: count of digits visible into the line from that side, a
// digit visible only once it exceeds every digit already seen).

const graph = cellGraph('6x6');
const geometry = graph.gridGeometry();

// [line id, direction (1 = from top/left, -1 = from bottom/right), printed
// value]. Transcribed from the payload's "text" overlay: real rows/columns
// are 1-6, and the outside margin is column/row 0 (top/left) or 7 (size+1,
// bottom/right).
const clues = [
  ['R3', 1, 3],   // left, row 3
  ['C4', 1, 5],   // top, column 4
  ['C3', -1, 6],  // bottom, column 3
  ['R5', -1, 3],  // right, row 5
];

// The clue's own line, oriented from its own edge (near cell first).
function orientedLine([line, dir]) {
  const axis = line[0];
  const index = Number(line.slice(1));
  const cells = axis === 'C' ? graph.column(index) : graph.row(index);
  return dir === 1 ? cells : cells.slice().reverse();
}

const skyscrapers = clues.map(
  clue => Skyscraper.fromCells(clue[2], orientedLine(clue), geometry));

return [
  new Shape('6x6'),
  new Given('R1C1', 4),
  new Given('R3C6', 6),
  new Given('R4C1', 6),
  new Given('R4C4', 5),
  new Given('R6C6', 5),
  ...skyscrapers,
];
