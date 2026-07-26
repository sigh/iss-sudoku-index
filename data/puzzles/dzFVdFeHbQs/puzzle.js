// Title: SET
// Author: ICHTUES
// Video: https://www.youtube.com/watch?v=dzFVdFeHbQs
// Source: https://sudokupad.app/929l9v2qt5

// Rules encoded: normal sudoku; both marked diagonals no-repeat; 3 arrows
// (circle = sum of arm cells); disjoint groups (same box-relative position
// differs across boxes); and a SET rule over each box's 3 rows and 3 columns
// (defined below, next to the SET machine that enforces it).

const graph = cellGraph('9x9');

// --- Arrows. Cited from the payload's `arrow`/`circle` arrays: each entry's
// `cells` is the circle, and `lines[0]` is [circle, ...arm cells] in path
// order. Arrow() takes the bulb/circle cell first, then the arm cells.
const arrows = [
  new Arrow('R1C1', 'R1C2', 'R1C3'),
  new Arrow('R9C9', 'R8C8', 'R7C7'),
  new Arrow('R1C9', 'R2C8', 'R3C7', 'R4C6'),
];

// --- SET rule. entropy: low/med/high band of a digit; modularity: digit % 3.
// A SET is 3 digits whose entropies are all-same-or-all-different AND whose
// modularities are (independently) all-same-or-all-different.
const entropyOf = v => Math.floor((v - 1) / 3);
const modularityOf = v => v % 3;
const allSameOrAllDifferent = (a, b, c) =>
  (a === b && b === c) || (a !== b && b !== c && a !== c);

// State = the (entropy, modularity) pairs seen so far, in scan order; accept
// checks both attributes over the completed triple. The predicate is
// symmetric in its 3 inputs, so scan order doesn't affect the result.
// maxDepth caps state creation at the triple's length (every use below is a
// 3-cell NFA) -- without it "seen" grows without bound and never saturates.
const setSpec = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen }, value) =>
    ({ seen: [...seen, [entropyOf(value), modularityOf(value)]] }),
  accept: ({ seen }) => {
    const entropies = seen.map(([e]) => e);
    const modularities = seen.map(([, m]) => m);
    return allSameOrAllDifferent(...entropies)
      && allSameOrAllDifferent(...modularities);
  },
  maxDepth: 3,
}, 9);

// Each box's 3 rows and 3 columns must form a SET. Template each pattern over
// box 1 (R1C1's box) and Replicate it: rowTargets/colTargets are every
// row/column start of every box (a box's cells in row-major order, so indices
// 0/3/6 are its 3 row-starts and 0/1/2 are its 3 column-starts), so shifting
// the box-1 template onto them reproduces the same relation for every box's
// rows and every box's columns.
const boxes = graph.boxes();
const rowTargets = boxes.flatMap(box => [box[0], box[3], box[6]]);
const colTargets = boxes.flatMap(box => [box[0], box[1], box[2]]);
const setRows = graph.makeReplicate(
  new NFA(setSpec, 'set-row', 'R1C1', 'R1C2', 'R1C3'),
  rowTargets);
const setCols = graph.makeReplicate(
  new NFA(setSpec, 'set-col', 'R1C1', 'R2C1', 'R3C1'),
  colTargets);

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  new DisjointSets(),
  ...arrows,
  setRows,
  setCols,
];
