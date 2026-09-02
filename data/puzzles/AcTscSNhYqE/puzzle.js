// Title: Read Between The Lines
// Author: tallcat
// Video: https://www.youtube.com/watch?v=AcTscSNhYqE
// Source: https://app.crackingthecryptic.com/sudoku/mqBfrp8gGh

// Rules encoded here:
//   Normal sudoku rules apply. Circles represent one end of a "Between Line".
//   Circle digits give the length of the rest of the line including line cells
//   and the other endpoint (eg 3 = 2 line cells + the other endpoint cell).
//   Other endpoints are not circled digits. Line digits must have a value
//   between the two endpoint digits. Lines may only move orthogonally, cannot
//   cross or share endpoints. All Between Lines have at least one line cell.
//   Endpoints of the same Between Line may not be in orthogonally adjacent
//   cells.
//
// No line is drawn: the twelve circles are the only marks, so the twelve lines
// themselves are what the solver must find. Each circle is one endpoint of its
// own line; "other endpoints are not circled digits" makes the twelve circles
// twelve distinct lines, and makes a circled cell unavailable to any other
// line (which also satisfies "cannot cross or share endpoints", since the
// lines are cell-disjoint by construction below).
//
// Nothing is omitted. Four Var overlays, one cell each, carry the discovered
// geometry:
//   VC  shape code: which of the cell's four edges the line through it uses
//       (OFF, one of four single-edge endpoint codes, one of six two-edge
//       through codes).
//   VL  which line owns the cell (1 = none, 2..13 = the twelve circles in the
//       order listed in `circles`).
//   VQ  countdown: cells remaining from here to the far endpoint inclusive, so
//       the far endpoint is 1 and the circle is (circle digit + 1). 11 = off.
//   VA  the digit of this line's circled endpoint. 10 = off.
//   VB  the digit of this line's far endpoint. 10 = off.
// VA and VB let each line cell compare its own digit against both endpoint
// digits without dereferencing a solver-chosen cell: both are carried to every
// cell of the line by the equality machine on each used edge.

const DIR_STEPS = [[-1, 0], [0, 1], [1, 0], [0, -1]];  // N, E, S, W
const OPPOSITE = [2, 3, 0, 1];
// The six unordered direction pairs, one per two-edge (through) code.
const THROUGH_PAIRS = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];

const CODE_OFF = 1;             // VC: cell carries no line
const CODE_END_BASE = 2;        // VC 2..5:  endpoint, using edge N/E/S/W
const CODE_THROUGH_BASE = 6;    // VC 6..11: through, using THROUGH_PAIRS[i]
const NUM_CODES = 11;
const codeDirs = (code) => {
  if (code === CODE_OFF || code > NUM_CODES) return [];
  if (code < CODE_THROUGH_BASE) return [code - CODE_END_BASE];
  return THROUGH_PAIRS[code - CODE_THROUGH_BASE];
};
const isEndCode = (code) =>
  code >= CODE_END_BASE && code < CODE_THROUGH_BASE;

const LABEL_NONE = 1;           // VL: cell is on no line
const Q_OFF = 11;               // VQ sentinel for a cell on no line
const V_OFF = 10;               // VA/VB sentinel for a cell on no line
const MAX_Q = 10;               // longest line: circle digit 9 plus the circle

// VL needs 13 states (no line, plus one per circle), the widest overlay.
const shape = new Shape('9x9', 13);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const numValues = geometry.numValues;

const code = graph.makeOverlay('VC');
const label = graph.makeOverlay('VL');
const countdown = graph.makeOverlay('VQ');
const anchorDigit = graph.makeOverlay('VA');
const farDigit = graph.makeOverlay('VB');

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// --- Drawn data -----------------------------------------------------------
// The six given digits, and the twelve white circles, read from the puzzle's
// underlays in payload order; that order fixes each circle's VL label below.
const givens = [
  new Given('R1C1', 5), new Given('R5C5', 2), new Given('R5C9', 4),
  new Given('R6C9', 9), new Given('R7C7', 1), new Given('R8C5', 5),
];
const circles = [
  'R1C1', 'R1C2', 'R2C2', 'R1C5', 'R2C5', 'R4C1',
  'R6C1', 'R9C1', 'R8C6', 'R9C8', 'R4C9', 'R5C5',
];
const circleLabel = new Map(circles.map((cell, i) => [cell, i + 2]));
const isCircle = (cell) => circleLabel.has(cell);

// Direction indices that stay on the grid, per cell.
const dirsAt = (cell) => DIR_STEPS
  .map(([dR, dC], dir) => (graph.step(cell, dR, dC) ? dir : null))
  .filter(dir => dir !== null);

// --- Domains --------------------------------------------------------------
// The grid keeps its true 1-9 digits; the alphabet is widened only for VL.
const digitDomain = graph.makeReplicate(
  new Given(gridCells[0], ...range(1, 9)));
