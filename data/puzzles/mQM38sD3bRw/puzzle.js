// Title: 8s
// Author: Daniel Buckeldee
// Video: https://www.youtube.com/watch?v=mQM38sD3bRw
// Source: https://sudokupad.app/iccr4xsar2
//
// Normal sudoku rules apply. Divide the shaded cage (a 23-cell outline
// tracing a figure "8") into "lines" of two or more orthogonally connected
// cells (digits may repeat on a line); each cage cell belongs to exactly one
// line, and every line sums to 8. Two lines are already drawn:
// R7C3-R8C3-R8C4 (turning the corner at R8C3) and R8C5-R8C6-R8C7 (straight).
// The remaining 17 cage cells must be divided by the solver into further
// lines. Two small 2-cell cages elsewhere in the grid (R3C1-R4C1,
// R6C9-R7C9) are themselves complete lines by the same rule.
//
// The two drawn lines, and the two small 2-cell cages, are fixed sum-8
// groups (plain Sum). The remaining 17
// cells (a 14-cell cycle -- the two square rings' outline, minus the two
// drawn-line cells -- plus a 1-cell pendant at R6C3 and a 2-cell pendant
// path R6C7-R7C7) get a label overlay VL, one Var per grid cell: values
// 1-8 name a discovered line, value 9 ("OUT") marks a cell outside this
// remainder partition. Domain 1-9 needs no widening because at most
// floor(17/2)=8 lines can fit in 17 cells.
//
// - ConnectedValues(VL, k) for k=1..8: each label's cells (if any) form one
//   connected region; an unused label is vacuously satisfied (per
//   unknown-graphs.md), which is exactly right since the true number of
//   lines is unknown -- this bounds the count at "<=8 lines", which is all
//   that is needed since the true count is not otherwise constrained.
// - Per-cell same-label degree in {1,2}: an NFA reads a remainder cell's
//   label then each real grid neighbour's label and accepts iff exactly 1
//   or 2 neighbours share the cell's own label. This excludes branching
//   (>=3 same-label neighbours, only reachable at the two degree-3 join
//   cells R5C3 and R5C7, where a pendant meets the ring) and excludes
//   singleton lines (0 same-label neighbours, which would leave a 1-cell
//   "line"). Connected (via ConnectedValues) + a degree sequence of all
//   1s-and-2s with at least one endpoint forces a simple path for every
//   label actually used (the cHi8yZVepgQ argument, adapted per-label).
//   A closed loop (all degree exactly 2, no endpoint) is not separately
//   excluded by the degree rule alone, but is impossible here regardless:
//   the remainder graph's only cycle is the full 14-cell ring, whose
//   minimum possible sum is 14 (every digit >=1), so it can never total
//   exactly 8 -- no explicit loop-exclusion machinery is needed.
// - Per-label sum: one NFA per label k=1..8, scanning (digit, label) pairs
//   over the 17 remainder cells in row-major order, accumulating the sum
//   of digits where label==k. Accepts iff that sum is 0 (label unused) or
//   exactly 8.
// - Label-permutation symmetry: with N interchangeable line labels, a
//   discovered partition into N lines could be numbered N! ways, which
//   would multiply the apparent solution count without changing any grid
//   digit. Broken by a canonical-order NFA: scanning the 17 remainder
//   cells in row-major order, a label value may only be <= 1 + the
//   maximum label seen so far, i.e. labels must first appear (in row-major
//   order) as 1, 2, 3, .... This is pure bookkeeping over which internal
//   number names which discovered line: for any genuine partition, exactly
//   one relabelling satisfies it, so it never rejects a genuine digit-grid
//   solution or partition shape -- it only picks the one canonical
//   numbering among the N! equivalent labellings.
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

const label = graph.makeOverlay('VL');
const labelCell = cell => label.at(cell);

// --- Givens.
const givenConstraints = [
  new Given('R2C8', 8),
  new Given('R3C5', 8),
  new Given('R5C8', 7),
  new Given('R6C6', 4),
  new Given('R7C4', 4),
];

const OUT = 9;
const MAX_LABEL = 8;

