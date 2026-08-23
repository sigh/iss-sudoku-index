// Title: Sum-thing or Other
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=jHuWaDdnUvU
// Source: https://sudokupad.app/zgmqhuvf3r

// Full encoding. Normal sudoku, plus: the whole grid is shaded in two
// colours, each colour forming one orthogonally-connected region, with no
// 2x2 block monochrome; and each arrow cell's digit equals the sum of the
// digits of the opposite-shade cells on the ray from the arrow cell to the
// grid edge in the arrow's drawn direction (rays never touching a same-shade
// cell just skip it -- the rule sums by colour, not by contiguous run).

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');

// Compass direction -> (dRow, dCol) step, matching graph.ray()'s convention.
const DIRS = {
  N: [-1, 0], S: [1, 0], E: [0, 1], W: [0, -1],
  NE: [-1, 1], NW: [-1, -1], SE: [1, 1], SW: [1, -1],
};

// Arrow cell + drawn direction, decoded from the small triangular arrow
// icons in the source payload.
const arrows = [
  ['R1C7', 'S'],
  ['R2C1', 'E'],
  ['R2C6', 'SE'],
  ['R2C8', 'W'],
  ['R4C3', 'NE'],
  ['R5C6', 'NE'],
  ['R6C2', 'N'],
  ['R6C3', 'W'],
  ['R6C4', 'SE'],
  ['R6C6', 'NW'],
  ['R6C6', 'E'],
  ['R7C1', 'E'],
  ['R7C3', 'SE'],
  ['R7C8', 'NW'],
  ['R8C7', 'NW'],
  ['R8C7', 'N'],
];

// Building one NFA per arrow that reads the arrow's own shade dynamically
// (to pick which ray cells count) blows the compiled-state limit: the
// compiler must explore all 9 possible values at that read, not just the 2
// the shade Var is actually restricted to. Splitting into the two possible
// arrow-shades up front removes that dimension entirely -- each branch's
// target shade is a fixed value baked into the NFA closure, not a state
// field, so the branch NFA only needs to track a pending-include flag and a
// running (clamped) sum.
//
// For a fixed target arrow-shade, one NFA scans [shade(ray1), digit(ray1),
// ..., shade(rayK), digit(rayK), digit(arrow)], summing the digits of ray
// cells whose shade differs from target, and accepts iff the final read (the
// arrow's own digit) equals that sum. The sum is clamped at 10 once it
// exceeds the maximum possible digit (9), since it can then never match --
// this bounds the compiled state count regardless of ray length.
function raySumNFA(ray, target) {
  const machine = NFA.encodeSpec({
    startState: { sum: 0, remaining: ray.length, pending: null },
    transition: (state, value) => {
      if (state.remaining > 0) {
        if (state.pending === null) {
          // A shade(ray_i) read: collapse immediately to a boolean so the
          // compiler doesn't explore the cell's full (unrestricted) domain.
          return { ...state, pending: value !== target };
        }
        const sum = Math.min(state.sum + (state.pending ? value : 0), 10);
        return { sum, remaining: state.remaining - 1, pending: null };
      }
      // Final read: the arrow cell's own digit.
      return value === state.sum ? { done: true } : undefined;
    },
    accept: (state) => state.done === true,
  }, graph.gridGeometry().numValues);
  return machine;
}

// Arrow cell's digit = sum of opposite-shade ray digits: shade(arrow) fixes
// which of the two per-shade sum machines applies.
function arrowSumConstraint(cell, dirName) {
  const [dR, dC] = DIRS[dirName];
  const ray = graph.ray(cell, dR, dC).slice(1); // exclude the arrow's own cell

  const branches = [SHADED, UNSHADED].map(target => {
    const machine = raySumNFA(ray, target);
    const cellSeq = ray.flatMap(rc => [shade.at(rc), rc]);
    cellSeq.push(cell);
    return new And([
      new Given(shade.at(cell), target),
      new NFA(machine, `arrow-${cell}-${dirName}-${target}`, ...cellSeq),
    ]);
  });

  return new Or(branches);
}

const arrowSums = arrows.map(([cell, dir]) => arrowSumConstraint(cell, dir));

return [
  new Shape('9x9'),
  new YinYang(),
  ...arrowSums,
];
