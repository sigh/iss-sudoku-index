// Title: Parhelion
// Author: Shinya
// Video: https://www.youtube.com/watch?v=Lhok4U63sfk
// Source: https://app.crackingthecryptic.com/sudoku/fJQ8FhBQJH

// Normal sudoku rules apply (default row/column/box all-different).
// Cages: digits sum to the total, and are distinct within the cage (standard
// killer-cage reading; the rule text does not say repeats are allowed).
// Outside diagonal clues: LittleKiller sum along the indicated diagonal;
// digits may repeat there unless another rule forbids it (the rule text says
// so explicitly, and LittleKiller's default semantics already allow repeats).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const cages = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2', 19],
  ['R1C8', 'R1C9', 'R2C8', 'R2C9', 20],
  ['R8C1', 'R8C2', 'R9C1', 'R9C2', 13],
  ['R8C8', 'R8C9', 'R9C8', 'R9C9', 19],
].map(([...cellsAndTotal]) => {
  const total = cellsAndTotal.pop();
  return new Cage(total, ...cellsAndTotal);
});

// Each entry is [start cell, dRow, dCol, total] describing the drawn arrow's
// start cell and direction; the ray walks the diagonal to the far edge.
const littleKillers = [
  ['R1C4', 1, -1, 26],
  ['R1C7', 1, -1, 47],
  ['R4C9', -1, -1, 30],
  ['R7C9', -1, -1, 41],
  ['R9C3', -1, 1, 55],
  ['R9C6', -1, 1, 23],
  ['R6C1', 1, 1, 11],
  ['R3C1', 1, 1, 49],
].map(([start, dr, dc, total]) =>
  LittleKiller.fromCells(total, graph.ray(start, dr, dc), geometry));

return [
  new Shape('9x9'),
  ...cages,
  ...littleKillers,
];
