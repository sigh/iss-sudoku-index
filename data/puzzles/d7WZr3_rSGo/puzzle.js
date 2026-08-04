// Title: A Different Kind of Magic
// Author: Myxo
// Video: https://www.youtube.com/watch?v=d7WZr3_rSGo
// Source: https://app.crackingthecryptic.com/sudoku/TMLnFRh86r

// Rules encoded: normal sudoku over rows, columns and the drawn thick-outlined
// (jigsaw) regions. A white dot between two cells means the two digits differ
// by the printed number; a black dot means one digit is the printed multiple
// of the other. Every one of the nine 3x3 blocks is a Magic Square: its three
// rows, three columns and two length-3 diagonals all share one total, and
// (per the rules text) digits may repeat within a Magic Square, so the block
// gets no all-different constraint of its own -- only the jigsaw regions
// carry the "all 9 digits once" requirement.
//
// Three short black strokes hug the outer grid border (e.g. along the top
// edge, from the grid corner to a point just past the first interior
// column line). Each exactly retraces a fragment of a jigsaw region's own
// outline and is not referenced anywhere in the rules text, so it reads as
// decorative outline reinforcement, not a drawn clue -- omitted.

const jigsawRegions = [
  // The nine drawn jigsaw pieces that carry the "once per region" sudoku
  // constraint.
  ['R5C2', 'R6C2', 'R6C3', 'R7C2', 'R7C3', 'R7C4', 'R8C2', 'R8C4', 'R8C5'],
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C3'],
  ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],
  ['R2C8', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R2C2', 'R2C4', 'R2C5', 'R3C2', 'R3C3', 'R3C4', 'R4C4', 'R4C5', 'R4C6'],
  ['R2C6', 'R2C7', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R4C7', 'R4C8', 'R5C7'],
  ['R5C5', 'R5C6', 'R5C8', 'R6C6', 'R6C7', 'R6C8', 'R7C7', 'R7C8', 'R8C7'],
  ['R8C3', 'R8C8', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'],
  ['R4C2', 'R4C3', 'R5C3', 'R5C4', 'R6C4', 'R6C5', 'R7C5', 'R7C6', 'R8C6'],
];

// Magic Square blocks: the drawn thick-bordered blocks are the standard 3x3
// box tiling (no printed total, digits may repeat). Build each block's 3
// rows, 3 columns and 2 diagonals from that fixed tiling rather than
// hand-listing them.
const magicSquares = [];
for (let br = 0; br < 3; br++) {
  for (let bc = 0; bc < 3; bc++) {
    const cell = (dr, dc) => makeCellId(3 * br + 1 + dr, 3 * bc + 1 + dc);
    const rows = [0, 1, 2].map(dr => [0, 1, 2].map(dc => cell(dr, dc)));
    const cols = [0, 1, 2].map(dc => [0, 1, 2].map(dr => cell(dr, dc)));
    const diagA = [0, 1, 2].map(i => cell(i, i));
    const diagB = [0, 1, 2].map(i => cell(i, 2 - i));
    magicSquares.push(new EqualSum(...rows, ...cols, diagA, diagB));
  }
}

// Dot pairs: each drawn dot is printed with its own number -- white for
// difference, black for ratio -- not the fixed 1/2 of a standard Kropki
// dot, so each ratio dot and each non-consecutive difference dot needs a
// custom Pair keyed on its printed number. A printed difference of 1 is
// exactly the native WhiteDot's "consecutive" relation.
function memoizeKey(fn) {
  const cache = new Map();
  return (k) => {
    if (!cache.has(k)) cache.set(k, fn(k));
    return cache.get(k);
  };
}
const diffKey = memoizeKey((k) => Pair.fnToKey((a, b) => Math.abs(a - b) === k, 9));
const ratioKey = memoizeKey((k) => Pair.fnToKey((a, b) => a === b * k || b === a * k, 9));

const whiteDots = [
  // Drawn dot between R1C2 and R1C3, printed "2".
  ['R1C2', 'R1C3', 2],
  // Drawn dot between R1C7 and R1C8, printed "4".
  ['R1C7', 'R1C8', 4],
  // Drawn dot between R3C9 and R4C9, printed "3".
  ['R3C9', 'R4C9', 3],
  // Drawn dot between R3C1 and R4C1, printed "4".
  ['R3C1', 'R4C1', 4],
  // Drawn dot between R8C3 and R8C4, printed "5".
  ['R8C3', 'R8C4', 5],
  // Drawn dot between R8C6 and R8C7, printed "4".
  ['R8C6', 'R8C7', 4],
  // Drawn dot between R6C5 and R7C5, printed "1".
  ['R6C5', 'R7C5', 1],
];

const blackDots = [
  // Drawn dot between R3C6 and R3C7, printed "3".
  ['R3C6', 'R3C7', 3],
  // Drawn dot between R3C3 and R3C4, printed "3".
  ['R3C3', 'R3C4', 3],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...jigsawRegions.map(cells => new Jigsaw('9x9', ...cells)),
  ...magicSquares,
  ...whiteDots.map(([a, b, k]) => k === 1
    ? new WhiteDot(a, b)
    : new Pair(diffKey(k), `diff ${k}`, a, b)),
  ...blackDots.map(([a, b, k]) => new Pair(ratioKey(k), `ratio ${k}`, a, b)),
];
