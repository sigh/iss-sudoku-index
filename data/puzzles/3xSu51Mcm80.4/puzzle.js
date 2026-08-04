// Title: April 19, 2023:Odd Tapa Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=3xSu51Mcm80
// Source: https://tinyurl.com/yuyfbuf8

// Normal sudoku. Odd digits (1,3,5,7,9) form a single orthogonally-connected
// region: ConnectedValues applied directly to the grid, since parity is a
// function of the digit rather than separate shading state. No 2x2 block is
// all-odd (even-only or mixed 2x2 blocks are unrestricted).

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// R#C# provenance: givens read from the grid array.
const givens = [
  ['R1C1', 3], ['R1C2', 5], ['R1C3', 6], ['R1C5', 4], ['R1C7', 9],
  ['R1C8', 1], ['R1C9', 7], ['R2C1', 1], ['R2C9', 3], ['R4C1', 2],
  ['R4C3', 4], ['R4C7', 3], ['R4C9', 6], ['R5C2', 1], ['R5C4', 7],
  ['R5C5', 9], ['R5C6', 3], ['R5C8', 2], ['R6C1', 9], ['R6C9', 1],
  ['R7C4', 4], ['R7C6', 8], ['R8C3', 9], ['R8C5', 3], ['R8C7', 4],
];

// No 2x2 block is all-odd: scan each block's four cells and reject only if
// every one seen so far is odd; any even digit accepts immediately. Mirrors
// the no-monochrome-2x2 NFA pattern, but tests only the odd parity.
const gridCells = graph.cells();
const noAllOdd2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const parity = value % 2;
    const next = [...seen, parity];
    if (next.length < 4) return { seen: next };
    const allOdd = next.every(p => p === 1);
    return allOdd ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noAllOdd2x2 = graph.makeReplicate(
  new NFA(noAllOdd2x2Machine, 'no-all-odd-2x2', ...graph.block(gridCells[0], 2, 2)),
  blockOrigins);

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new ConnectedValues('', [1, 3, 5, 7, 9]),
  noAllOdd2x2,
];
