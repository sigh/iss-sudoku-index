// Title: Between The Mines
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=mC6NTr-9fgU
// Source: https://app.crackingthecryptic.com/sudoku/bt33LL43h7

// Full encoding. Normal sudoku (default rows/cols/boxes) plus:
// - Between(...): cells between the two named circles are strictly between
//   their values (one Between per drawn line, circle endpoints first/last).
// - YinYang(): the shade overlay ('YY') with its two-shade, single-connected-
//   region-per-shade, no-monochrome-2x2 semantics built in.
// - Circles are always UNSHADED, and their grid digit equals the count of
//   shaded cells among their up-to-8 king-move neighbours (minesweeper).

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');

// The 12 circles (one white-circle underlay per cell listed).
const circles = [
  'R2C1', 'R2C3', 'R2C6', 'R2C8', 'R5C5', 'R6C9',
  'R4C3', 'R6C2', 'R7C4', 'R7C6', 'R9C6', 'R9C1',
];
const circlesUnshaded = circles.map(
  cell => new Given(shade.at(cell), UNSHADED));

// Minesweeper: circle's digit = count of shaded cells among its up-to-8
// king-move neighbours. With SHADED=1/UNSHADED=2, summing k neighbours
// gives 2k - (shaded count); adding the circle's own digit and requiring
// the total to equal 2k forces digit = shaded count.
const minesweeperCounts = circles.map(cell => {
  const neighbours = graph.kingNeighbours(cell);
  return new Sum(2 * neighbours.length, ...shade.at(neighbours), cell);
});

// The 10 drawn between-lines, each circle-to-circle through the listed
// between cells. L0/L1 share an endpoint pair (R2C1, R2C3) via different
// cell paths; R2C8 and R7C4 are each a shared endpoint of several lines.
const betweenLines = [
  ['R2C1', 'R1C2', 'R2C3'],
  ['R2C1', 'R3C1', 'R3C2', 'R3C3', 'R2C3'],
  ['R2C6', 'R2C7', 'R2C8'],
  ['R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R6C9'],
  ['R7C6', 'R7C5', 'R7C4'],
  ['R9C1', 'R8C2', 'R7C3', 'R7C4'],
  ['R6C2', 'R5C2', 'R4C3'],
  ['R5C5', 'R6C4', 'R7C4'],
  ['R6C2', 'R6C3', 'R5C4', 'R4C5', 'R4C6', 'R3C7', 'R2C8'],
  ['R7C4', 'R8C5', 'R9C6'],
].map(cells => new Between(...cells));

return [
  new Shape('9x9'),
  new Given('R6C6', 9),
  new Given('R7C8', 9),
  new YinYang(),
  ...circlesUnshaded,
  ...minesweeperCounts,
  ...betweenLines,
];
