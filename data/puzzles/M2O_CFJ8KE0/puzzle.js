// Title: I'll Cry If I Want To
// Author: FullDeck and Missing a Few Cards
// Video: https://www.youtube.com/watch?v=M2O_CFJ8KE0
// Source: https://app.crackingthecryptic.com/sudoku/N9TnrTD43m

// Normal sudoku rules apply; regions are the standard 3x3 boxes.
//
// Modular lines (drawn, deepskyblue): Modular(3, ...cells). The source splits
// one drawn stroke into two entries sharing endpoint R6C3
// (R5C5-R5C4-R6C3 and R6C2-R6C3, same colour/thickness, one continuous
// connected path); it is encoded here as the single line
// R5C5-R5C4-R6C3-R6C2, not two.
//
// X-Sum outside clues: sum of the first X digits (X = the first digit seen
// from the clue) equals the given total -- XSum.fromCells.
//
// "In addition to any modular lines revealed as the fog lifts, every X-sum
// forms a hidden straight modular line at least X cells long starting from
// the cell closest to the clue": a lower bound on length, so its exact
// content is that the first X cells in that direction satisfy the
// modular-line property among themselves -- a length-X modular run is
// itself a witness "at least X cells long", and any longer witness would
// still make that same prefix modular, so this is what the sentence asserts,
// not an approximation of something longer. One NFA per X-sum clue reads the
// full row/column from the clue inward: the first digit fixes X (state
// field `x`), then every window of 3 cells that lies entirely within the
// first X positions must show three distinct residues mod 3 (state fields
// `i`, `prev1`, `prev2` track position and the last two residues); the
// machine moves to a no-op `done` phase once position reaches X (or
// immediately if X <= 2, since no 3-window can fit in a 1- or 2-cell prefix),
// since the rule says nothing about cells past position X.
// Fog is solving UI, not a final-grid rule, and is not encoded.
//
// "Digits separated by a black dot are in a 1:2 ratio. ALL black dots are
// given": no dots are drawn anywhere in the source, so the "all given"
// clause is the operative half -- every orthogonally adjacent pair in the
// grid is a place a dot *could* have been drawn and was not, so no such
// pair may hold a 1:2 ratio (one value double the other). Two Replicate
// stamps (rightward and downward templates anchored at R1C1, the graph's
// origin cell) cover every horizontal and vertical grid edge with the
// negated relation (StrictKropki asserts the same for both dot colours at
// once, which would also forbid consecutive pairs -- a rule this puzzle
// never states).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const modularLines = [
  ['R1C3', 'R2C3', 'R3C3'],
  ['R3C6', 'R4C6', 'R5C6'],
  ['R6C9', 'R7C9', 'R8C9'],
  ['R9C2', 'R9C3', 'R9C4'],
  ['R4C9', 'R3C9', 'R2C9', 'R1C9'],
  ['R5C5', 'R5C4', 'R6C3', 'R6C2'],
  ['R8C6', 'R8C7', 'R8C8'],
];

// [total, cell closest to the clue, direction into the grid]
const xsumClues = [
  [26, 'R1C5', 1, 0],
  [27, 'R1C1', 0, 1],
  [24, 'R3C9', 0, -1],
  [25, 'R6C9', 0, -1],
];

// Two-cell templates anchored at R1C1 (the graph's origin), replicated onto
// every cell with a right/down in-grid neighbour to cover all edges.
const noBlackDotKey = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);
const rightTemplate = new Pair(noBlackDotKey, 'no-black-dot', 'R1C1', 'R1C2');
const downTemplate = new Pair(noBlackDotKey, 'no-black-dot', 'R1C1', 'R2C1');
const rightTargets = graph.cells().filter(c => graph.step(c, 0, 1));
const downTargets = graph.cells().filter(c => graph.step(c, 1, 0));

const hiddenModularSpec = NFA.encodeSpec({
  startState: { phase: 'init' },

  transition: (state, value) => {
    if (state.phase === 'init') {
      // First cell fixes X. A prefix of length <= 2 has no 3-window to check.
      if (value <= 2) return { phase: 'done' };
      return { phase: 'scan', x: value, i: 1, prev2: null, prev1: value % 3 };
    }
    if (state.phase === 'done') return { phase: 'done' };

    const { x, i, prev2, prev1 } = state;
    const r = value % 3;
    const newI = i + 1;
    if (newI >= 3 && (prev2 === prev1 || prev2 === r || prev1 === r)) {
      return undefined;
    }
    if (newI >= x) return { phase: 'done' };
    return { phase: 'scan', x, i: newI, prev2: prev1, prev1: r };
  },

  accept: () => true,
  maxDepth: 9,
}, 9);

return [
  new Shape('9x9'),

  ...modularLines.map(cells => new Modular(3, ...cells)),

  ...xsumClues.map(([total, start, dR, dC]) =>
    XSum.fromCells(total, graph.ray(start, dR, dC), geometry)),

  ...xsumClues.map(([, start, dR, dC], idx) =>
    new NFA(hiddenModularSpec, 'hiddenmod' + idx, ...graph.ray(start, dR, dC))),

  graph.makeReplicate(rightTemplate, rightTargets),
  graph.makeReplicate(downTemplate, downTargets),
];
