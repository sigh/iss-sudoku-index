// Title: La PrimeAvera
// Author: Kothornos
// Video: https://www.youtube.com/watch?v=RFS-Nfeo7gs
// Source: https://app.crackingthecryptic.com/kgozp9smu9

// Normal Sudoku. The rules' singular "the indicated diagonal" is the
// positive-slope one, R9C1 to R1C9 -- the payload marks `diagonal+` with no
// `diagonal-` -- so that diagonal is all-different. Black dots are 2:1 ratios,
// and each little-killer clue sums its own down-right diagonal, which is a
// separate feature from the marked diagonal.
const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// The drawn killer cages have their displayed totals, distinct digits, and each
// cage is either entirely prime (2,3,5,7) or entirely non-prime (1,4,6,8,9).
// Cage cells and totals are transcribed from the drawn cage outlines and labels.
const cages = [
  [17, ['R2C2', 'R2C3', 'R3C2', 'R3C3']],
  [17, ['R7C7', 'R7C8', 'R8C7', 'R8C8']],
  [24, ['R8C1', 'R8C2', 'R9C1', 'R9C2']],
  [14, ['R4C1', 'R5C1', 'R6C1']],
  [11, ['R3C6', 'R3C7', 'R4C7']],
  [14, ['R1C5', 'R2C5', 'R2C6']],
  [14, ['R4C8', 'R5C8', 'R5C9']],
  [14, ['R1C1', 'R1C2', 'R2C1']],
  [14, ['R6C2', 'R6C3']],
];
const primeCage = (cells) => new Or([
  new And(cells.map((cell) => new Given(cell, 2, 3, 5, 7))),
  new And(cells.map((cell) => new Given(cell, 1, 4, 6, 8, 9))),
]);

return [
  new Shape('9x9'),
  new Diagonal(1),
  new BlackDot('R8C4', 'R9C4'),
  new BlackDot('R5C6', 'R6C6'),
  LittleKiller.fromCells(40, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(29, graph.ray('R1C4', 1, 1), geometry),
  ...cages.flatMap(([sum, cells]) => [new Cage(sum, ...cells), primeCage(cells)]),
];
