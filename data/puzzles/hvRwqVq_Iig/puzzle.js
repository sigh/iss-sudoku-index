// Title: Border Sums
// Author: Emre Kolotoglu
// Video: https://www.youtube.com/watch?v=hvRwqVq_Iig
// Source: https://app.crackingthecryptic.com/sudoku/G8r4LHFFBd

// Rules encoded: standard row/column all-different; nine solver-discovered
// orthogonally-connected 9-cell regions, each an all-different set
// (ChaosConstruction, with NoBoxes replacing the fixed 3x3 boxes); and 24
// outside "border sum" clues, each equal to the sum of the two digits either
// side of the FIRST region border met scanning inward from that clue's edge.
// The rules' own worked example (regular-box case: top-of-C6 = R3C6+R4C6,
// bottom-of-C6 = R6C6+R7C6) is reproduced by the scan-order/branch-index
// scheme below and was hand-checked against it.
// No omissions: every outside clue and the region rules are encoded.

const graph = cellGraph('9x9');
// The chaos-construction region-label cell paired with each grid cell; a
// solved CC cell's value is that cell's region label (1..9, the same
// value representation as a digit).
const cc = graph.makeOverlay('CC');

// FirstBorder(len) accepts a length-`len` prefix of region-label cells
// (read in scan order from a clue's edge) iff positions 1..len-1 all share
// one label and position len differs from it -- i.e. the line's first
// region border lies between scan positions (len-1) and len. maxDepth caps
// state creation at `len`, since only len symbols are ever fed to it.
function makeFirstBorderSpec(len) {
  return {
    startState: 'start',
    transition(state, value) {
      if (state === 'start') return { ref: value, count: 1 };
      const { ref, count } = state;
      const nextCount = count + 1;
      if (nextCount < len) {
        if (value !== ref) return undefined;
        return { ref, count: nextCount };
      }
      // nextCount === len: the final symbol must break from ref.
      if (value === ref) return undefined;
      return { ref, count: nextCount, done: true };
    },
    accept: (state) => state !== 'start' && state.done === true,
    maxDepth: len,
  };
}

// One compiled automaton per feasible border-scan-prefix length (3..9
// cells); shared across every clue's branches of that length. A length-2
// prefix is just "these two labels differ", so that branch uses Pair
// instead of a 2-cell NFA.
const firstBorderNFA = {};
for (let len = 3; len <= 9; len++) {
  firstBorderNFA[len] = NFA.encodeSpec(makeFirstBorderSpec(len), 9);
}
const notEqualKey = Pair.fnToKey((a, b) => a !== b, 9);

// The 9 grid cells and 9 paired CC cells of one row/column, ordered from
// the named edge inward (nearest cell first).
function edgeLines(edge, index) {
  if (edge === 'top') return { grid: graph.column(index), cc: cc.column(index) };
  if (edge === 'bottom') {
    return {
      grid: [...graph.column(index)].reverse(),
      cc: [...cc.column(index)].reverse(),
    };
  }
  if (edge === 'left') return { grid: graph.row(index), cc: cc.row(index) };
  if (edge === 'right') {
    return {
      grid: [...graph.row(index)].reverse(),
      cc: [...cc.row(index)].reverse(),
    };
  }
  throw new Error(`unknown edge: ${edge}`);
}

// One outside clue: the true border position i (1..8, between scan
// positions i and i+1) is solver-discovered, so this is an Or over every
// feasible i of And(border-is-exactly-here, the two straddling digits sum
// to target).
function borderSumClue(target, gridLine, ccLine, label) {
  const branches = [];
  for (let i = 1; i <= 8; i++) {
    const len = i + 1;
    const borderCheck = len === 2
      ? new Pair(notEqualKey, `${label}-b${i}`, ccLine[0], ccLine[1])
      : new NFA(firstBorderNFA[len], `${label}-b${i}`, ...ccLine.slice(0, len));
    branches.push(new And([
      borderCheck,
      new Sum(target, gridLine[i - 1], gridLine[i]),
    ]));
  }
  return new Or(branches);
}

// Outside clues, transcribed from the puzzle's edge overlays: [edge, row-or-
// column index, printed sum].
const CLUES = [
  ['top', 1, 3], ['top', 2, 12], ['top', 3, 8], ['top', 4, 13], ['top', 5, 4],
  ['top', 6, 12], ['top', 7, 5], ['top', 8, 10], ['top', 9, 4],
  ['bottom', 1, 3], ['bottom', 3, 10], ['bottom', 4, 12], ['bottom', 5, 3],
  ['bottom', 6, 12], ['bottom', 7, 9], ['bottom', 9, 4],
  ['left', 1, 3], ['left', 2, 12], ['left', 5, 5], ['left', 9, 7],
  ['right', 1, 4], ['right', 2, 10], ['right', 5, 6], ['right', 9, 7],
];

const borderSums = CLUES.map(([edge, index, target]) => {
  const { grid, cc: ccLine } = edgeLines(edge, index);
  return borderSumClue(target, grid, ccLine, `${edge}${index}`);
});

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...borderSums,
];
