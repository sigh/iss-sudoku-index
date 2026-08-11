// Title: Underground Topography
// Author: Nordy
// Video: https://www.youtube.com/watch?v=anNT7RpXlx4
// Source: https://app.crackingthecryptic.com/sudoku/tBpR8Qn727

// Normal sudoku rules apply (default row/column/box AllDifferent from Shape).
// One given: R5C5=1.
//
// Entropy: the low (1,2,3), middle (4,5,6) and high (7,8,9) digits are three
// groups. Every 2x2 window that lies fully inside the drawn cage must contain
// a digit from each group. The rule is scoped to the cage, which excludes the
// four corner 2x2 blocks (R1-2C1-2, R1-2C8-9, R8-9C1-2, R8-9C8-9), so it is
// encoded as one custom NFA per cage-interior 2x2 window rather than a single
// whole-grid entropy rule that would also constrain those excluded corners.
//
// Climbing Ropes: adjacent digits along each orange line must differ by 3 or
// less. No native class expresses a maximum difference (Whisper enforces a
// minimum difference), so each line is a custom Pair predicate applied over
// its ordered path -- Pair(key, name, ...cells) constrains consecutive pairs
// in the given cell list.

const graph = cellGraph();

// Cage cells (the puzzle's only non-stub cage; the other three cage entries
// are metadata stubs for title/author/rules and are not encoded). 65 of the
// 81 cells; the 16 missing cells are the four corner 2x2 blocks.
const cageCells = new Set([
  'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7',
  'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7',
  'R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9',
  'R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9',
  'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9',
  'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9',
  'R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9',
  'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7',
  'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7',
]);

// Every 2x2 window (named by its top-left cell) whose 4 cells are all in the
// cage, computed from cageCells rather than hand-enumerated.
const entropyWindowOrigins = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    const window = [
      makeCellId(r, c), makeCellId(r, c + 1),
      makeCellId(r + 1, c), makeCellId(r + 1, c + 1),
    ];
    if (window.every(id => cageCells.has(id))) {
      entropyWindowOrigins.push(makeCellId(r, c));
    }
  }
}

// State = bitmask of which of the 3 groups (low=bit0, mid=bit1, high=bit2)
// have been seen among the 4 window cells; accept only once all 3 bits are
// set. The predicate is symmetric in the 4 inputs (a bitwise OR), so the scan
// order of the 4 cells does not matter.
const entropySpec = NFA.encodeSpec({
  startState: 0,
  transition: (state, value) => state | (1 << (((value - 1) / 3) | 0)),
  accept: (state) => state === 7,
  maxDepth: 4,
}, 9);
// Template anchored at R1C1 (the graph's origin cell) so Replicate can shift
// it onto every window's top-left corner.
const entropyTemplate = new NFA(
  entropySpec, 'entropy', 'R1C1', 'R1C2', 'R2C1', 'R2C2');
const entropyWindows = graph.makeReplicate(entropyTemplate, entropyWindowOrigins);

// Orange lines (13 drawn strokes, each a polyline of cell-centre waypoints,
// interpolated along straight segments to recover the full cell path). The 13
// strokes are separate drawn entries (a branching network split at its
// branch cells) and together cover 44 adjacent-cell edges with no overlap
// between strokes.
const ropeLines = [
  ['R1C4', 'R1C5', 'R1C6', 'R2C6'],
  ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R4C9', 'R4C8', 'R5C8', 'R6C8'],
  ['R6C7', 'R6C8', 'R6C9'],
  ['R4C7', 'R4C6', 'R5C6', 'R6C6'],
  ['R3C6', 'R3C5', 'R3C4', 'R2C4'],
  ['R4C5', 'R4C4', 'R4C3', 'R4C2', 'R5C2', 'R5C1'],
  ['R4C1', 'R5C1', 'R6C1'],
  ['R5C3', 'R6C3'],
  ['R4C4', 'R5C4', 'R6C4'],
  ['R6C2', 'R6C3', 'R6C4', 'R6C5', 'R7C5'],
  ['R7C6', 'R7C5', 'R7C4', 'R8C4', 'R9C4'],
  ['R8C4', 'R8C5', 'R9C5', 'R9C6', 'R8C6'],
];
const diffAtMost3Key = Pair.fnToKey((a, b) => Math.abs(a - b) <= 3, 9);
const ropes = ropeLines.map(
  (cells, i) => new Pair(diffAtMost3Key, `rope${i}`, ...cells));

return [
  new Shape('9x9'),
  new Given('R5C5', 1),
  entropyWindows,
  ...ropes,
];
