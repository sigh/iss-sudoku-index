// Title: Cross Product
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=TbZgSykdCQw
// Source: https://sudokupad.app/hx8auhnjpp
//
// Normal 6x6 sudoku (default 2x3 boxes, confirmed to match the payload's
// `regions`). "Every indicated diagonal has the same product": four short
// off-grid arrow marks each point along a diagonal from where they enter the
// grid to the opposite edge; every digit-product along those four diagonals
// must be equal (shared value, not stated). Encoded with one multi-segment
// NFA below.

const shape = new Shape('6x6');

// Diagonal cell lists, transcribed from the four drawn off-grid arrow marks
// (each arrow's line extrapolates to a grid-edge entry point; the diagonal
// runs from there to the opposite edge):
//   entering at R1C5, "\" direction -> diagA
//   entering at R3C1, "\" direction -> diagB
//   entering at R5C1, "/" direction -> diagC
//   entering at R6C2, "/" direction -> diagD
const diagA = ['R1C5', 'R2C6'];
const diagB = ['R3C1', 'R4C2', 'R5C3', 'R6C4'];
const diagC = ['R5C1', 'R4C2', 'R3C3', 'R2C4', 'R1C5'];
const diagD = ['R6C2', 'R5C3', 'R4C4', 'R3C5', 'R2C6'];

// Largest possible product of any 2-digit diagonal (1-6 each) -- used only
// to bound the NFA's search before the shared target is known; see below.
const MAX_TARGET = 36;

// Equal-product-across-segments NFA. `diagA` is scanned first: it is only
// two cells, so its product is known small and becomes the shared `target`
// as soon as its segment ends. Every following segment's running product is
// pruned as soon as it exceeds `target` (safe because digits are >= 1, so a
// segment's product is non-decreasing as it is scanned) and must land
// exactly on `target` at its own segment break; the final segment is
// checked in `accept` once all cells are consumed. Before `target` is known,
// the running product is likewise capped at MAX_TARGET so the compiler
// cannot explore unboundedly long runs of digits without a break -- a real
// diagA product can never exceed it.
const spec = NFA.encodeSpec({
  startState: { target: null, product: 1 },
  transition: ({ target, product }, value) => {
    if (value === SEGMENT_BREAK) {
      if (target === null) return { target: product, product: 1 };
      if (product !== target) return undefined;
      return { target, product: 1 };
    }
    const next = product * value;
    const cap = target === null ? MAX_TARGET : target;
    if (next > cap) return undefined;
    return { target, product: next };
  },
  accept: ({ target, product }) => target !== null && product === target,
}, shape, { multiSegment: true });

return [
  shape,
  new NFA(spec, 'diagonal-product', diagA, diagB, diagC, diagD),
];
