// Title: Zip Zero
// Author: gdc
// Video: https://www.youtube.com/watch?v=2KFwiaXIaOg
// Source: https://sudokupad.app/iql7m9a36u

// Normal Sudoku, Yin-Yang shading, and all eight zipper paths are encoded.
const SHADED = 1;
const UNSHADED = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

// No 2x2 area is entirely shaded or entirely unshaded.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { values: [] },
  transition: ({ values, done }, value) => {
    if (done) return { done: true };
    const next = [...values, value];
    if (next.length < 4) return { values: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

const zippers = [
  ['R4C8', 'R5C8', 'R6C7'],
  ['R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C8'],
  ['R2C5', 'R1C5', 'R2C6', 'R1C6', 'R2C7', 'R2C8', 'R3C7', 'R4C7', 'R3C6', 'R4C6', 'R4C5'],
  ['R8C3', 'R8C4', 'R7C3', 'R6C2', 'R6C1', 'R5C2', 'R4C3', 'R3C2', 'R2C1', 'R1C2', 'R1C3'],
  ['R5C3', 'R6C3', 'R5C4', 'R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6', 'R6C5'],
  ['R6C4', 'R7C5', 'R8C6'],
  ['R2C4', 'R1C4', 'R1C3'],
  ['R7C8', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R8C7', 'R7C7', 'R6C7'],
];

// For one symmetric pair, scan left shade/digit, centre shade/digit, then
// right shade/digit. It accepts exactly signed(left) + signed(right) =
// signed(centre).
const signedPairMachine = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) {
      return value === SHADED || value === UNSHADED
        ? { phase: 1, leftShade: value } : undefined;
    }
    if (state.phase === 1) return { phase: 2, left: value, leftShade: state.leftShade };
    if (state.phase === 2) {
      return value === SHADED || value === UNSHADED
        ? { phase: 3, left: state.left, leftShade: state.leftShade, centreShade: value }
        : undefined;
    }
    if (state.phase === 3) {
      return { phase: 4, left: state.left, leftShade: state.leftShade, centre: value, centreShade: state.centreShade };
    }
    if (state.phase === 4) {
      return value === SHADED || value === UNSHADED
        ? { phase: 5, left: state.left, leftShade: state.leftShade, centre: state.centre, centreShade: state.centreShade, rightShade: value }
        : undefined;
    }
    if (state.phase === 5) {
      const left = state.leftShade === SHADED ? state.left : -state.left;
      const right = state.rightShade === SHADED ? value : -value;
      const centre = state.centreShade === SHADED ? state.centre : -state.centre;
      return left + right === centre ? { phase: 6 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 6,
}, geometry.numValues);

function signedZipper(path) {
  const centreIndex = Math.floor(path.length / 2);
  const centre = path[centreIndex];
  return path.slice(0, centreIndex).map((left, index) => {
    const right = path[path.length - 1 - index];
    return new NFA(signedPairMachine, 'signed-zipper-pair',
      shade.at(left), left, shade.at(centre), centre, shade.at(right), right);
  });
}

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  // Each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...zippers.flatMap(signedZipper),
];
