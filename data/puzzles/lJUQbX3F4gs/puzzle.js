// Title: 159 Skyscraper
// Author: Clover
// Video: https://www.youtube.com/watch?v=lJUQbX3F4gs
// Source: https://app.crackingthecryptic.com/sudoku/T4dMrNr2pF

// Normal sudoku rules (default 9x9 Shape). No givens.
//
// Column indexing: for every cell in column 1, its value V means the digit 1
// sits at column V in that same row; the same rule applies to columns 5 and 9
// (with digits 5 and 9 respectively). Indexing('C', ...) is exactly this
// semantics (control cell's own column number is the indexed value, its row
// gives the indexed cells) -- one Indexing constraint per special column.
//
// Eight outside skyscraper clues (all printed "5"), transcribed from the
// overlay badges: [line id, direction (1 = from top/left, -1 = from
// bottom/right), value].

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

const clues = [
  ['C6', 1, 5],   // top, column 6
  ['C9', 1, 5],   // top, column 9
  ['R4', 1, 5],   // left, row 4
  ['R5', 1, 5],   // left, row 5
  ['R8', 1, 5],   // left, row 8
  ['R5', -1, 5],  // right, row 5
  ['R6', -1, 5],  // right, row 6
  ['C1', -1, 5],  // bottom, column 1
];

// The clue's own line, oriented from its own edge (near cell first).
function orientedLine([line, dir]) {
  const axis = line[0];
  const index = Number(line.slice(1));
  const cells = axis === 'C' ? graph.column(index) : graph.row(index);
  return dir === 1 ? cells : cells.slice().reverse();
}

return [
  new Shape('9x9'),

  new Indexing('C', ...graph.column(1)),
  new Indexing('C', ...graph.column(5)),
  new Indexing('C', ...graph.column(9)),

  ...clues.map(clue => Skyscraper.fromCells(clue[2], orientedLine(clue), geometry)),
];
