// Title: Let's Go Camping!
// Author: Tey & DhrAbel
// Video: https://www.youtube.com/watch?v=yFQsxC68b60
// Source: https://sudokupad.app/rcxhf1oeo4

// Normal sudoku rules apply.
//
// German whispers: adjacent digits along a green line differ by at least 5
// -> Whisper(5, ...) per drawn line, cell paths hand-transcribed from the
// four separate green strokes. The first two lines share endpoint R8C2 but
// are kept as two separate Whispers: their consecutive-pair edges union to
// the exact same edge set a single merged 7-cell line would produce.
//
// Trees and tents: every digit 5 is a tree; every odd digit orthogonally
// adjacent to a tree is a tent; there are no other trees or tents. Modeled
// with a per-cell flag Var overlay (VT: 1 = not a tent, 2 = tent), pinned to
// {1, 2}, and tied to the digit grid by one NFA per cell reading
// [digit(cell), ...orthogonal neighbour digits, flag(cell)] that accepts
// only the flag value the rule forces (2 iff the digit is odd and some
// neighbour is 5).
//
// The outside number by a row/column is that row/column's tent count,
// hand-transcribed from the drawn outside clues. Encoded per row/column as
// an exact 9-cell multiset over the flags (ContainExact).
//
// Tents may not be adjacent, not even diagonally: a Pair forbidding both
// flags from being 2, replicated over every touching cell pair.
//
// The tents sum to 71: one NFA scanning digit/flag pairs for every grid
// cell, accumulating the sum of digits whose flag is 2 (clamped above the
// target), requiring the final sum to equal 71 exactly.

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VT');
const flag = cell => flags.at(cell);

// Whisper lines, hand-transcribed from the four drawn green strokes.
const whisperLines = [
  ['R8C2', 'R7C1', 'R6C1', 'R5C1', 'R4C2', 'R3C3'],
  ['R8C3', 'R8C2'],
  ['R3C1', 'R2C2', 'R1C3', 'R1C4', 'R1C5', 'R2C6', 'R3C6'],
  ['R5C9', 'R4C9', 'R3C9'],
].map(cells => new Whisper(5, ...cells));

// Row/column tent counts, hand-transcribed from the drawn outside clues.
const rowTentCounts = { 1: 2, 2: 2, 3: 2, 4: 1, 5: 1, 6: 2, 7: 1, 8: 2, 9: 0 };
const colTentCounts = { 1: 3, 2: 0, 3: 4, 4: 0, 5: 1, 6: 2, 7: 1, 8: 0, 9: 2 };

// One NFA per cell tying its flag to its digit and orthogonal-neighbour
// digits. State tracks a step counter (0 = reading the cell's own digit,
// 1..k = reading each neighbour, k+1 = reading the flag), whether the
// cell's own digit is odd, and whether any neighbour seen so far is 5.
function tentFlagSpec(k) {
  return NFA.encodeSpec({
    startState: { step: 0, odd: null, sawTree: false },
    transition: ({ step, odd, sawTree }, value) => {
      if (step === 0) return { step: 1, odd: value % 2 === 1, sawTree: false };
      if (step <= k) return { step: step + 1, odd, sawTree: sawTree || value === 5 };
      // step === k + 1: this is the flag value; check it against the rule.
      const expected = (odd && sawTree) ? 2 : 1;
      return value === expected ? 'accept' : undefined;
    },
    accept: state => state === 'accept',
  }, 9);
}
const tentFlagSpecsByDegree = new Map();
function tentFlagConstraint(cell) {
  const orthoCells = graph.neighbours(cell);
  const k = orthoCells.length;
  if (!tentFlagSpecsByDegree.has(k)) {
    tentFlagSpecsByDegree.set(k, tentFlagSpec(k));
  }
  return new NFA(
    tentFlagSpecsByDegree.get(k), 'tent flag',
    cell, ...orthoCells, flag(cell));
}

// Exact multiset of flag values (`count` 2s, the rest 1s) over one house.
function tentCountConstraint(cells, count) {
  const values = Array(count).fill(2).concat(Array(cells.length - count).fill(1));
  return new ContainExact(values.join('_'), ...flags.at(cells));
}

// No two touching (orthogonally or diagonally) cells may both be tents: one
// Pair template per king-move direction (only the 4 "forward" directions, so
// each touching pair is templated exactly once), replicated over every
// origin that direction stays on-grid from. Replicate's own origin must be
// the template's own first cell, which for the down-left direction is not
// R1C1 (R1C1 has no down-left neighbour), so this builds each Replicate
// directly rather than through the graph's default-R1C1-origin helper.
const noAdjacentTentsKey = Pair.fnToKey((a, b) => !(a === 2 && b === 2), 9);
function touchingPairsTemplate(dR, dC) {
  const originCell = graph.cells().find(cell => graph.step(cell, dR, dC));
  const otherCell = graph.step(originCell, dR, dC);
  const [origin, other] = flags.at([originCell, otherCell]);
  const targets = flags.at(graph.cells().filter(cell => graph.step(cell, dR, dC)));
  return new Replicate(
    [new Pair(noAdjacentTentsKey, 'no adjacent tents', origin, other)],
    Replicate.encodeTargetCells(targets, origin, flags),
    origin);
}
const noAdjacentTents = [
  touchingPairsTemplate(0, 1),   // right
  touchingPairsTemplate(1, 0),   // down
  touchingPairsTemplate(1, 1),   // down-right
  touchingPairsTemplate(1, -1),  // down-left
];

// Sum of digits whose flag is 2, over all 81 cells, must equal 71.
const TENT_SUM_TARGET = 71;
const tentSumSpec = NFA.encodeSpec({
  startState: { pendingDigit: null, sum: 0 },
  transition: ({ pendingDigit, sum }, value) => {
    if (pendingDigit === null) return { pendingDigit: value, sum };
    const add = value === 2 ? pendingDigit : 0;
    return { pendingDigit: null, sum: Math.min(sum + add, TENT_SUM_TARGET + 1) };
  },
  accept: ({ pendingDigit, sum }) => pendingDigit === null && sum === TENT_SUM_TARGET,
}, 9);
const tentSum = new NFA(
  tentSumSpec, 'tent sum',
  ...graph.cells().flatMap(cell => [cell, flag(cell)]));

return [
  new Shape('9x9'),
  ...whisperLines,
  flags.toVar('tent flags'),
  flags.makeReplicate(new Given(flags.cells()[0], 1, 2)),
  ...graph.cells().map(tentFlagConstraint),
  ...graph.rows().map((cells, i) => tentCountConstraint(cells, rowTentCounts[i + 1])),
  ...graph.columns().map((cells, i) => tentCountConstraint(cells, colTentCounts[i + 1])),
  ...noAdjacentTents,
  tentSum,
];
