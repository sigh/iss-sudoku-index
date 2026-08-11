// Title: Dodekanesos
// Author: PjotrV
// Video: https://www.youtube.com/watch?v=StSN0FLX1HY
// Source: https://app.crackingthecryptic.com/sudoku/MRfqQRbHmB

// Normal sudoku rules apply (default row/column/box all-different; the
// payload's `regions` array is the standard nine 3x3 boxes).
//
// Shading is a direct function of digit parity, not separate solver state:
// odd digits (1,3,5,7,9) are unshaded "water", even digits (2,4,6,8) are
// shaded "island" cells. "All water cells must be orthogonally connected":
// ConnectedValues applied directly to the main grid over the odd values.
// "There cannot be any 2x2 areas of water": a replicated NFA rejects any
// all-odd 2x2 block.
//
// "An island is formed of orthogonally connected cells. Islands cannot
// touch each other orthogonally": not separately encoded -- two even cells
// that were orthogonally adjacent would themselves be one connected
// component by the same definition, so the no-orthogonal-touch clause is a
// restatement of "island" meaning maximal connected component, not an
// additional constraint. "Digits may repeat on an island": likewise not
// encoded as anything -- it says no island-scoped all-different exists to
// add, and the default row/column/box all-different is unaffected.
//
// "A cage cell is representing the leftmost cell in the top row of an
// island and the clue of the cage cell is equal to the sum of digits of the
// island. Not necessarily all cage cells are given." Only the necessary
// local consequences of "leftmost cell in the top row" are encoded: the
// cage cell itself must be even (it is an island cell), and its up/left
// neighbours (where on-grid) must be odd -- an even neighbour there would
// be orthogonally adjacent, hence the same island, contradicting
// topmost/leftmost. This is necessary but not sufficient: a cell further
// up-left could still belong to the same island via a longer path through
// another row/column, which these local checks cannot see. The cage
// totals themselves (sum of the island's digits) are not encoded at all:
// checking them needs the island's full, unbounded extent, which is not
// determined by these local facts alone.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const ODD = [1, 3, 5, 7, 9];   // water
const EVEN = [2, 4, 6, 8];     // island

// R#C#=value provenance: the payload's 9 given digits.
const givens = [
  ['R1C2', 4], ['R1C6', 1], ['R2C2', 9], ['R2C6', 6], ['R2C8', 5],
  ['R3C9', 3], ['R6C2', 3], ['R7C7', 1], ['R9C3', 7],
];
const givenCells = new Set(givens.map(([cell]) => cell));

// Cage-cell provenance: the payload's 7 single-cell cages, each with a
// total. The total is not enforced (see header); only the position is used.
const cageCells = [
  'R1C1', 'R3C2', 'R2C5', 'R1C9', 'R5C4', 'R9C1', 'R9C7',
];

// Cage cell must be an island (even) cell.
const cageIsIsland = cageCells.map(cell => new Given(cell, ...EVEN));

// Necessary condition for "leftmost cell in the top row": the up and left
// neighbours, where on-grid and not already pinned by a plain given, must
// be water (odd) -- see header comment for why this is necessary but not
// sufficient.
const cageNeighborsOdd = cageCells.flatMap(cell => (
  [graph.step(cell, -1, 0), graph.step(cell, 0, -1)]
    .filter(neighbor => neighbor !== null && !givenCells.has(neighbor))
    .map(neighbor => new Given(neighbor, ...ODD))
));

// "All water cells must be orthogonally connected": one connected region of
// odd-valued cells, asserted directly on the main grid (parity is a
// function of the digit, not separate shading state).
const waterConnected = new ConnectedValues('', ODD);

// "There cannot be any 2x2 areas of water": no 2x2 block is all-odd. Scan
// each 2x2 origin (every cell with a 2x2 block to its down-right, not just
// box-aligned ones) and reject only once all four seen cells are odd; any
// even digit accepts immediately.
const noAllWater2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const parity = value % 2;
    const next = [...seen, parity];
    if (next.length < 4) return { seen: next };
    const allWater = next.every(p => p === 1);
    return allWater ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noAllWater2x2 = graph.makeReplicate(
  new NFA(noAllWater2x2Machine, 'no-all-water-2x2', ...graph.block(gridCells[0], 2, 2)),
  blockOrigins);

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cageIsIsland,
  ...cageNeighborsOdd,
  waterConnected,
  noAllWater2x2,
];
