// Title: Kropki's Revenge
// Author: Dolev Sacher
// Video: https://www.youtube.com/watch?v=0du5Z3UbUGM
// Source: https://app.crackingthecryptic.com/sudoku/NFh8rDr86h

// Normal sudoku rules apply. A black dot between two orthogonally adjacent
// cells means the digits have a ratio of 1:3 (not the standard Kropki 1:2);
// a white dot means the digits differ by 2 (not the standard 1). A grey dot
// means the pair is one of those two relations -- encoded here as
// Or(white, black). "All dots are provided" is exhaustive over all three
// colours: every orthogonally adjacent pair carrying no dot of any colour is
// neither a ratio-1:3 pair nor a difference-of-2 pair. Since the ratio/
// difference values are non-standard, the custom `Pair` relations below are
// used throughout instead of the built-in `WhiteDot`/`BlackDot` classes.

// Edge endpoints below are transcribed from the payload's overlay list,
// keyed by each overlay's backgroundColor: white (#FFFFFF), grey (#CFCFCF),
// black (#000000).

const whiteEdges = [
  ['R3C1', 'R3C2'], ['R5C6', 'R5C7'],
];

const blackEdges = [
  ['R7C8', 'R7C9'],
];

const greyEdges = [
  ['R9C7', 'R9C8'], ['R9C6', 'R9C7'], ['R8C7', 'R8C8'], ['R6C8', 'R7C8'],
  ['R8C5', 'R8C6'], ['R8C4', 'R8C5'], ['R8C4', 'R9C4'], ['R9C3', 'R9C4'],
  ['R9C2', 'R9C3'], ['R7C3', 'R8C3'], ['R6C3', 'R7C3'], ['R6C2', 'R7C2'],
  ['R6C1', 'R6C2'], ['R5C1', 'R5C2'], ['R4C2', 'R5C2'], ['R5C2', 'R5C3'],
  ['R1C1', 'R2C1'], ['R1C2', 'R1C3'], ['R2C3', 'R3C3'], ['R3C3', 'R3C4'],
  ['R2C4', 'R2C5'], ['R3C5', 'R4C5'], ['R4C4', 'R5C4'], ['R4C5', 'R5C5'],
  ['R5C5', 'R5C6'], ['R6C3', 'R6C4'], ['R6C4', 'R6C5'], ['R4C7', 'R5C7'],
  ['R5C7', 'R5C8'], ['R4C8', 'R4C9'], ['R3C9', 'R4C9'], ['R2C7', 'R2C8'],
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
  [...whiteEdges, ...blackEdges, ...greyEdges].map(markedKey));
const unmarkedEdges = allAdjacentPairs().filter(p => !marked.has(markedKey(p)));
// Split by offset (same row = horizontal, same column = vertical): the two
// unmarked-edge templates below each have a fixed offset, so each needs its
// own Replicate group.
const unmarkedHoriz = unmarkedEdges.filter(([a, b]) => a[1] === b[1]); // row digit equal
const unmarkedVert = unmarkedEdges.filter(([a, b]) => a[1] !== b[1]);

// Custom relations: 1:3 ratio (black) and difference of 2 (white).
const whiteKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 2, 9);
const blackKey = Pair.fnToKey((a, b) => a === 3 * b || b === 3 * a, 9);
// "All dots are provided": neither relation holds across an unmarked edge.
const noDotKey = Pair.fnToKey(
  (a, b) => Math.abs(a - b) !== 2 && a !== 3 * b && b !== 3 * a, 9);

const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  ...whiteEdges.map(([a, b]) => new Pair(whiteKey, 'white', a, b)),
  ...blackEdges.map(([a, b]) => new Pair(blackKey, 'black', a, b)),
  ...greyEdges.map(([a, b]) => new Or([
    new Pair(whiteKey, 'white', a, b),
    new Pair(blackKey, 'black', a, b),
  ])),

  // Unmarked edges are shifted copies of one template pair each (one
  // template for the horizontal offset, one for the vertical offset).
  graph.makeReplicate(
    new Pair(noDotKey, 'no dot', 'R1C1', 'R1C2'),
    unmarkedHoriz.map(([a]) => a)),
  graph.makeReplicate(
    new Pair(noDotKey, 'no dot', 'R1C1', 'R2C1'),
    unmarkedVert.map(([a]) => a)),
];
