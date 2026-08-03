// Title: Foggy YYSL
// Author: Blobz
// Video: https://www.youtube.com/watch?v=3FQr78x3RrQ
// Source: https://app.crackingthecryptic.com/sudoku/t7hNLh7tBT

// Normal sudoku (default row/column/box all-different; regions are the
// standard 3x3 boxes).
//
// Shading: every cell is one of two colours (Yin-Yang), each colour forming
// exactly one orthogonally-connected region, with no monochrome 2x2 block.
//
// Large circles (Quad): every listed value must appear somewhere in the
// circle's surrounding 2x2 area.
//
// Kropki dots: white = consecutive, black = 2:1 ratio; not all such dots are
// shown. Every drawn dot additionally sits on the Yin-Yang boundary, i.e. its
// two cells carry opposite shades.
//
// Vision-count cages: 20 single-cell, no-total cages. Each such cell's own
// digit equals how many cells of its own shade are visible orthogonally from
// it (including itself), where the opposite shade blocks vision beyond it in
// that direction. A one-cell no-total cage adds no constraint by itself;
// here the cage membership *is* the rule (which cells carry a vision-count
// clue), encoded directly below.
//
// The fog reveal is solving UI only and is not modelled.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// Symmetry break: no rule here (connectivity, no-mono-2x2, dot-opposite,
// vision-count, quads) names an absolute colour, so swapping
// SHADED<->UNSHADED everywhere is always an equally valid completion of any
// solution. Pin one representative -- R1C1 (=firstShade) to SHADED -- which
// narrows nothing about the actual shading, only which of the two
// interchangeable labels the region containing R1C1 gets.
const shadeSymmetryBreak = new Given(firstShade, SHADED);

// No 2x2 block may be all one shade: one NFA on the top-left block,
// replicated to every block origin.
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
}, 9);
const blockOrigins = graph.cells().filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(graph.cells()[0], 2, 2))),
  shade.at(blockOrigins));

// Dots (edge marks; drawn as white fill/black border for a white dot, black
// fill for a black dot).
const WHITE_DOTS = [
  ['R2C7', 'R2C8'], ['R1C2', 'R2C2'], ['R2C3', 'R3C3'], ['R1C5', 'R2C5'],
  ['R3C4', 'R3C5'], ['R1C8', 'R2C8'], ['R2C7', 'R3C7'], ['R3C7', 'R4C7'],
  ['R3C8', 'R4C8'], ['R6C7', 'R6C8'], ['R8C6', 'R8C7'], ['R4C5', 'R4C6'],
  ['R7C3', 'R8C3'], ['R8C1', 'R8C2'], ['R5C2', 'R5C3'], ['R8C3', 'R8C4'],
  ['R8C3', 'R9C3'], ['R9C4', 'R9C5'],
];
const BLACK_DOTS = [
  ['R2C6', 'R2C7'], ['R7C4', 'R7C5'],
];
const ALL_DOTS = [...WHITE_DOTS, ...BLACK_DOTS];

const whiteDots = WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b));
const blackDots = BLACK_DOTS.map(([a, b]) => new BlackDot(a, b));

// "All dots lie on the boundary of the Yin-Yang pattern": every dot's two
// cells carry opposite shades.
const dotShadeDifferences = ALL_DOTS.map(
  ([a, b]) => new AllDifferent(shade.at(a), shade.at(b)));

// Large circles (Quad): two of the three circles show their value plainly
// inside the drawn circle (6, and 2). The third circle, at corner
// R4C7/R4C8/R5C7/R5C8, is blank but has its three values (1, 7, 9) written
// as line-wrapped text centred on that same circle, rather than as extra
// edge marks: those two text overlays are un-bordered and sized to match the
// blank circle exactly, unlike every genuine dot mark in this puzzle.
const QUADS = [
  { topLeft: 'R4C7', values: [1, 7, 9] },
  { topLeft: 'R8C2', values: [6] },
  { topLeft: 'R2C4', values: [2] },
];
const quads = QUADS.map(q => new Quad(q.topLeft, ...q.values));

// Vision-count cage cells (each a single-cell, no-total cage).
const visionCells = [
  'R2C9', 'R9C1', 'R9C2', 'R2C8', 'R2C1', 'R5C2', 'R2C6', 'R5C4', 'R5C5',
  'R6C5', 'R6C4', 'R7C4', 'R7C5', 'R5C8', 'R8C8', 'R9C8', 'R8C1', 'R8C2',
  'R8C3', 'R3C3',
];

// Vision-count cell = Or(shaded-branch, unshaded-branch): one branch fixes
// the cell's own shade via a Given, then an NFA scans its up/down/left/right
// rays (nearest cell first, excluding the cell itself) followed by the
// cell's own grid digit as the final symbol. Branching on shade this way
// (rather than reading it as part of the NFA scan) bakes the target shade
// into the machine as a constant instead of carrying it in every state,
// which keeps each compiled machine small (bare state is just a ray
// position, a running count, and a "blocked" flag).
//
// `count` starts at 1 for the cell itself, then increments once per
// consecutive same-shade ray cell starting from the cell, stopping (without
// decrementing further) the moment a ray cell differs -- that is the "other
// colour blocks vision" rule. The final symbol (the digit) must equal the
// accumulated count. Ray lengths differ per cell and are closed over as
// constants, since each cell gets its own one-off compiled machine (not a
// Replicate).
function visionCountConstraint(cellId) {
  const upRay = graph.ray(cellId, -1, 0).slice(1);
  const downRay = graph.ray(cellId, 1, 0).slice(1);
  const leftRay = graph.ray(cellId, 0, -1).slice(1);
  const rightRay = graph.ray(cellId, 0, 1).slice(1);
  const rayCells = [...upRay, ...downRay, ...leftRay, ...rightRay];

  const Lu = upRay.length, Ld = downRay.length, Ll = leftRay.length;
  // Position (0-indexed, counting ray symbols consumed so far) where each
  // ray starts, to reset "blocked" for the new direction.
  const rayStarts = new Set([0, Lu, Lu + Ld, Lu + Ld + Ll]);
  const digitPos = rayCells.length; // final symbol, after all rays

  function visionForTarget(target) {
    const spec = NFA.encodeSpec({
      startState: { pos: 0, count: 1, blocked: false },
      transition: (state, value) => {
        const { pos, count, blocked } = state;
        if (pos === digitPos) {
          return { pos: pos + 1, done: true, match: value === count };
        }
        let nextBlocked = rayStarts.has(pos) ? false : blocked;
        let nextCount = count;
        if (!nextBlocked) {
          if (value === target) nextCount = Math.min(count + 1, 9);
          else nextBlocked = true;
        }
        return { pos: pos + 1, count: nextCount, blocked: nextBlocked };
      },
      accept: (state) => state.done === true && state.match === true,
      maxDepth: digitPos + 1,
    }, 9);
    return new NFA(spec, `vision-${cellId}-${target}`,
      [...shade.at(rayCells), cellId]);
  }

  return new Or([
    new And([new Given(shade.at(cellId), SHADED), visionForTarget(SHADED)]),
    new And(
      [new Given(shade.at(cellId), UNSHADED), visionForTarget(UNSHADED)]),
  ]);
}

const visionCounts = visionCells.map(visionCountConstraint);

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  shadeSymmetryBreak,
  // Yin-Yang connectivity: each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...whiteDots,
  ...blackDots,
  ...dotShadeDifferences,
  ...quads,
  ...visionCounts,
];
