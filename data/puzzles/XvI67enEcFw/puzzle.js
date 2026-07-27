// Title: Out of Order
// Author: blackjackfitz
// Video: https://www.youtube.com/watch?v=XvI67enEcFw
// Source: https://sudokupad.app/egn520dswg

// Normal sudoku rules apply. The puzzle's own `regions` are exactly the 9
// standard 3x3 boxes, which ISS already enforces by default, so no explicit
// regions override is needed. There are no givens.
//
// Black dot pairs (6, one per filled-black rounded edge overlay): digits on
// either side are in a 1:2 ratio -- `BlackDot`.
//
// Pink lines (17, all length-3 strokes in colour #f067f0): the 3 digits form
// a consecutive set (as in Renban) but must NOT read in fully sorted order
// along the line, in either direction ("i.e. 4321 is not valid while 4312 is
// valid"). One custom NFA per line captures both halves of that single rule:
// it reads the 3 cell values in line order, then `accept` checks the trio is
// a 3-value consecutive run and is neither strictly increasing nor strictly
// decreasing left-to-right. The property is direction-symmetric (reversing
// the line only swaps "increasing" and "decreasing"), so which end of the
// drawn stroke the geometry helper reports first does not affect the result.

const outOfOrderSpec = NFA.encodeSpec({
  startState: null,
  transition: (state, value) => {
    if (state === null) return { v1: value, v2: null };
    if (state.v2 === null) return { v1: state.v1, v2: value };
    return { v1: state.v1, v2: state.v2, v3: value };
  },
  accept: (state) => {
    if (!state || state.v3 === undefined) return false;
    const { v1, v2, v3 } = state;
    if (new Set([v1, v2, v3]).size !== 3) return false;
    const lo = Math.min(v1, v2, v3);
    const hi = Math.max(v1, v2, v3);
    if (hi - lo !== 2) return false; // not a run of 3 consecutive values
    const increasing = v1 < v2 && v2 < v3;
    const decreasing = v1 > v2 && v2 > v3;
    return !increasing && !decreasing;
  },
}, 9);

// Pink lines, cells in drawn waypoint order.
const pinkLines = [
  ['R3C3', 'R3C2', 'R3C1'],
  ['R1C1', 'R1C2', 'R1C3'],
  ['R1C7', 'R2C7', 'R3C7'],
  ['R1C8', 'R2C8', 'R3C8'],
  ['R1C9', 'R2C9', 'R3C9'],
  ['R9C1', 'R8C1', 'R7C1'],
  ['R9C2', 'R8C2', 'R7C2'],
  ['R9C3', 'R8C3', 'R7C3'],
  ['R7C7', 'R7C8', 'R7C9'],
  ['R9C7', 'R9C8', 'R9C9'],
  ['R4C4', 'R4C5', 'R4C6'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R6C8', 'R5C8', 'R4C8'],
  ['R6C2', 'R5C2', 'R4C2'],
  ['R9C4', 'R8C5', 'R9C6'],
  ['R1C4', 'R2C5', 'R2C6'],
];

// Black-dot edges, from the filled-black rounded overlay centers.
const blackDotEdges = [
  ['R2C8', 'R2C9'],
  ['R8C1', 'R8C2'],
  ['R3C5', 'R4C5'],
  ['R6C5', 'R7C5'],
  ['R5C9', 'R6C9'],
  ['R4C3', 'R5C3'],
];

return [
  new Shape('9x9'),

  ...pinkLines.map(
    (cells, i) => new NFA(outOfOrderSpec, `out-of-order-${i}`, cells)),

  ...blackDotEdges.map(([a, b]) => new BlackDot(a, b)),
];
