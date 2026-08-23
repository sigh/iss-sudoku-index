// Title: YYSL Arrows
// Author: Blobz
// Video: https://www.youtube.com/watch?v=ctZUK0LvACw
// Source: https://sudokupad.app/blobz/yysl-arrows

// Normal sudoku (default row/column/box all-different; regions are the
// standard 3x3 boxes).
//
// Shading: every cell is one of two colours, each colour forming exactly one
// orthogonally-connected region, with no monochrome 2x2 block.
//
// Vision-count cages: 25 single-cell, no-total cages.
// Each such cell's own digit equals how many cells of its own shade are
// visible orthogonally from it (including itself), where the opposite shade
// blocks vision beyond it in that direction. A one-cell no-total cage adds no
// constraint by itself; here the cage membership *is* the rule (which cells
// carry a vision-count clue), encoded directly below.
//
// Arrows: digits along the arm sum to the bulb (circled) cell's digit.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');

// Symmetry break: no rule (connectivity, no-mono-2x2, or vision-count) names
// an absolute colour, so swapping SHADED<->UNSHADED everywhere is always an
// equally valid completion of any solution. Pin one representative: R1C1
// is fixed to SHADED. This narrows nothing about the puzzle's actual shading
// -- both regions' shapes stay exactly as forced by the other rules -- it
// only names which of the two interchangeable labels the region containing
// R1C1 gets.
const shadeSymmetryBreak = new Given(shade.at('R1C1'), SHADED);

// Arrows: [bulb, ...arm].
const arrows = [
  ['R1C8', 'R1C9', 'R2C9', 'R2C8'],
  ['R1C6', 'R2C6', 'R3C6', 'R3C5'],
  ['R9C7', 'R9C8', 'R9C9', 'R8C9'],
  ['R5C2', 'R5C1', 'R6C2'],
];
const arrowConstraints = arrows.map(cells => new Arrow(...cells));

// Vision-count cage cells (each a single-cell, no-total cage).
const visionCells = [
  'R3C4', 'R2C6', 'R2C7', 'R3C7', 'R3C9', 'R4C8', 'R4C9', 'R5C9', 'R5C8',
  'R7C7', 'R9C7', 'R9C8', 'R9C9', 'R8C9', 'R9C5', 'R8C4', 'R7C3', 'R8C3',
  'R9C3', 'R8C2', 'R7C2', 'R5C3', 'R4C2', 'R4C1', 'R5C4',
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
  new YinYang(),
  shadeSymmetryBreak,
  ...arrowConstraints,
  ...visionCounts,
];
