// Title: Little Killers - But Which Way?
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=Cy4BJLKYhng
// Source: https://cracking-the-cryptic.web.app/sudoku/hfLNJ9tghB

// Normal sudoku rules. Both main diagonals contain 1-9 (Diagonal(1) is the
// bottom-left-to-top-right '/' diagonal, Diagonal(-1) the top-left-to-
// bottom-right '\' diagonal). Ten Little Killer clues sit in the outside
// margin; each margin badge is diagonally adjacent to two grid cells, one on
// each side of its row/column lane, and the rules state the arrow direction
// is not drawn -- the solver must find which of the two diagonals the sum
// applies to. Each clue is encoded as an Or over its two candidate diagonals
// (LittleKiller.fromCells derives the canonical corner from an explicit cell
// list; the two candidate cell lists per clue are the two grid corners each
// margin badge touches diagonally, one on each side of its row/column lane).
// Digits may repeat along a little killer diagonal, matching LittleKiller's
// own semantics.
// The column-8 top badge (total 9) has one candidate diagonal that is just
// the single top-right corner cell R1C9: LittleKiller.fromCells throws for a
// one-cell diagonal (ISS's cellMap has no entry for either 1-cell grid
// corner), so that branch is a plain Sum instead.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const littleKiller = (total, startA, dA, startB, dB) => {
  const branch = (cells) => cells.length > 1
    ? LittleKiller.fromCells(total, cells, geometry)
    : new Sum(total, ...cells);
  return new Or([
    branch(graph.ray(startA, ...dA)),
    branch(graph.ray(startB, ...dB)),
  ]);
};

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),

  // top, column 4 -- total 7
  littleKiller(7, 'R1C3', [1, -1], 'R1C5', [1, 1]),
  // top, column 7 -- total 14
  littleKiller(14, 'R1C6', [1, -1], 'R1C8', [1, 1]),
  // top, column 8 -- total 9
  littleKiller(9, 'R1C7', [1, -1], 'R1C9', [1, 1]),
  // bottom, column 3 -- total 13
  littleKiller(13, 'R9C2', [-1, -1], 'R9C4', [-1, 1]),
  // bottom, column 4 -- total 12
  littleKiller(12, 'R9C3', [-1, -1], 'R9C5', [-1, 1]),
  // bottom, column 5 -- total 5
  littleKiller(5, 'R9C4', [-1, -1], 'R9C6', [-1, 1]),
  // left, row 5 -- total 35
  littleKiller(35, 'R4C1', [-1, 1], 'R6C1', [1, 1]),
  // left, row 6 -- total 11
  littleKiller(11, 'R5C1', [-1, 1], 'R7C1', [1, 1]),
  // right, row 6 -- total 15
  littleKiller(15, 'R5C9', [-1, -1], 'R7C9', [1, -1]),
  // right, row 7 -- total 14
  littleKiller(14, 'R6C9', [-1, -1], 'R8C9', [1, -1]),
];
