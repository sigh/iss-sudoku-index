// Title: Magical Clock
// Author: Jeroen Panda
// Video: https://www.youtube.com/watch?v=jVWbnsa6_mY
// Source: https://sudokupad.app/pgbxx02f1l

// Normal Sudoku applies. Box 5 is a magic square. On each lavender zipper,
// mirrored cells sum to its centre and a digit pair used for that total cannot
// recur on that zipper. The five outside arrows are little-killer sums.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const zipperLines = [
  ['R6C1', 'R7C2', 'R8C2', 'R8C3', 'R9C4'],
  ['R9C5', 'R9C6', 'R8C7', 'R8C8', 'R7C8', 'R6C9', 'R5C9'],
  ['R4C9', 'R3C8', 'R2C8', 'R2C7', 'R1C6'],
  ['R4C1', 'R3C1', 'R2C2', 'R1C3', 'R2C4'],
  ['R4C5', 'R5C5', 'R6C6'],
];

// The drawn lavender paths above provide the zipper geometry. With matching
// pair sums, two mirrored pairs are the same unordered pair exactly when one
// endpoint of the first equals either endpoint of the second.
const zipperPairDistinctness = zipperLines.flatMap((line) => {
  const pairs = Array.from({ length: Math.floor(line.length / 2) }, (_, i) =>
    [line[i], line[line.length - 1 - i]]);
  return pairs.flatMap(([leftA, rightA], i) =>
    pairs.slice(i + 1).flatMap(([leftB, rightB]) => [
      new AllDifferent(leftA, leftB),
      new AllDifferent(leftA, rightB),
    ]));
});

return [
  new Shape('9x9'),

  // The nine central-box rows, columns, and diagonals are the drawn box-5
  // magic-square groups.
  new EqualSum(
    ['R4C4', 'R4C5', 'R4C6'],
    ['R5C4', 'R5C5', 'R5C6'],
    ['R6C4', 'R6C5', 'R6C6'],
    ['R4C4', 'R5C4', 'R6C4'],
    ['R4C5', 'R5C5', 'R6C5'],
    ['R4C6', 'R5C6', 'R6C6'],
    ['R4C4', 'R5C5', 'R6C6'],
    ['R4C6', 'R5C5', 'R6C4'],
  ),

  ...zipperLines.map((line) => new Zipper(...line)),
  ...zipperPairDistinctness,

  // These cell lists are the five diagonals indicated by the outside arrows.
  LittleKiller.fromCells(18, graph.ray('R6C1', 1, 1), geometry),
  LittleKiller.fromCells(12, graph.ray('R9C6', -1, 1), geometry),
  LittleKiller.fromCells(14, graph.ray('R4C9', -1, -1), geometry),
  LittleKiller.fromCells(16, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(46, graph.ray('R1C1', 1, 1), geometry),
];
