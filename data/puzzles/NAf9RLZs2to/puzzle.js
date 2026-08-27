// Title: Galaxies Collide (Again!)
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=NAf9RLZs2to
// Source: https://sudokupad.app/yporyghx5a

// Standard sudoku. The grid is split into two galaxies -- an unknown 2-way
// cell partition, each part orthogonally connected, no 2x2 box entirely one
// part, and both parts invariant under 180-degree rotation about the centre.
// A green-circled cell's own digit counts how many cells of its box share its
// own galaxy (including itself); a red-squared cell's own digit counts how
// many do not. One (solver-determined) galaxy is additionally "special": for
// every orthogonally adjacent pair of cells that are both in that galaxy, one
// digit divides the other. A drawn spiral/border motif over the whole grid is
// decoration for the "galaxy" theme, not a rule, and is not encoded.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('YY');

// Provenance: cells under the green (#8dee76) circles and red (#f92121)
// squares drawn on the board.
const greenCells = ['R5C5', 'R4C1', 'R5C8', 'R2C5', 'R3C3', 'R1C7', 'R9C9', 'R7C1'];
const redCells = ['R5C3', 'R8C5', 'R9C1'];

const boxOfCell = (cellId) => {
  const { row, col } = parseCellId(cellId);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1;
};

// Reads [ownDigit, ownShade, otherShade x8] for the 9 cells of one box, in an
// order that puts the clue's own cell first so its shade is known before the
// other 8 are compared to it. `mode` picks which comparison to tally:
// 'same' (green: cells sharing the clue's own shade) or 'diff' (red: cells
// that do not).
const isShade = (v) => v === SHADED || v === UNSHADED;
const boxGalaxyCountNFA = (mode) => NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'own', target: value };
    if (state.phase === 'own') {
      if (!isShade(value)) return undefined; // YY cells only ever hold these two values
      const initial = mode === 'same' ? 1 : 0; // the clue cell vs itself
      return { phase: 'scan', target: state.target, own: value, count: initial, remaining: 8 };
    }
    if (state.phase === 'scan') {
      if (!isShade(value)) return undefined;
      const match = mode === 'same' ? value === state.own : value !== state.own;
      const count = state.count + (match ? 1 : 0);
      const remaining = state.remaining - 1;
      if (remaining === 0) return { phase: 'done', target: state.target, count };
      return { phase: 'scan', target: state.target, own: state.own, count, remaining };
    }
    return undefined; // phase 'done': no further symbols expected
  },
  accept: (state) => state.phase === 'done' && state.count === state.target,
}, geometry.numValues);
const sameGalaxyCount = boxGalaxyCountNFA('same');
const diffGalaxyCount = boxGalaxyCountNFA('diff');

const boxCountRule = (cellId, nfa, label) => {
  const box = graph.box(boxOfCell(cellId));
  const others = box.filter((c) => c !== cellId);
  return new NFA(nfa, label, cellId, shade.at(cellId), ...shade.at(others));
};

const greenRules = greenCells.map((c) => boxCountRule(c, sameGalaxyCount, 'galaxy-green'));
const redRules = redCells.map((c) => boxCountRule(c, diffGalaxyCount, 'galaxy-red'));

// 180-degree symmetry: every cell and its rotational antipode share a shade.
// (Symmetry of one galaxy forces the same symmetry on its complement, so one
// equality per antipodal pair covers "both galaxies must be symmetrical".)
const symmetrySeen = new Set();
const symmetryRules = [];
for (const cell of graph.cells()) {
  const { row, col } = parseCellId(cell);
  const antipode = makeCellId(10 - row, 10 - col);
  if (antipode === cell || symmetrySeen.has(cell)) continue;
  symmetrySeen.add(cell);
  symmetrySeen.add(antipode);
  symmetryRules.push(new SameValues(2, shade.at(cell), shade.at(antipode)));
}

// Special-galaxy ratio rule. Reads [shadeA, digitA, shadeB, digitB] for one
// orthogonal edge; only constrains the pair when both cells carry
// `targetShade`, in which case one digit must divide the other.
const ratioEdgeNFA = (targetShade) => NFA.encodeSpec({
  startState: { phase: 'shadeA' },
  transition: (state, value) => {
    if (state.phase === 'shadeA') {
      if (!isShade(value)) return undefined;
      return { phase: 'digitA', shadeA: value };
    }
    if (state.phase === 'digitA') return { phase: 'shadeB', shadeA: state.shadeA, digitA: value };
    if (state.phase === 'shadeB') {
      if (!isShade(value)) return undefined;
      return { phase: 'digitB', shadeA: state.shadeA, digitA: state.digitA, shadeB: value };
    }
    const digitB = value;
    const bothSpecial = state.shadeA === targetShade && state.shadeB === targetShade;
    const ok = !bothSpecial || state.digitA % digitB === 0 || digitB % state.digitA === 0;
    return ok ? { done: true } : undefined;
  },
  accept: (state) => state.done === true,
}, geometry.numValues);

const edges = graph.cells().flatMap((cell) => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  return [...(right ? [[cell, right]] : []), ...(down ? [[cell, down]] : [])];
});

const ratioBranch = (targetShade) => {
  const nfa = ratioEdgeNFA(targetShade);
  return new And(edges.map(
    ([a, b]) => new NFA(nfa, 'galaxy-ratio', shade.at(a), a, shade.at(b), b)));
};
// Which galaxy is "special" is not stated -- either one may be, so this is a
// genuine disjunction, not a symmetry to pin away.
const specialGalaxyRule = new Or([ratioBranch(SHADED), ratioBranch(UNSHADED)]);

return [
  new Shape('9x9'),
  new YinYang(),
  // Every rule above speaks only of "its own galaxy" or "the special one" --
  // never an absolute shade -- so swapping SHADED/UNSHADED everywhere is a
  // relabelling of the same two galaxies, not a different solution. Pin
  // R1C1's shade to break that relabelling symmetry (an artifact of this
  // encoding, not a puzzle rule).
  new Given(shade.at('R1C1'), SHADED),
  ...greenRules,
  ...redRules,
  ...symmetryRules,
  specialGalaxyRule,
];
