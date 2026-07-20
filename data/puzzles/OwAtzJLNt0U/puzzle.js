// Title: Diagonality
// Author: The Book Wyrm
// Video: https://www.youtube.com/watch?v=OwAtzJLNt0U
// Source: https://sudokupad.app/zhrcbbe8jx

// Every diagonal in either direction has at most three distinct digits.
// CountDistinct records the exact count in an auxiliary cell, so each
// diagonal gets its own control restricted to 1, 2, or 3.

const N = 9;
const graph = cellGraph('9x9');
const diagonalStarts = (edgeColumn) => [
  ...Array.from({ length: N }, (_, col) => makeCellId(1, col + 1)),
  ...Array.from({ length: N - 1 }, (_, row) => makeCellId(row + 2, edgeColumn)),
];
const diagonals = [
  ...diagonalStarts(1).map(cell => graph.ray(cell, 1, 1)),
  ...diagonalStarts(N).map(cell => graph.ray(cell, 1, -1)),
].filter(cells => cells.length > 3);

const DISTINCT_COUNTS = new Var(
  'D', 'Distinct digits on each nontrivial diagonal', diagonals.length);
const diagonalConstraints = diagonals.flatMap((cells, i) => {
  const control = DISTINCT_COUNTS.cell(i + 1);
  return [
    new Given(control, 1, 2, 3),
    new CountDistinct(control, ...cells),
  ];
});

const renbanLines = [
  ['R7C6', 'R8C5', 'R9C4'],
  ['R4C7', 'R5C8', 'R6C9'],
  ['R1C6', 'R2C5', 'R3C4'],
  ['R4C1', 'R5C2', 'R6C3'],
];

return [
  new Shape('9x9'),
  new Given('R1C7', 5),
  new Given('R3C1', 1),
  new Given('R8C9', 8),
  new Given('R9C2', 7),
  DISTINCT_COUNTS,
  ...diagonalConstraints,
  ...renbanLines.map(cells => new Renban(...cells)),
];
