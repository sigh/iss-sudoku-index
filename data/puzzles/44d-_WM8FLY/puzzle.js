// Title: Nonconsecutive Diagonal
// Author: David Clamage
// Video: https://www.youtube.com/watch?v=44d-_WM8FLY
// Source: https://app.crackingthecryptic.com/webapp/Tg3Tddfjp3

// Rules encoded: standard sudoku (Shape supplies row/column/box all-different);
// diagonally-touching cells cannot hold consecutive digits; 4 Arrow clues (one
// with a 2-digit pill bulb, read left-to-right per PillArrow's semantics); 5
// outside diagonal-sum clues (LittleKiller; repeats allowed, since a diagonal
// is not itself a sudoku unit).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Diagonally-adjacent cell pairs cannot hold consecutive digits. ISS's own
// AntiConsecutive constraint only covers orthogonal adjacency, so the diagonal
// version is built here as two replicated templates -- the down-right step
// (R1C1-R2C2) and the down-left step (R1C2-R2C1) -- both targeted at cells
// R1C1..R8C8 (the top-left 8x8 block): for every such target cell T, shifting
// each template by T's offset from R1C1 gives the down-right pair (T, T+1,1)
// and the down-left pair one column right of T paired with one row below T,
// which together sweep every diagonal adjacency in the grid exactly once.
const notConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const diagonalTargets = graph.block('R1C1', 8, 8);
const diagonalNonConsecutive = [
  graph.makeReplicate(
    new Pair(notConsecutive, 'diagonal non-consecutive', 'R1C1', 'R2C2'),
    diagonalTargets),
  graph.makeReplicate(
    new Pair(notConsecutive, 'diagonal non-consecutive', 'R1C2', 'R2C1'),
    diagonalTargets),
];

return [
  new Shape('9x9'),

  // Diagonal non-consecutive (global rule, every diagonally-touching pair).
  ...diagonalNonConsecutive,

  // Arrows: bulb/pill value(s) equal the sum of the arm.
  new PillArrow(2, 'R1C2', 'R1C3', 'R2C4', 'R3C5', 'R4C6', 'R5C7'),
  new Arrow('R5C1', 'R4C1', 'R3C2'),
  new Arrow('R8C7', 'R7C6', 'R6C5'),
  new Arrow('R4C8', 'R3C8', 'R2C9'),

  // Outside diagonal-sum clues. Each diagonal is derived with graph.ray()
  // from the cell nearest the outside clue's arrow, in the direction that
  // arrow points, rather than hand-listing the covered cells.
  LittleKiller.fromCells(7, graph.ray('R2C1', -1, 1), geometry),
  LittleKiller.fromCells(16, graph.ray('R8C1', 1, 1), geometry),
  LittleKiller.fromCells(22, graph.ray('R9C4', -1, 1), geometry),
  LittleKiller.fromCells(7, graph.ray('R9C6', -1, 1), geometry),
  LittleKiller.fromCells(11, graph.ray('R1C8', 1, 1), geometry),
];