const overlayDomains = [
  countdown.makeReplicate(new Given(countdown.cells()[0], ...range(1, Q_OFF))),
  anchorDigit.makeReplicate(new Given(anchorDigit.cells()[0], ...range(1, V_OFF))),
  farDigit.makeReplicate(new Given(farDigit.cells()[0], ...range(1, V_OFF))),
];
// A line may not leave the grid, so a cell may only use edges it actually has.
const codeDomains = gridCells.map(cell => {
  const dirs = dirsAt(cell);
  const codes = range(1, NUM_CODES)
    .filter(c => codeDirs(c).every(dir => dirs.includes(dir)));
  return new Given(code.at(cell), ...(isCircle(cell)
    ? codes.filter(isEndCode)   // a circle is an endpoint of its own line
    : codes));
});

// --- The circles ----------------------------------------------------------
// "All Between Lines have at least one line cell": the circle digit counts the
// line cells plus the far endpoint, so it is at least 2.
const circleDigits = circles.map(cell => new Given(cell, ...range(2, 9)));
const circleLabels = circles.map(cell =>
  new Given(label.at(cell), circleLabel.get(cell)));
// VA at the circle is the circle's own digit; VQ counts the whole line, which
// is the circle digit (the rest of the line) plus the circle itself.
const successorKey = Pair.fnToKey((digit, q) => q === digit + 1, shape);
const circleAnchors = circles.flatMap(cell => [
  new SameValues(2, cell, anchorDigit.at(cell)),
  new Pair(successorKey, 'line-length', cell, countdown.at(cell)),
]);
// "Endpoints of the same Between Line may not be in orthogonally adjacent
// cells": a far endpoint is a non-circled cell whose code uses one edge, so no
// neighbour of a circle may carry this line's label with an endpoint code.
const endpointSpacing = circles.flatMap(cell => {
  const key = Pair.fnToKey(
    (l, c) => !(l === circleLabel.get(cell) && isEndCode(c)), shape);
  return graph.neighbours(cell).map(other =>
    new Pair(key, 'ends-apart', label.at(other), code.at(other)));
});

// --- Edge agreement -------------------------------------------------------
// Two orthogonally adjacent cells must agree about the edge they share.
const agreementKeys = DIR_STEPS.map((_, dir) => Pair.fnToKey(
  (a, b) => codeDirs(a).includes(dir) === codeDirs(b).includes(OPPOSITE[dir]),
  shape));
// Each unordered pair once: east and south steps only.
const orderedPairs = gridCells.flatMap(cell => [1, 2]
  .map(dir => [dir, graph.step(cell, ...DIR_STEPS[dir])])
  .filter(([, other]) => other)
  .map(([dir, other]) => ({ cell, other, dir })));
// One template per direction, stamped onto every cell that has that neighbour.
const edgeAgreement = [1, 2].map(dir => {
  const origin = gridCells[0];
  const template = new Pair(agreementKeys[dir], 'edge-agree',
    code.at(origin), code.at(graph.step(origin, ...DIR_STEPS[dir])));
  const targets = orderedPairs
    .filter(pair => pair.dir === dir)
    .map(pair => code.at(pair.cell));
  return code.makeReplicate(template, targets);
});

