// Title: Antithesis
// Author: Agent
// Video: https://www.youtube.com/watch?v=vTmjvRqa1uo
// Source: https://app.crackingthecryptic.com/sudoku/bm7dTjjBRb

// Normal sudoku. Shade some cells such that shaded cells form one
// orthogonally-connected region and unshaded cells form another; no 2x2
// block is entirely shaded or entirely unshaded. Cage digits are distinct
// and sum to the printed total, but a shaded cell in the cage counts as its
// negative: total = sum(unshaded cage digits) - sum(shaded cage digits).
//
// Shading is the native YinYang constraint. Swapping every cell's shade
// flips the sign of every non-zero cage total, so this puzzle has no shade-
// relabeling symmetry and needs no canonicalizing pin. Each cage keeps its
// own AllDifferent plus one NFA that reads the cage's cells as interleaved
// (digit, shade) pairs and accepts only when the signed running total
// equals the printed (already-signed) total.

const SHADED = 1, UNSHADED = 2;
const DIGIT_VALUES = 9;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');
const shadeOf = cell => shade.at(cell);

// Cages: [total, ...cells]. Each total is that cage's own printed clue
// (already signed); cells transcribed from the puzzle's drawn cage geometry.
const cages = [
  [-34, 'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R3C1'],
  [6, 'R1C4', 'R1C5', 'R2C4'],
  [16, 'R2C5', 'R2C6', 'R3C6'],
  [22, 'R2C3', 'R3C2', 'R3C3', 'R3C4', 'R4C3'],
  [-10, 'R4C1', 'R4C2'],
  [-20, 'R3C7', 'R3C8', 'R3C9', 'R4C9'],
  [-4, 'R5C3', 'R5C4', 'R6C4'],
  [0, 'R4C6', 'R4C7', 'R5C6', 'R5C7'],
  [-8, 'R4C8', 'R5C8'],
  [-15, 'R5C9', 'R6C7', 'R6C8', 'R6C9'],
  [17, 'R7C9', 'R8C9', 'R9C9'],
  [10, 'R8C4', 'R8C5', 'R8C6'],
  [-23, 'R6C3', 'R7C3', 'R7C4', 'R8C2', 'R8C3'],
  [13, 'R6C1', 'R6C2', 'R7C2'],
];

// Reads a cage's cells as interleaved (digit, shade) pairs and accumulates
// the signed running sum: a digit is added while UNSHADED, subtracted while
// SHADED. `pending` carries a cell's digit between its own digit-read and
// its following shade-read; accept only once every pair has been read and
// the final sum equals the (already-signed) printed target.
function signedCageTotal(target, cells) {
  // maxDepth bounds compile-time state exploration to exactly this cage's
  // read count (a digit read then a shade read per cell); without it the
  // running `sum` field looks unbounded to the compiler (nothing stops it
  // exploring ever-longer synthetic sequences) and the NFA build blows the
  // compile-time state cap.
  const maxDepth = cells.length * 2;
  const spec = NFA.encodeSpec({
    startState: { expectDigit: true, pending: null, sum: 0 },
    transition: (state, value) => {
      if (state.expectDigit) {
        return { expectDigit: false, pending: value, sum: state.sum };
      }
      // Only SHADED/UNSHADED are ever real shade values; reject any other
      // read explicitly instead of letting it fall through to a branch,
      // which would otherwise double the reachable-state count per step.
      if (value !== SHADED && value !== UNSHADED) return undefined;
      const contribution = value === UNSHADED ? state.pending : -state.pending;
      return { expectDigit: true, pending: null, sum: state.sum + contribution };
    },
    accept: (state) => state.expectDigit === true && state.sum === target,
    maxDepth,
  }, DIGIT_VALUES);
  return new NFA(
    spec, 'signed-cage-total',
    ...cells.flatMap(cell => [cell, shadeOf(cell)]));
}

const cageConstraints = cages.flatMap(([total, ...cells]) => [
  new AllDifferent(...cells),
  signedCageTotal(total, cells),
]);

return [
  new Shape('9x9'),
  new YinYang(),

  ...cageConstraints,
];
