// Title: Binary Trees
// Author: Azvaril
// Video: https://www.youtube.com/watch?v=ayI5jTti2CQ
// Source: https://sudokupad.app/02n5l1x503

// Rules encoded here (nothing is omitted):
//  - Normal sudoku, which is ISS's default.
//  - The circles and silver lines draw two binary trees. One is a min tree
//    (every parent is smaller than its children), the other a max tree
//    (every parent is larger); which is which is for the solver to decide.
//  - Digits on a tree do not repeat.
//  - Black Kropki dots: one of the two digits is twice the other. All
//    possible black dots are given, so every unmarked orthogonal pair must
//    fail the 2:1 ratio. The rules mention no white dots, so unmarked pairs
//    are otherwise unrestricted (which is why StrictKropki, whose negative
//    also bans consecutive pairs, is not used).

// Tree edges, parent first. Transcribed from the eight silver entries of the
// "lines" array together with the 18 circle overlays, which mark the nodes.
//
// Two of the strokes run diagonally through circles that are not their own
// end points: the stroke leaving R2C5 for R4C8 passes exactly through the
// centre of the circle at R3C7, and the stroke leaving R5C5 for R8C1 passes
// exactly through the centres of the circles at R6C3 and R7C2. Those circles
// are therefore nodes along those strokes, and with them every circle is
// joined into exactly two connected trees of nine cells each -- as the rules
// require ("binary trees", plural, one min and one max).
//
// Parent/child orientation is read off the drawing: within each tree every
// drawn edge descends exactly one row, giving a four-row hierarchy whose top
// cell (R2C5, R5C5 -- the two circles drawn slightly larger than the rest) is
// the root, and in which every non-leaf node has exactly two children, as
// "binary tree" requires.
const treeEdges = [
  [
    ['R2C5', 'R3C3'], ['R2C5', 'R3C7'],
    ['R3C3', 'R4C2'], ['R3C3', 'R4C4'],
    ['R3C7', 'R4C6'], ['R3C7', 'R4C8'],
    ['R4C2', 'R5C1'], ['R4C2', 'R5C3'],
  ],
  [
    ['R5C5', 'R6C3'], ['R5C5', 'R6C7'],
    ['R6C3', 'R7C2'], ['R6C3', 'R7C4'],
    ['R6C7', 'R7C6'], ['R6C7', 'R7C8'],
    ['R7C2', 'R8C1'], ['R7C2', 'R8C3'],
  ],
];

const treeCells = (edges) => [...new Set(edges.flat())];

// A two-cell Thermo(a, b) is just a < b (GreaterThan is unusable here: it is
// the inequality-sudoku clue and only binds orthogonally adjacent cells).
const asMinTree = (edges) => edges.map(([p, c]) => new Thermo(p, c));
const asMaxTree = (edges) => edges.map(([p, c]) => new Thermo(c, p));

const [topTree, bottomTree] = treeEdges;
const minMaxAssignment = new Or([
  new And([...asMinTree(topTree), ...asMaxTree(bottomTree)]),
  new And([...asMaxTree(topTree), ...asMinTree(bottomTree)]),
]);

// Black dots, transcribed from the edge-centred filled marks in the
// "overlays" array.
const blackDotPairs = [
  ['R5C3', 'R6C3'], ['R7C6', 'R8C6'], ['R1C1', 'R1C2'], ['R2C8', 'R2C9'],
  ['R3C2', 'R3C3'], ['R5C2', 'R5C3'], ['R7C1', 'R7C2'], ['R3C5', 'R4C5'],
  ['R6C5', 'R7C5'], ['R8C7', 'R9C7'], ['R1C8', 'R2C8'], ['R1C9', 'R2C9'],
  ['R4C9', 'R5C9'], ['R8C9', 'R9C9'], ['R6C5', 'R6C6'],
];
const dottedKeys = new Set(blackDotPairs.map(([a, b]) => [a, b].sort().join('-')));
const isDotted = (a, b) => dottedKeys.has([a, b].sort().join('-'));

const graph = cellGraph('9x9');
const notRatioKey = Pair.fnToKey((a, b) => a !== b * 2 && b !== a * 2, 9);
const notRatioTemplate = (origin, other) => [new Pair(notRatioKey, '', origin, other)];

// The undotted pairs are two shifted copies (horizontal, vertical) of the same
// two-cell template, so they are Replicated rather than stamped out one by one.
const undottedKropki = [
  graph.makeReplicate(
    notRatioTemplate('R1C1', 'R1C2'),
    graph.cells().filter(c => graph.step(c, 0, 1) && !isDotted(c, graph.step(c, 0, 1)))),
  graph.makeReplicate(
    notRatioTemplate('R1C1', 'R2C1'),
    graph.cells().filter(c => graph.step(c, 1, 0) && !isDotted(c, graph.step(c, 1, 0)))),
];

return [
  new Shape('9x9'),
  ...treeEdges.map(edges => new AllDifferent(...treeCells(edges))),
  minMaxAssignment,
  ...blackDotPairs.map(([a, b]) => new BlackDot(a, b)),
  ...undottedKropki,
];
