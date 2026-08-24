// Title: Covid Killer
// Author: Isaac Struhl
// Video: https://www.youtube.com/watch?v=tDIT3gpNfwI
// Source: https://app.crackingthecryptic.com/sudoku/ppqDTTr3PH

// Rules encoded here:
//   * Normal sudoku rules apply (rows, columns, nine 3x3 boxes all-different).
//   * Killer cages: digits sum to the given total, no repeats within a cage.
//   * Each 3x3 box is a "restaurant"; even digits are "patrons" who must
//     socially distance -- within the same box, two even digits may not be
//     orthogonally adjacent to each other. (Adjacency across a box boundary
//     is unrestricted; the rule text scopes the ban to "within the same box".)
// Nothing is omitted. No givens are present in the payload.

const graph = cellGraph('9x9');

// Cage cells and totals, transcribed from the payload's `cages` array.
const cages = [
  [16, 'R1C2', 'R2C2', 'R2C3'],
  [15, 'R3C3', 'R4C3', 'R4C2'],
  [21, 'R7C2', 'R7C1', 'R8C1'],
  [32, 'R7C5', 'R8C5', 'R9C5', 'R8C4', 'R8C6'],
  [11, 'R7C7', 'R7C9', 'R7C8', 'R8C8'],
  [13, 'R4C7', 'R5C7', 'R5C6'],
  [6, 'R3C6', 'R3C5'],
  [18, 'R2C6', 'R2C7', 'R3C7', 'R1C7', 'R2C8'],
];

// "Not both even": the pairwise relation behind every same-box orthogonal
// adjacency below.
const notBothEven = Pair.fnToKey((a, b) => !(a % 2 === 0 && b % 2 === 0), 9);

// Every box has the same 12 within-box orthogonal edges at the same 12
// relative (row, col) offsets from its own top-left corner, so one template
// per offset, replicated across all 9 box top-lefts, covers every edge
// without ever crossing a box boundary.
const boxOrigins = graph.boxes().map(box => box[0]); // each box's top-left cell
const edgeOffsets = [
  ...[0, 1, 2].flatMap(r => [0, 1].map(c => [[r, c], [r, c + 1]])), // horizontal
  ...[0, 1].flatMap(r => [0, 1, 2].map(c => [[r, c], [r + 1, c]])), // vertical
];
const socialDistancing = edgeOffsets.map(([[r0, c0], [r1, c1]]) => {
  const origin = graph.step('R1C1', r0, c0);
  const target = graph.step('R1C1', r1, c1);
  const targets = boxOrigins.map(bo => graph.step(bo, r0, c0));
  return new Replicate(
    [new Pair(notBothEven, 'restaurant-distancing', origin, target)],
    Replicate.encodeTargetCells(targets, origin, graph),
    origin,
  );
});

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...socialDistancing,
];
