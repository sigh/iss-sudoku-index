// Title: Sum by X
// Author: Unknown
// Video: https://www.youtube.com/watch?v=6p71C89mawE
// Source: https://cracking-the-cryptic.web.app/sudoku/dBqjd87J7J

// Normal sudoku rules apply: standard rows, columns and 3x3 boxes.
//
// Sum by X (video description, quoted): "clues outside the grid sum the
// first X digits in the grid beside that clue where X is the number in the
// first grey cell met." For each outside clue, reading straight into the
// grid along its row/column from the clue's edge: X is the (unknown) digit
// that lands in the first grey cell the line meets; the clue total is the
// sum of the first X cells of that line, counted from the clue's edge.
// Encoded below as a disjunction over every value X can take (1-9): the
// branch for X = d pins the grey cell to d and sums the first d cells.

const graph = cellGraph('9x9');

// Grey-shaded cells (underlays, no digit given): the 12 grey-filled squares
// drawn on the board.
const greyCells = new Set([
  'R1C3', 'R2C2', 'R3C1', 'R7C1', 'R8C2', 'R9C3',
  'R9C7', 'R8C8', 'R7C9', 'R3C9', 'R2C8', 'R1C7',
]);

// Build the "sum of the first X cells" disjunction for one outside clue's
// line, ordered from the clue's edge inward. The control cell is the first
// grey cell the line meets (derived from greyCells, not hand-picked).
function sumByX(total, lineCells) {
  const controlIndex = lineCells.findIndex(c => greyCells.has(c));
  if (controlIndex === -1) {
    throw new Error('No grey cell on line: ' + lineCells.join(','));
  }
  const controlCell = lineCells[controlIndex];
  const branches = [];
  for (let d = 1; d <= lineCells.length; d++) {
    branches.push(new And([
      new Given(controlCell, d),
      new Sum(total, ...lineCells.slice(0, d)),
    ]));
  }
  return new Or(branches);
}

// Outside clues: {cells, total}. `cells` run from the clue's edge into the
// grid (graph.ray starts at the near cell). Overlay index numbers name the
// drawn text overlay each clue came from.
const outsideClues = [
  // Top (reads down), overlays #0-#5.
  { cells: graph.ray('R1C1', 1, 0), total: 28 }, // top C1, overlay #0
  { cells: graph.ray('R1C2', 1, 0), total: 14 }, // top C2, overlay #1
  { cells: graph.ray('R1C3', 1, 0), total: 29 }, // top C3, overlay #2
  { cells: graph.ray('R1C7', 1, 0), total: 27 }, // top C7, overlay #3
  { cells: graph.ray('R1C8', 1, 0), total: 27 }, // top C8, overlay #4
  { cells: graph.ray('R1C9', 1, 0), total: 21 }, // top C9, overlay #5
  // Right (reads left), overlays #6-#11.
  { cells: graph.ray('R1C9', 0, -1), total: 30 }, // right R1, overlay #6
  { cells: graph.ray('R2C9', 0, -1), total: 25 }, // right R2, overlay #7
  { cells: graph.ray('R3C9', 0, -1), total: 15 }, // right R3, overlay #8
  { cells: graph.ray('R7C9', 0, -1), total: 13 }, // right R7, overlay #9
  { cells: graph.ray('R8C9', 0, -1), total: 31 }, // right R8, overlay #10
  { cells: graph.ray('R9C9', 0, -1), total: 18 }, // right R9, overlay #11
  // Bottom (reads up), overlays #12-#17.
  { cells: graph.ray('R9C9', -1, 0), total: 18 }, // bottom C9, overlay #12
  { cells: graph.ray('R9C8', -1, 0), total: 29 }, // bottom C8, overlay #13
  { cells: graph.ray('R9C7', -1, 0), total: 21 }, // bottom C7, overlay #14
  { cells: graph.ray('R9C3', -1, 0), total: 28 }, // bottom C3, overlay #15
  { cells: graph.ray('R9C2', -1, 0), total: 20 }, // bottom C2, overlay #16
  { cells: graph.ray('R9C1', -1, 0), total: 23 }, // bottom C1, overlay #17
  // Left (reads right), overlays #18-#23.
  { cells: graph.ray('R9C1', 0, 1), total: 32 }, // left R9, overlay #18
  { cells: graph.ray('R8C1', 0, 1), total: 16 }, // left R8, overlay #19
  { cells: graph.ray('R7C1', 0, 1), total: 24 }, // left R7, overlay #20
  { cells: graph.ray('R3C1', 0, 1), total: 31 }, // left R3, overlay #21
  { cells: graph.ray('R2C1', 0, 1), total: 14 }, // left R2, overlay #22
  { cells: graph.ray('R1C1', 0, 1), total: 22 }, // left R1, overlay #23
];

return [
  new Shape('9x9'),
  new Given('R5C5', 5),
  ...outsideClues.map(({ cells, total }) => sumByX(total, cells)),
];
