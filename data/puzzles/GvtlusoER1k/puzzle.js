// Title: Noughts and Crosses
// Author: CraigFJ
// Video: https://www.youtube.com/watch?v=GvtlusoER1k
// Source: https://sudokupad.app/6ykv9wd48f

// Normal sudoku (standard 9x9, 3x3 boxes). Each box holds its own 3x3
// noughts-and-crosses grid over its 8 candidate lines (3 rows, 3 columns, 2
// diagonals). A drawn red line is the *only* one of those 8 lines whose three
// cells share parity (all even = Steven's box, all odd = Todd's box).
// Across the 9 boxes (read as their own 3x3 tic-tac-toe grid), exactly one
// "line of 3 boxes" (row/column/diagonal of boxes) has all 3 boxes won by the
// same player. Kropki dots and XV clues are given only where drawn -- absence
// is not informative, so no Strict* variants are used.

// Box 1-9 in reading order. Each entry is the drawn red line's 3 cells, in
// order along the line, as drawn.
const redLines = {
  1: ['R1C3', 'R2C2', 'R3C1'],
  2: ['R3C4', 'R3C5', 'R3C6'],
  3: ['R3C9', 'R2C9', 'R1C9'],
  4: ['R4C1', 'R5C2', 'R6C3'],
  5: ['R4C4', 'R4C5', 'R4C6'],
  6: ['R4C7', 'R5C8', 'R6C9'],
  7: ['R7C3', 'R8C2', 'R9C1'],
  8: ['R7C4', 'R8C5', 'R9C6'],
  9: ['R7C9', 'R8C8', 'R9C7'],
};

// The 8 lines (3 rows, 3 cols, 2 diagonals) of a 3x3 grid of "at" values, in
// reading order. Used both for a box's own 3x3 of cells and, below, for the
// 3x3 meta-grid of boxes itself.
function gridLines(at) {
  const lines = [];
  for (let r = 0; r < 3; r++) lines.push([at(r, 0), at(r, 1), at(r, 2)]);
  for (let c = 0; c < 3; c++) lines.push([at(0, c), at(1, c), at(2, c)]);
  lines.push([at(0, 0), at(1, 1), at(2, 2)]);
  lines.push([at(0, 2), at(1, 1), at(2, 0)]);
  return lines;
}

// graph.box(n) returns the box's 9 cells row-major, so its local (r, c)
// (0-indexed) sits at cells[3r + c].
const graph = cellGraph();
function boxLines(boxIndex) {
  const cells = graph.box(boxIndex);
  return gridLines((r, c) => cells[3 * r + c]);
}

const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));

const sameParityKey = Pair.fnToKey((a, b) => (a % 2) === (b % 2), 9);
const diffParityKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);

// For the drawn line: all 3 cells share parity (chained pairwise -- parity
// only has 2 classes, so a~b and b~c already forces a~c).
// For every other line in the box: NOT all 3 share parity, i.e. at least one
// of the two adjacent pairs differs (Or of the two pairwise inequalities).
function boxLineConstraints(boxIndex) {
  const red = redLines[boxIndex];
  return boxLines(boxIndex).flatMap(([a, b, c]) => {
    if (sameSet([a, b, c], red)) {
      return [
        new Pair(sameParityKey, 'sameParity', a, b),
        new Pair(sameParityKey, 'sameParity', b, c),
      ];
    }
    return [new Or([
      new Pair(diffParityKey, 'diffParity', a, b),
      new Pair(diffParityKey, 'diffParity', b, c),
    ])];
  });
}

// Reading the box's red line's middle cell stands in for the whole line's
// (shared) parity, since boxLineConstraints above already forces all 3 of its
// cells to match.
const boxAnchor = boxIndex => redLines[boxIndex][1];

// The 8 "lines of 3 boxes" over the 3x3 meta-grid of boxes: 3 box-rows, 3
// box-columns, 2 box-diagonals. Boxes are numbered 1-9 in reading order, so
// meta-grid (r, c) (0-indexed) is box number 3r + c + 1.
const metaLines = gridLines((r, c) => 3 * r + c + 1);

// One boolean Var per meta-line: VM1..VM8, restricted to {1 = mismatch,
// 2 = all 3 boxes' winners match}. An NFA below ties each to the real parity
// of its 3 box anchors so the Var can't be set independently of the grid.
const matchVar = new Var('M', 'meta-line winner match', metaLines.length);
const matchCells = matchVar.cells();

// Reads [anchorA, anchorB, anchorC, matchCell]. Tracks the first anchor's
// parity, then whether each later anchor still matches it, saturating to one
// `finalMatch` boolean before reading the match cell; accept iff the match
// cell (2/1) agrees with that boolean.
const metaMatchSpec = NFA.encodeSpec({
  startState: { step: 0 },
  transition: (state, value) => {
    switch (state.step) {
      case 0: return { step: 1, first: value % 2 };
      case 1: return {
        step: 2, first: state.first, partial: (value % 2 === state.first)
      };
      case 2: return {
        step: 3, finalMatch: state.partial && (value % 2 === state.first)
      };
      case 3: return { step: 4, finalMatch: state.finalMatch, matchValue: value };
    }
  },
  accept: (state) =>
    state.step === 4 && state.finalMatch === (state.matchValue === 2),
}, 9);

const metaMatchNFAs = metaLines.map((boxes, i) => new NFA(
  metaMatchSpec, `metaMatch${i + 1}`,
  ...boxes.map(boxAnchor), matchCells[i],
));

return [
  new Shape('9x9'),

  // Kropki dots (only the drawn ones are meaningful; absence is uninformative).
  new WhiteDot('R4C1', 'R4C2'),
  new WhiteDot('R9C6', 'R9C7'),
  new BlackDot('R2C1', 'R2C2'),
  new BlackDot('R5C8', 'R6C8'),

  // XV clues (only the drawn ones are meaningful; absence is uninformative).
  new X('R1C4', 'R1C5'),
  new X('R3C5', 'R3C6'),
  new X('R2C9', 'R3C9'),
  new X('R6C1', 'R6C2'),
  new X('R5C6', 'R6C6'),
  new X('R7C7', 'R7C8'),
  new V('R4C2', 'R4C3'),
  new V('R9C8', 'R9C9'),

  // Per-box: the drawn red line is the unique same-parity line among its 8
  // candidate lines (3 rows, 3 columns, 2 diagonals).
  ...Array.from({ length: 9 }, (_, i) => i + 1).flatMap(boxLineConstraints),

  // Across the 9 boxes' own 3x3 meta-grid, exactly one line of 3 boxes has
  // all 3 boxes won by the same player (their red-line anchors share parity).
  matchVar,
  ...matchCells.map(id => new Given(id, 1, 2)),
  ...metaMatchNFAs,
  new Sum(9, ...matchCells), // 7 mismatches (1) + 1 match (2) = 9: forces exactly one match.
];
