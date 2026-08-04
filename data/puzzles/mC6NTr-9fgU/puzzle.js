// Title: Between The Mines
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=mC6NTr-9fgU
// Source: https://app.crackingthecryptic.com/sudoku/bt33LL43h7

// Full encoding. Normal sudoku (default rows/cols/boxes) plus:
// - Between(...): cells between the two named circles are strictly between
//   their values (one Between per drawn line, circle endpoints first/last).
// - A shade overlay ('VS') for the Yin-Yang region: SHADED/UNSHADED per
//   cell, each shade orthogonally connected (ConnectedValues) and no 2x2
//   block monochrome (replicated NFA).
// - Circles are always UNSHADED, and their grid digit equals the count of
//   shaded cells among their up-to-8 king-move neighbours (minesweeper).

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// No 2x2 block may be all shaded or all unshaded: one NFA on the top-left
// block, replicated to every block origin. Domain-agnostic: only checks
// whether all four seen values match, so it works for the shade overlay's
// {SHADED, UNSHADED} pair even though numValues below is the grid's 9.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = graph.cells().filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(graph.cells()[0], 2, 2))),
  shade.at(blockOrigins));

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
  shade.toVar('shade'),
  shadeDomain,
  ...circlesUnshaded,
  // Yin-Yang connectivity: each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...minesweeperCounts,
  ...betweenLines,
];
