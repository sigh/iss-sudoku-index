// Title: Genetics
// Author: Angelo
// Video: https://www.youtube.com/watch?v=1TpTAyjO-8U
// Source: https://tinyurl.com/24r8hh8y

// Normal Sudoku rules. Every digit has two properties: parity (odd/even) and
// band (low 1-3, medium 4-6, high 7-9). A cell drawn as connected to two
// cells in the row above it is a child of those two parents: its digit takes
// one property from one parent and the other property from the other
// parent (which parent supplies which is not fixed). The 29 parent/child
// triples below are read off the drawn lines connecting each child to the
// two cells directly above it.

const FAMILIES = [
  // child, parent A, parent B
  ['R2C4', 'R1C4', 'R1C5'],
  ['R2C6', 'R1C6', 'R1C7'],
  ['R2C9', 'R1C8', 'R1C9'],
  ['R3C1', 'R2C1', 'R2C2'],
  ['R3C4', 'R2C4', 'R2C5'],
  ['R3C5', 'R2C4', 'R2C5'],
  ['R3C7', 'R2C6', 'R2C7'],
  ['R4C3', 'R3C2', 'R3C3'],
  ['R4C4', 'R3C4', 'R3C5'],
  ['R4C6', 'R3C6', 'R3C7'],
  ['R4C7', 'R3C7', 'R3C8'],
  ['R5C2', 'R4C1', 'R4C2'],
  ['R5C3', 'R4C3', 'R4C4'],
  ['R5C4', 'R4C3', 'R4C4'],
  ['R5C5', 'R4C5', 'R4C6'],
  ['R6C2', 'R5C2', 'R5C3'],
  ['R6C3', 'R5C2', 'R5C3'],
  ['R6C4', 'R5C4', 'R5C5'],
  ['R6C5', 'R5C4', 'R5C5'],
  ['R6C8', 'R5C8', 'R5C9'],
  ['R6C9', 'R5C8', 'R5C9'],
  ['R7C4', 'R6C3', 'R6C4'],
  ['R7C6', 'R6C5', 'R6C6'],
  ['R8C2', 'R7C2', 'R7C3'],
  ['R8C4', 'R7C4', 'R7C5'],
  ['R8C6', 'R7C6', 'R7C7'],
  ['R9C2', 'R8C1', 'R8C2'],
  ['R9C4', 'R8C4', 'R8C5'],
  ['R9C6', 'R8C6', 'R8C7'],
];

// Reads [parentA, parentB, child] and accepts iff the child's parity matches
// one parent while its band matches the other parent (either pairing).
// Property extraction (parity/band) is deterministic per digit, so the state
// after each parent read is just that parent's own (parity, band) pair; the
// accept check after the child is read tries both parent-to-property
// pairings, matching "which parent supplies which property is not fixed".
const geneticsSpec = {
  startState: { phase: 0 },
  transition: (state, value) => {
    const parity = value % 2;                         // 0 even, 1 odd
    const band = value <= 3 ? 0 : value <= 6 ? 1 : 2;  // 0 low, 1 med, 2 high
    if (state.phase === 0) {
      return { phase: 1, aParity: parity, aBand: band };
    }
    if (state.phase === 1) {
      return {
        phase: 2,
        aParity: state.aParity, aBand: state.aBand,
        bParity: parity, bBand: band,
      };
    }
    // phase 2: `value` is the child's digit.
    const { aParity, aBand, bParity, bBand } = state;
    const ok = (parity === aParity && band === bBand) ||
      (parity === bParity && band === aBand);
    return { phase: 3, ok };
  },
  accept: (state) => state.phase === 3 && state.ok,
};
const geneticsNFA = NFA.encodeSpec(geneticsSpec, 9);

return [
  new Shape('9x9'),

  new Given('R4C3', 3),
  new Given('R6C4', 4),
  new Given('R6C5', 9),

  ...FAMILIES.map(([child, a, b]) => new NFA(geneticsNFA, 'genetics', a, b, child)),
];