// --- What a used edge carries ---------------------------------------------
// Cells joined by a used edge are on the same line, so they agree on the line
// label and on both of its endpoint digits. Reads the two shape codes, then
// the two labels, the two VA and the two VB; when the shared edge is unused
// the remaining six values are skipped.
const shareMachines = DIR_STEPS.map((_, dir) => NFA.encodeSpec({
  startState: { phase: 'codeA' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'codeA':
        return { phase: 'codeB', used: codeDirs(value).includes(dir) };
      case 'codeB':
        return state.used && codeDirs(value).includes(OPPOSITE[dir])
          ? { phase: 'first', left: 3 }
          : { phase: 'skip', left: 6 };
      case 'skip':
        return state.left > 1
          ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
      // The three (VL, VA, VB) pairs are checked with one pair of states.
      case 'first':
        return { phase: 'second', left: state.left, value };
      case 'second':
        if (value !== state.value) return undefined;
        return state.left > 1
          ? { phase: 'first', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, numValues));
const edgeCarries = orderedPairs.map(({ cell, other, dir }) =>
  new NFA(shareMachines[dir], 'edge-carries',
    code.at(cell), code.at(other),
    label.at(cell), label.at(other),
    anchorDigit.at(cell), anchorDigit.at(other),
    farDigit.at(cell), farDigit.at(other)));

// --- The countdown decreases away from the circle -------------------------
// Every line cell except the circle has a used edge to a cell whose VQ is one
// greater. VQ is bounded, so following those edges from any line cell strictly
// increases VQ and must stop at a circle - which is what makes each line one
// connected path running back to its own circle, with no free-floating loop or
// second component, and what forces its cell count to the circle's VQ.
// Reads this cell's code and VQ, then the VQ of each in-grid neighbour in
// N/E/S/W order; `used` records which of those neighbours the code connects to.
const parentMachine = (dirs) => NFA.encodeSpec({
  startState: { phase: 'code' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'code': {
        if (value === CODE_OFF) return { phase: 'skip', left: 1 + dirs.length };
        const used = dirs.map(dir => codeDirs(value).includes(dir));
        return { phase: 'q', used };
      }
      case 'skip':
        return state.left > 1
          ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
      case 'q':
        if (value > MAX_Q) return undefined;
        return { phase: 'scan', used: state.used, idx: 0, q: value };
      case 'scan': {
        const idx = state.idx + 1;
        const found = state.used[state.idx] && value === state.q + 1;
        if (found) {
          return idx === state.used.length
            ? { phase: 'done' } : { phase: 'skip', left: state.used.length - idx };
        }
        // Nothing left that could be the parent.
        if (!state.used.slice(idx).some(Boolean)) return undefined;
        return { phase: 'scan', used: state.used, idx, q: state.q };
      }
    }
  },
  accept: ({ phase }) => phase === 'done',
}, numValues);
const parentMachines = new Map();
const countdownParents = gridCells
  .filter(cell => !isCircle(cell))
  .map(cell => {
    const dirs = dirsAt(cell);
    const key = dirs.join(',');
    if (!parentMachines.has(key)) parentMachines.set(key, parentMachine(dirs));
    return new NFA(parentMachines.get(key), 'countdown-parent',
      code.at(cell), countdown.at(cell),
      ...dirs.map(dir => countdown.at(graph.step(cell, ...DIR_STEPS[dir]))));
  });

// --- What each cell's digit must satisfy ----------------------------------
// Reads VC, VQ, VL, VA, VB and then the digit. Three cases by shape code:
// off the lines everything is pinned to its sentinel; a one-edge code on an
// uncircled cell is a far endpoint, so it is the line's VB and is the end of
// the countdown; a two-edge code is a line cell, strictly between the two
// endpoint digits. Circled cells are excluded - a circle is an endpoint, and
// its VQ and VA are fixed by the pairs above.
const cellMachine = NFA.encodeSpec({
  startState: { phase: 'code' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'code':
        if (value === CODE_OFF) return { phase: 'offQ' };
        if (value > NUM_CODES) return undefined;
        return isEndCode(value) ? { phase: 'endQ' } : { phase: 'midQ' };
      case 'offQ': return value === Q_OFF ? { phase: 'offL' } : undefined;
      case 'offL': return value === LABEL_NONE ? { phase: 'offA' } : undefined;
      case 'offA': return value === V_OFF ? { phase: 'offB' } : undefined;
      case 'offB': return value === V_OFF ? { phase: 'offD' } : undefined;
      case 'offD': return { phase: 'done' };  // the digit is unconstrained
      case 'endQ': return value === 1 ? { phase: 'endL' } : undefined;
      case 'endL': return value === LABEL_NONE ? undefined : { phase: 'endA' };
      case 'endA': return value > 9 ? undefined : { phase: 'endB' };
      case 'endB': return value > 9 ? undefined : { phase: 'endD', far: value };
      case 'endD': return value === state.far ? { phase: 'done' } : undefined;
      case 'midQ':
        return value < 2 || value > MAX_Q ? undefined : { phase: 'midL' };
      case 'midL': return value === LABEL_NONE ? undefined : { phase: 'midA' };
      case 'midA': return value > 9 ? undefined : { phase: 'midB', near: value };
      case 'midB':
        return value > 9 ? undefined : { phase: 'midD', near: state.near, far: value };
      case 'midD': {
        const lo = Math.min(state.near, state.far);
        const hi = Math.max(state.near, state.far);
        return value > lo && value < hi ? { phase: 'done' } : undefined;
      }
    }
  },
  accept: ({ phase }) => phase === 'done',
}, numValues);
const cellRules = gridCells
  .filter(cell => !isCircle(cell))
  .map(cell => new NFA(cellMachine, 'line-cell',
    code.at(cell), countdown.at(cell), label.at(cell),
    anchorDigit.at(cell), farDigit.at(cell), cell));

return [
  shape,
  code.toVar('code'),
  label.toVar('line'),
  countdown.toVar('countdown'),
  anchorDigit.toVar('circle-digit'),
  farDigit.toVar('far-digit'),
  digitDomain,
  ...overlayDomains,
  ...codeDomains,
  ...givens,
  ...circleDigits,
  ...circleLabels,
  ...circleAnchors,
  ...endpointSpacing,
  ...edgeAgreement,
  ...edgeCarries,
  ...countdownParents,
  ...cellRules,
];
