// Title: Sept. 16, 2022: Consec. Quads
// Author: clover!
// Video: https://www.youtube.com/watch?v=tSRzvfVUpdE
// Source: https://tinyurl.com/ye24b4vd
//
// Normal sudoku rules apply. A black dot sits at the intersection of four
// cells whose digits contain at least two consecutive pairs (pairs may
// overlap, e.g. 1-2-3-7 has 1/2 and 2/3). A white dot sits at a four-cell
// intersection whose digits contain exactly one consecutive pair. Digits
// around a dot may repeat, and a repeated digit is counted in every pair it
// forms (e.g. 4-5-5-7 has two pairs: 4/5 and 4/5). Not every dot is
// necessarily drawn, so undrawn intersections carry no constraint.

const givens = [
  ['R1C1', 1], ['R1C2', 8], ['R2C1', 6], ['R2C3', 4], ['R3C2', 2],
  ['R3C4', 9], ['R3C7', 4], ['R4C3', 7], ['R4C5', 3], ['R5C4', 1],
  ['R5C6', 7], ['R6C5', 5], ['R6C7', 3], ['R7C3', 8], ['R7C6', 1],
  ['R7C8', 9], ['R8C7', 7], ['R8C9', 5], ['R9C8', 3],
].map(([cell, value]) => new Given(cell, value));

// Transcribed from the source's drawn dots (black fill vs. white fill),
// each a four-cell 2x2 intersection.
const blackDots = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2'],
  ['R2C2', 'R2C3', 'R3C2', 'R3C3'],
  ['R3C3', 'R3C4', 'R4C3', 'R4C4'],
  ['R4C4', 'R4C5', 'R5C4', 'R5C5'],
  ['R5C5', 'R5C6', 'R6C5', 'R6C6'],
  ['R6C6', 'R6C7', 'R7C6', 'R7C7'],
  ['R7C7', 'R7C8', 'R8C7', 'R8C8'],
  ['R8C8', 'R8C9', 'R9C8', 'R9C9'],
  ['R1C6', 'R1C7', 'R2C6', 'R2C7'],
  ['R8C3', 'R8C4', 'R9C3', 'R9C4'],
];
const whiteDots = [
  ['R4C3', 'R4C4', 'R5C3', 'R5C4'],
  ['R5C6', 'R5C7', 'R6C6', 'R6C7'],
  ['R5C3', 'R5C4', 'R6C3', 'R6C4'],
  ['R4C6', 'R4C7', 'R5C6', 'R5C7'],
  ['R6C3', 'R6C4', 'R7C3', 'R7C4'],
  ['R3C6', 'R3C7', 'R4C6', 'R4C7'],
  ['R2C6', 'R2C7', 'R3C6', 'R3C7'],
  ['R7C3', 'R7C4', 'R8C3', 'R8C4'],
];

// Scans the four cells of a quad in list order (order does not affect the
// result: every step compares the new digit against every digit already
// seen, so all 6 unordered cell-pairs of the quad are covered once each).
// `count` accumulates how many of those pairs differ by exactly 1, clamped
// at 2 since neither dot color needs to distinguish "2" from "more than 2".
// `seen` is kept sorted so states that differ only by input order collapse
// together instead of each being counted as a new NFA state.
function quadConsecutiveSpec(accept) {
  return NFA.encodeSpec({
    startState: { seen: [], count: 0 },
    transition({ seen, count }, value) {
      let newPairs = 0;
      for (const v of seen) {
        if (Math.abs(v - value) === 1) newPairs++;
      }
      return {
        seen: [...seen, value].sort((a, b) => a - b),
        count: Math.min(count + newPairs, 2),
      };
    },
    accept,
    maxDepth: 4,
  }, 9);
}

// Black dot: at least two consecutive pairs -> count saturates at 2.
const blackDotMachine = quadConsecutiveSpec(({ count }) => count === 2);
// White dot: exactly one consecutive pair.
const whiteDotMachine = quadConsecutiveSpec(({ count }) => count === 1);

return [
  new Shape('9x9'),
  ...givens,
  ...blackDots.map(cells => new NFA(blackDotMachine, 'quad-black-consec', cells)),
  ...whiteDots.map(cells => new NFA(whiteDotMachine, 'quad-white-consec', cells)),
];
