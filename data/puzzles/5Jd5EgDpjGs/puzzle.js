// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=5Jd5EgDpjGs
// Source: https://app.crackingthecryptic.com/sudoku/3BF29n48bh

// Rules encoded here, in full:
//  - Normal sudoku rules apply.
//  - In every 3x3 box, the odd digits form a pentomino shape.
//  - The cell with a circle is odd.
//  - Inequality signs point to the smaller of the two cells.
// Every box holds each of 1-9 once, so its odd digits always occupy exactly
// five cells; "form a pentomino shape" is therefore the requirement that
// those five cells are a single orthogonally-connected region.

const graph = cellGraph('9x9');
const boxes = graph.boxes();

// Which five-cell subsets of a 3x3 box are a pentomino, worked out on the
// real geometry of the first box rather than from a hand-drawn table. A
// pattern is a bitmask over the box's nine cells in reading order.
const templateBox = boxes[0];
const NUM_BOX_CELLS = templateBox.length;
const pentominoPatterns = [];
for (let pattern = 0; pattern < (1 << NUM_BOX_CELLS); pattern++) {
  const oddCells = templateBox.filter((_, i) => (pattern >> i) & 1);
  if (oddCells.length === 5 && graph.connected(oddCells)) {
    pentominoPatterns.push(pattern);
  }
}

// The machine reads a box's nine cells in reading order and remembers only
// the parity pattern so far: `seen` is how many cells have been read and
// `odds` is the bitmask of which of them were odd. A prefix that no
// pentomino pattern extends is dropped, so the state stays bounded.
const stateKey = (seen, odds) => `${seen}:${odds}`;
const VIABLE_PREFIXES = new Set(pentominoPatterns.flatMap(
  pattern => Array.from({ length: NUM_BOX_CELLS + 1 },
    (_, seen) => stateKey(seen, pattern & ((1 << seen) - 1)))));
const ACCEPTED = new Set(pentominoPatterns.map(
  pattern => stateKey(NUM_BOX_CELLS, pattern)));

const oddPentominoSpec = NFA.encodeSpec({
  startState: { seen: 0, odds: 0 },
  transition: ({ seen, odds }, value) => {
    const next = { seen: seen + 1, odds: odds | (value % 2 ? 1 << seen : 0) };
    return VIABLE_PREFIXES.has(stateKey(next.seen, next.odds)) ? next : undefined;
  },
  accept: ({ seen, odds }) => ACCEPTED.has(stateKey(seen, odds)),
}, 9);

// Givens, provenance: the twelve digits printed in the grid.
const givens = [
  ['R1C9', 5],
  ['R2C5', 6], ['R2C7', 2], ['R2C9', 4],
  ['R4C1', 2],
  ['R6C2', 5], ['R6C6', 1], ['R6C8', 3],
  ['R7C2', 2],
  ['R8C6', 3],
  ['R9C1', 7], ['R9C2', 4],
];

// Inequalities, provenance: the seven chevrons drawn across cell borders,
// each listed larger cell first -- the chevron's point is its narrow end and
// touches the smaller cell.
const inequalities = [
  ['R6C1', 'R5C1'],
  ['R5C3', 'R5C4'],
  ['R2C2', 'R2C3'],
  ['R2C4', 'R2C5'],
  ['R3C4', 'R3C5'],
  ['R3C5', 'R3C6'],
  ['R1C6', 'R1C5'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, digit]) => new Given(cell, digit)),
  // The lone grey circle, at R1C5.
  new Given('R1C5', 1, 3, 5, 7, 9),
  ...inequalities.map(pair => new GreaterThan(...pair)),
  ...boxes.map(box => new NFA(oddPentominoSpec, 'odd-pentomino', ...box)),
];
