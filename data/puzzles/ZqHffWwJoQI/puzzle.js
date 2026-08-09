// Title: Yin Yang Arrows
// Author: Schwupel
// Video: https://www.youtube.com/watch?v=ZqHffWwJoQI
// Source: https://app.crackingthecryptic.com/sudoku/JJdp66fnQ7

// Normal sudoku rules apply. A shading (Yin-Yang): shaded cells form one
// orthogonally connected region, unshaded cells form another, and no 2x2
// block is monochrome. Digits on each arrow sum to the digit in its circle
// (standard arrow rule). The circle digit is also equal to the sum of the
// digits of the shaded cells in the straight line beyond the arrow's tip (the
// direction the drawn arrowhead points), starting at the next cell after the
// tip and running to the grid edge -- an unshaded cell in that line
// contributes nothing.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// No 2x2 block may be all shaded or all unshaded: one NFA on the top-left
// block, replicated to every block origin.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// circle: the arrow's bulb cell. arm: the arrow-sum cells (bulb = sum of arm).
// ray: the cells beyond the tip, continuing in the direction the drawn
// arrowhead points (the arm's final segment), to the grid edge.
const arrows = [
  { circle: 'R9C1', arm: ['R8C1', 'R7C2'],
    ray: ['R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7', 'R1C8'] },
  { circle: 'R8C2', arm: ['R9C3', 'R8C3'],
    ray: ['R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3', 'R2C3', 'R1C3'] },
  { circle: 'R9C5', arm: ['R8C4', 'R7C5'],
    ray: ['R6C6', 'R5C7', 'R4C8', 'R3C9'] },
  { circle: 'R9C8', arm: ['R8C9', 'R8C8'],
    ray: ['R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R8C2', 'R8C1'] },
  { circle: 'R6C9', arm: ['R5C9', 'R6C8'],
    ray: ['R7C7', 'R8C6', 'R9C5'] },
  { circle: 'R3C9', arm: ['R2C8', 'R3C7'],
    ray: ['R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'] },
  { circle: 'R1C8', arm: ['R1C7', 'R1C6'],
    ray: ['R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1'] },
  { circle: 'R3C6', arm: ['R4C7', 'R5C8'],
    ray: ['R6C9'] },
  { circle: 'R4C4', arm: ['R3C5', 'R2C5'],
    ray: ['R1C5'] },
  { circle: 'R5C4', arm: ['R4C3', 'R5C2'],
    ray: ['R6C1'] },
  { circle: 'R4C2', arm: ['R3C1', 'R2C1'],
    ray: ['R1C1'] },
  { circle: 'R6C5', arm: ['R6C4', 'R5C3'],
    ray: ['R4C2', 'R3C1'] },
];

const arrowSums = arrows.map(({ circle, arm }) => new Arrow(circle, ...arm));

// Scans [circle, shade(ray0), ray0, shade(ray1), ray1, ...]: the first value
// pins the target; each later (shade, digit) pair adds digit to the running
// total only when that cell's shade equals SHADED. Accept iff, once every
// pair is consumed, the total equals the target -- one shared machine serves
// every arrow regardless of its ray length, since the scan length is fixed
// per NFA call, not tracked in state.
const rayMaskedSumMachine = NFA.encodeSpec({
  startState: { target: null, phase: 'target', pendingShade: null, total: 0 },
  transition: (state, value) => {
    if (state.target === null) {
      return { target: value, phase: 'shade', pendingShade: null, total: 0 };
    }
    if (state.phase === 'shade') {
      return { target: state.target, phase: 'digit', pendingShade: value, total: state.total };
    }
    const add = state.pendingShade === SHADED ? value : 0;
    const total = Math.min(state.total + add, state.target + 1);
    return { target: state.target, phase: 'shade', pendingShade: null, total };
  },
  accept: (state) => state.target !== null && state.phase === 'shade'
    && state.total === state.target,
}, geometry.numValues);
const rayMaskedSums = arrows.map(({ circle, ray }, index) => new NFA(
  rayMaskedSumMachine, `arrow-ray-sum-${index}`,
  circle, ...ray.flatMap(cell => [shade.at(cell), cell]),
));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  // Yin-Yang connectivity: each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...arrowSums,
  ...rayMaskedSums,
];