// --- The two already-drawn lines inside the big cage: fixed sum-8 groups.
const line1 = ['R7C3', 'R8C3', 'R8C4'];
const line2 = ['R8C5', 'R8C6', 'R8C7'];
// --- The two small 2-cell cages elsewhere in the grid are themselves
// complete lines by the same rule (each sums to 8).
const fixedLineConstraints = [
  new Sum(8, ...line1),
  new Sum(8, ...line2),
  new Sum(8, 'R3C1', 'R4C1'),
  new Sum(8, 'R6C9', 'R7C9'),
];

function rowMajor(cells) {
  return [...cells].sort((a, b) => {
    const A = parseCellId(a);
    const B = parseCellId(b);
    return A.row - B.row || A.col - B.col;
  });
}

// --- The rest of the cage: 17 cells the solver must divide into lines.
const remainder = rowMajor([
  'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7',
  'R3C3', 'R3C7',
  'R4C3', 'R4C7',
  'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7',
  'R6C3', 'R6C7',
  'R7C7',
]);
const remainderSet = new Set(remainder);

// --- Domain: remainder cells take a line label 1..MAX_LABEL; every other
// cell (non-cage cells, and the two fixed-line cells) is OUT.
const labelValues = Array.from({ length: MAX_LABEL }, (_, i) => i + 1);

// Each domain is one Given repeated over a set of label cells, so it is written
// once as a template and stamped onto the set by Replicate (the label overlay
// locates the cells).
const stampDomain = (cells, values) => {
  const targets = cells.map(labelCell);
  return new Replicate(
    [new Given(targets[0], ...values)],
    Replicate.encodeTargetCells(targets, targets[0], label),
    targets[0]);
};

const domainConstraints = [
  stampDomain(remainder, labelValues),
  stampDomain(graph.cells().filter(cell => !remainderSet.has(cell)), [OUT]),
];

// --- Each used label's cells form one connected region (unused = vacuous).
const connectedConstraints = labelValues.map(k => new ConnectedValues('VL', k));

// --- Same-label degree in {1,2}: excludes branching and singleton lines.
const degreeMachine = NFA.encodeSpec({
  startState: { self: null, count: 0 },
  transition: ({ self, count }, value) => {
    if (self === null) return { self: value, count: 0 };
    const next = count + (value === self ? 1 : 0);
    return next > 2 ? undefined : { self, count: next };
  },
  accept: ({ count }) => count === 1 || count === 2,
}, geometry.numValues);
const degreeConstraints = remainder.map(cell =>
  new NFA(degreeMachine, 'line-degree',
    labelCell(cell), ...graph.neighbours(cell).map(labelCell))
);

// --- Per-label sum: cells sharing label k sum to exactly 8 (0 if unused).
// Reads (digit, label) pairs over the 17 remainder cells.
function labelSumSpec(k) {
  return NFA.encodeSpec({
    startState: { phase: 'digit', sum: 0 },
    transition: (state, value) => {
      if (state.phase === 'digit') {
        return { phase: 'label', sum: state.sum, pendingDigit: value };
      }
      const next = state.sum + (value === k ? state.pendingDigit : 0);
      return next > 8 ? undefined : { phase: 'digit', sum: next };
    },
    accept: ({ phase, sum }) => phase === 'digit' && (sum === 0 || sum === 8),
  }, geometry.numValues);
}
const labelSumConstraints = labelValues.map(k =>
  new NFA(labelSumSpec(k), `label-${k}-sum`,
    ...remainder.flatMap(cell => [cell, labelCell(cell)]))
);

// --- Canonical label order: breaks label-permutation symmetry by requiring
// labels to first appear (in row-major order) as 1, 2, 3, ... .
const canonicalOrderMachine = NFA.encodeSpec({
  startState: { maxSeen: 0 },
  transition: ({ maxSeen }, value) => {
    if (value <= maxSeen) return { maxSeen };
    if (value === maxSeen + 1) return { maxSeen: value };
    return undefined;
  },
  accept: () => true,
}, geometry.numValues);
const canonicalOrderConstraint = new NFA(canonicalOrderMachine, 'label-canonical-order', ...remainder.map(labelCell));

return [
  new Shape('9x9'),
  label.toVar('cage line label'),
  ...givenConstraints,
  ...fixedLineConstraints,
  ...domainConstraints,
  ...connectedConstraints,
  ...degreeConstraints,
  ...labelSumConstraints,
  canonicalOrderConstraint,
];
