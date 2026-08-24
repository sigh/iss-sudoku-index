// Title: TrioSumDiag
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=hHS4lhUE9AU
// Source: https://app.crackingthecryptic.com/sudoku/nbDJmrBbH8

// Normal sudoku, standard boxes. Two diagonals (drawn corner to corner) hold
// no repeated digit. Six white circles sit on the main diagonal at Rn,Cn for
// n = 1..6. Twelve undecorated 3-cell arrows are drawn (no printed value):
// one per row 1-6 spanning columns 7-9 of that row, and one per column 1-6
// spanning rows 7-9 of that column. Rule: each circle equals (sum of the
// digits its row's arrow trio spans) minus 10, and also equals (sum of the
// digits its column's arrow trio spans) minus 10 -- both trios tie to the
// same circle cell, so requiring each independently ties the two sums
// together. Three grey 4-cell lines are thermometers with an unmarked bulb:
// the digits strictly ascend or strictly descend along the drawn cell order
// (rule: "the digits ascend one way or the other along the line").

const rowTrioCells = n => [makeCellId(n, 7), makeCellId(n, 8), makeCellId(n, 9)];
const colTrioCells = n => [makeCellId(7, n), makeCellId(8, n), makeCellId(9, n)];
const diagCell = n => makeCellId(n, n);

// Each Sum enforces trioSum - circle = 10, i.e. circle = trioSum - 10.
const trioSums = [1, 2, 3, 4, 5, 6].flatMap(n => [
  new Sum(10, ...rowTrioCells(n), [diagCell(n), -1]),
  new Sum(10, ...colTrioCells(n), [diagCell(n), -1]),
]);

// Hidden-bulb thermos: cell order taken from the drawn stroke; direction is
// not marked, so require strictly increasing in one direction or the other.
const hiddenThermo = (...cells) => new Or([
  new Thermo(...cells),
  new Thermo(...[...cells].reverse()),
]);

const hiddenThermos = [
  hiddenThermo('R1C5', 'R2C4', 'R3C5', 'R2C6'),
  hiddenThermo('R5C1', 'R4C2', 'R5C3', 'R6C2'),
  hiddenThermo('R9C8', 'R8C7', 'R7C8', 'R8C9'),
];

return [
  new Shape('9x9'),

  new Given('R1C2', 2),
  new Given('R1C8', 8),
  new Given('R2C1', 4),
  new Given('R2C5', 1),
  new Given('R2C9', 6),
  new Given('R5C2', 1),
  new Given('R5C5', 8),
  new Given('R8C1', 8),
  new Given('R9C2', 3),

  // '\' diagonal R1C1..R9C9 and '/' diagonal R1C9..R9C1, both no-repeat.
  new Diagonal(-1),
  new Diagonal(1),

  ...trioSums,
  ...hiddenThermos,
];
