// Title: 3 Snakes 2 Puzzles
// Author: the_cogito
// Video: https://www.youtube.com/watch?v=P7WXcJVJRpE
// Source: https://app.crackingthecryptic.com/sudoku/N9BtFhRG4L

// Rules encoded here:
//  - Every row and column holds each digit 1-9 once. No box constraint is
//    stated, so boxes are dropped (NoBoxes) and digits may repeat in a box.
//  - The grid is partitioned into exactly 3 "snakes": non-empty, orthogonally
//    connected, non-branching (max 2 same-snake orthogonal neighbours), open
//    paths (exactly 2 cells of degree 1, the rest degree 2 -- see below) that
//    jointly cover every cell.
//  - A snake may not touch itself, even diagonally (see the pinch machine).
//  - The black dot between R1C1 and R1C2: a 2:1 digit ratio.
//  - Grey circles at R4C4 and R9C9: odd digits.
//  - The 5 drawn thick borders mark cell pairs known to sit in different
//    snakes: R1C1|R2C1, R8C9|R9C9, R1C8|R1C9, R9C1|R9C2, R5C4|R5C5.
//  - Orthogonally adjacent cells of the same snake differ by exactly 4 or 5.
//
// "Path", not "loop": a closed cycle is excluded, so each snake has exactly
// two degree-1 endpoint cells.
//
// "Even diagonally" cannot mean "no two non-consecutive same-snake cells are
// diagonally adjacent" taken completely literally: a single 90-degree turn's
// flanking cells are always diagonally adjacent to each other (e.g. a step
// right then a step down puts the start and end cells corner-to-corner), so
// that reading forbids every turn. Three all-straight snakes cover at most
// 27 cells (3 x the 9-cell grid span), never the 81 the rules require, so
// the fully-literal reading is unsatisfiable and is not a live candidate.
// The reading encoded instead is the standard "no diagonal pinch": a same-
// snake diagonal pair is only legal when one of the block's other two
// corners also carries that snake's label, i.e. the pair is the two arms of
// an actual turn rather than two unconnected strands touching at a point.

const SNAKES = [1, 2, 3];
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Snake-label overlay: every cell holds which of the 3 snakes it belongs to.
const snakeOverlay = graph.makeOverlay('VN');
const snakeCells = snakeOverlay.cells();
const label = cell => snakeOverlay.at(cell);

// Degree overlay: each cell's count of orthogonal same-label neighbours (1 or
// 2 -- see below, a size-1 snake is excluded by the endpoint-count rule so
// degree 0 never legally occurs).
const degOverlay = graph.makeOverlay('VG');
const deg = cell => degOverlay.at(cell);

// In row-major order, a label may first appear only after every smaller
// label has appeared. Pure symmetry break over the 3! relabellings; chooses
// no path.
const canonicalLabelsMachine = NFA.encodeSpec({
  startState: { largestIntroduced: 0 },
  transition: ({ largestIntroduced }, value) => {
    if (value <= largestIntroduced) return { largestIntroduced };
    return value === largestIntroduced + 1
      ? { largestIntroduced: value }
      : undefined;
  },
  accept: ({ largestIntroduced }) => largestIntroduced === SNAKES.length,
}, geometry.numValues);

// No-branching + degree read-out: reads [selfLabel, ...neighbourLabels,
// selfDegree]. Rejects mid-scan once a 3rd same-label neighbour appears (no
// branching), then requires the trailing degree value to equal the same-
// label neighbour count actually seen. One compiled machine per distinct
// neighbour count (corner=2, edge=3, interior=4).
const degreeSpecCache = new Map();
function degreeSpec(k) {
  if (degreeSpecCache.has(k)) return degreeSpecCache.get(k);
  const spec = NFA.encodeSpec({
    startState: { phase: 'self' },
    transition: (state, value) => {
      if (state.phase === 'self') {
        return { phase: 'neighbour', selfLabel: value, same: 0, remaining: k };
      }
      if (state.phase === 'neighbour') {
        const same = state.same + (value === state.selfLabel ? 1 : 0);
        if (same > 2) return undefined;
        const remaining = state.remaining - 1;
        return remaining > 0
          ? { phase: 'neighbour', selfLabel: state.selfLabel, same, remaining }
          : { phase: 'degree', same };
      }
      return value === state.same ? { phase: 'done' } : undefined;
    },
    accept: state => state.phase === 'done',
  }, geometry.numValues);
  degreeSpecCache.set(k, spec);
  return spec;
}
const degreeConstraints = gridCells.map(cell => {
  const neighbours = graph.neighbours(cell);
  return new NFA(degreeSpec(neighbours.length), 'snake degree',
    label(cell), ...snakeOverlay.at(neighbours), deg(cell));
});

