// Title: Triskaidekaphobia
// Author: Lisa Ugray
// Video: https://www.youtube.com/watch?v=vP0Se3bRbDY
// Source: https://sudokupad.app/ppclf3vvfp

// Normal sudoku rules apply (Shape gives the 9x9 grid plus row, column, and
// standard-box all-different groups; the payload's `regions` array is the
// nine ordinary 3x3 boxes). The fog-of-war reveal is solving UI, not a rule
// about the finished grid, and is not encoded.
//
// "Pairs of adjacent digits (orthogonal AND diagonal) do not sum to 13."
// Four translated Pair templates cover every horizontal, vertical, and
// both-diagonal king-move edge in the grid: each template pins one edge at
// the grid's first cell and Replicate shifts it to every valid start
// position, so every adjacent pair in the grid gets the same relation.
const graph = cellGraph('9x9');
const no13Key = Pair.fnToKey((a, b) => a + b !== 13, 9);
const horizontalStarts = graph.cells().filter(cell => parseCellId(cell).col < 9);
const verticalStarts = graph.cells().filter(cell => parseCellId(cell).row < 9);
const diagStarts = graph.cells().filter(
  cell => parseCellId(cell).row < 9 && parseCellId(cell).col < 9);

const noAdjacent13 = [
  graph.makeReplicate(
    new Pair(no13Key, 'adjacent cells do not sum to 13', 'R1C1', 'R1C2'),
    horizontalStarts),
  graph.makeReplicate(
    new Pair(no13Key, 'adjacent cells do not sum to 13', 'R1C1', 'R2C1'),
    verticalStarts),
  graph.makeReplicate(
    new Pair(no13Key, 'adjacent cells do not sum to 13', 'R1C1', 'R2C2'),
    diagStarts),
  graph.makeReplicate(
    new Pair(no13Key, 'adjacent cells do not sum to 13', 'R1C2', 'R2C1'),
    diagStarts),
];

// "Adjacent digits along a red line have a difference of 1 or 3." Four
// drawn segments; two of them share cell R2C6, forming one connected
// 3-edge shape rather than a simple line, but the rule is pairwise on
// consecutive cells so each drawn segment gets its own Pair chain
// regardless of the branch.
const diffKey = Pair.fnToKey((a, b) => {
  const d = Math.abs(a - b);
  return d === 1 || d === 3;
}, 9);
const redLines = [
  new Pair(diffKey, 'red line', 'R1C5', 'R2C6', 'R3C5'),
  new Pair(diffKey, 'red line', 'R2C6', 'R2C5'),
  new Pair(diffKey, 'red line', 'R3C4', 'R2C4', 'R1C4'),
  new Pair(diffKey, 'red line', 'R1C2', 'R2C2', 'R3C2'),
];

// "Digits in a cage cannot repeat and sum to the total given." Cage cells
// from the payload's `cages` array (both entries flagged all-different).
const cages = [
  new Cage(13, 'R2C7', 'R2C8', 'R3C7', 'R3C8'),
  new Cage(10, 'R3C3', 'R4C3', 'R5C3'),
];

return [
  new Shape('9x9'),
  new Given('R5C4', 7),
  ...noAdjacent13,
  ...redLines,
  ...cages,
];
