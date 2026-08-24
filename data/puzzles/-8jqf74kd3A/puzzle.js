// Title: Connect the Dits
// Author: Undar_Beyond; Dance1211
// Video: https://www.youtube.com/watch?v=-8jqf74kd3A
// Source: https://app.crackingthecryptic.com/sudoku/hFdr98R6BQ

// Normal sudoku rules apply. A white dot between two orthogonally adjacent
// cells means the digits are consecutive; a black dot means one digit is
// double the other (1:2 ratio). A grey dot means the pair is one of those
// two relations -- which one is the puzzle's own separate decryption step,
// not a grid constraint, so it is encoded here as Or(white, black). "All
// possible dots are marked" is exhaustive over all three colours: every
// orthogonally adjacent pair carrying no dot of any colour is neither
// consecutive nor a 1:2 ratio.

// Edge endpoints below are transcribed from the payload's overlay list,
// keyed by each overlay's fillColor: white (#FFFFFF), grey (#CFCFCF),
// black (#000000). Two further overlays sit off-grid (centers [-0.5,-0.5]
// and [9.5,9.5]) and draw no cell edge -- styling only, not clues.

const whiteEdges = [
  ['R1C2', 'R1C3'], ['R2C1', 'R3C1'], ['R3C2', 'R3C3'], ['R3C3', 'R3C4'],
  ['R4C3', 'R4C4'], ['R4C2', 'R4C3'], ['R2C4', 'R3C4'], ['R2C5', 'R3C5'],
  ['R1C6', 'R2C6'], ['R1C9', 'R2C9'], ['R4C9', 'R5C9'], ['R6C7', 'R6C8'],
  ['R4C6', 'R5C6'], ['R4C4', 'R5C4'], ['R8C1', 'R9C1'], ['R9C3', 'R9C4'],
  ['R7C4', 'R7C5'], ['R9C6', 'R9C7'], ['R8C6', 'R8C7'],
];

const greyEdges = [
  ['R1C5', 'R1C6'], ['R1C6', 'R1C7'], ['R1C7', 'R1C8'], ['R3C2', 'R4C2'],
  ['R3C3', 'R4C3'], ['R3C4', 'R4C4'], ['R3C5', 'R4C5'], ['R3C6', 'R4C6'],
  ['R4C5', 'R4C6'], ['R4C6', 'R4C7'], ['R4C7', 'R4C8'], ['R4C8', 'R4C9'],
  ['R5C1', 'R6C1'], ['R5C2', 'R6C2'], ['R5C3', 'R6C3'], ['R5C4', 'R6C4'],
  ['R5C5', 'R6C5'], ['R7C1', 'R8C1'], ['R7C2', 'R8C2'], ['R7C7', 'R8C7'],
  ['R7C8', 'R8C8'], ['R7C9', 'R8C9'], ['R8C8', 'R9C8'], ['R8C7', 'R9C7'],
  ['R8C6', 'R9C6'], ['R8C5', 'R9C5'], ['R8C4', 'R9C4'],
];

const blackEdges = [
  ['R8C3', 'R9C3'], ['R7C4', 'R8C4'], ['R6C1', 'R6C2'], ['R4C1', 'R5C1'],
  ['R1C2', 'R2C2'], ['R3C5', 'R3C6'], ['R5C5', 'R5C6'], ['R5C9', 'R6C9'],
  ['R2C9', 'R3C9'], ['R1C7', 'R2C7'],
];

// Every orthogonally adjacent pair in the 9x9 grid, standard row/col
// adjacency (the payload's own `regions` are the ordinary 3x3 boxes).
function allAdjacentPairs() {
  const pairs = [];
  for (let r = 1; r <= 9; r++) {
    for (let c = 1; c <= 9; c++) {
      if (c < 9) pairs.push([makeCellId(r, c), makeCellId(r, c + 1)]);
      if (r < 9) pairs.push([makeCellId(r, c), makeCellId(r + 1, c)]);
    }
  }
  return pairs;
}

const markedKey = pair => [...pair].sort().join('-');
const marked = new Set(
  [...whiteEdges, ...greyEdges, ...blackEdges].map(markedKey));
const unmarkedEdges = allAdjacentPairs().filter(p => !marked.has(markedKey(p)));
// Split by offset (same row = horizontal, same column = vertical): the two
// unmarked-edge templates below each have a fixed offset, so each needs its
// own Replicate group.
const unmarkedHoriz = unmarkedEdges.filter(([a, b]) => a[1] === b[1]); // row digit equal
const unmarkedVert = unmarkedEdges.filter(([a, b]) => a[1] !== b[1]);

// "All possible dots are marked": neither consecutive nor 1:2 ratio holds
// across an unmarked edge.
const noDotKey = Pair.fnToKey(
  (a, b) => Math.abs(a - b) !== 1 && a !== 2 * b && b !== 2 * a, 9);

const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  ...whiteEdges.map(([a, b]) => new WhiteDot(a, b)),
  ...blackEdges.map(([a, b]) => new BlackDot(a, b)),
  ...greyEdges.map(([a, b]) => new Or([new WhiteDot(a, b), new BlackDot(a, b)])),

  // Unmarked edges are shifted copies of one template pair each (one
  // template for the horizontal offset, one for the vertical offset).
  graph.makeReplicate(
    new Pair(noDotKey, 'no dot', 'R1C1', 'R1C2'),
    unmarkedHoriz.map(([a]) => a)),
  graph.makeReplicate(
    new Pair(noDotKey, 'no dot', 'R1C1', 'R2C1'),
    unmarkedVert.map(([a]) => a)),
];