// Open-path rule: each label has exactly 2 degree-1 (endpoint) cells. Scans
// one fixed [label, degree] sequence over the whole grid per target label,
// counting cells that match both; a closed loop has zero such cells.
function endpointCountSpec(target) {
  return NFA.encodeSpec({
    startState: { phase: 'label', count: 0 },
    transition: (state, value) => {
      if (state.phase === 'label') {
        return { phase: 'degree', count: state.count, matchLabel: value === target };
      }
      const hit = state.matchLabel && value === 1;
      const count = state.count + (hit ? 1 : 0);
      return count > 2 ? undefined : { phase: 'label', count };
    },
    accept: state => state.phase === 'label' && state.count === 2,
  }, geometry.numValues);
}
const labelDegreeSequence = gridCells.flatMap(cell => [label(cell), deg(cell)]);
const endpointCountConstraints = SNAKES.map(target =>
  new NFA(endpointCountSpec(target), 'snake has exactly 2 ends', ...labelDegreeSequence));

// No diagonal pinch (see header note): reads a 2x2 block [TL, TR, BL, BR] and
// rejects a same-label diagonal pair unless the alternate diagonal's cells
// include that label too (the turn's own connecting cell).
const pinchSpec = NFA.encodeSpec({
  startState: { phase: 'tl' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'tl': return { phase: 'tr', tl: value };
      case 'tr': return { phase: 'bl', tl: state.tl, tr: value };
      case 'bl': return { phase: 'br', tl: state.tl, tr: state.tr, bl: value };
      case 'br': {
        const br = value;
        const diag1Ok = state.tl !== br || state.tr === state.tl || state.bl === state.tl;
        const diag2Ok = state.tr !== state.bl || state.tl === state.tr || br === state.tr;
        return diag1Ok && diag2Ok ? { phase: 'done' } : undefined;
      }
      default: return undefined;
    }
  },
  accept: state => state.phase === 'done',
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const pinchConstraint = snakeOverlay.makeReplicate(
  new NFA(pinchSpec, 'no diagonal pinch',
    ...snakeOverlay.at(graph.block(gridCells[0], 2, 2))),
  snakeOverlay.at(blockOrigins));

// Snake step difference: reads [labelA, digitA, labelB, digitB] for every
// orthogonal edge. Same-label orthogonal adjacency is always a path step (the
// degree cap above rules out any other same-label orthogonal touch), so this
// covers "adjacent cells along the same snake" without separately tracking
// path order.
const stepDiffSpec = NFA.encodeSpec({
  startState: { phase: 'aLabel' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aLabel': return { phase: 'aDigit', aLabel: value };
      case 'aDigit': return { phase: 'bLabel', aLabel: state.aLabel, aDigit: value };
      case 'bLabel': return { phase: 'bDigit', aLabel: state.aLabel, aDigit: state.aDigit, bLabel: value };
      case 'bDigit': {
        const diff = Math.abs(state.aDigit - value);
        const ok = state.aLabel !== state.bLabel || diff === 4 || diff === 5;
        return ok ? { phase: 'done' } : undefined;
      }
      default: return undefined;
    }
  },
  accept: state => state.phase === 'done',
}, geometry.numValues);
const stepDiffConstraints = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new NFA(stepDiffSpec, 'snake step difference',
    label(cell), cell, label(other), other)));

// Thick borders (drawn cell-pair provenance in the header comment above):
// each pair is known to lie in two different snakes -- a two-cell
// all-different over their labels.
const thickBorders = [
  ['R1C1', 'R2C1'], ['R8C9', 'R9C9'], ['R1C8', 'R1C9'],
  ['R9C1', 'R9C2'], ['R5C4', 'R5C5'],
].map(([a, b]) => new AllDifferent(...snakeOverlay.at([a, b])));

return [
  new Shape('9x9'),
  new NoBoxes(),

  snakeOverlay.toVar('snake label'),
  snakeOverlay.makeReplicate(new Given(snakeCells[0], ...SNAKES)),
  degOverlay.toVar('snake degree'),
  degOverlay.makeReplicate(new Given(degOverlay.cells()[0], 1, 2)),

  new NFA(canonicalLabelsMachine, 'canonical snake labels', ...snakeCells),
  ...SNAKES.map(l => new ConnectedValues('VN', l)),
  ...degreeConstraints,
  ...endpointCountConstraints,
  pinchConstraint,
  ...thickBorders,
  ...stepDiffConstraints,

  new BlackDot('R1C1', 'R1C2'),
  new Given('R4C4', 1, 3, 5, 7, 9),
  new Given('R9C9', 1, 3, 5, 7, 9),
];
