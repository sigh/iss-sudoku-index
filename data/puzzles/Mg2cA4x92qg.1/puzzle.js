// Title: March 19, 2022: Multiplication
// Author: clover!
// Video: https://www.youtube.com/watch?v=Mg2cA4x92qg
// Source: https://tinyurl.com/3f8m36bj

// Normal sudoku rules apply. There are 8 cages, each a 2x2 block. In each
// cage, the two bottom digits read left-to-right as a two-digit number equal
// to the product of the two top digits. Digits may repeat in a cage, so no
// all-different constraint is placed on cage cells.
//
// Every cage's top pair carries a drawn "X" (multiplication symbol) between
// exactly those two cells, confirming which pair is "top" for every cage
// independently of geometric row order.

// Each cage as [topLeft, topRight, bottomLeft, bottomRight], matching the
// drawn cage outline and its "X" mark on the top pair.
const cages = [
  ['R3C4', 'R3C5', 'R4C4', 'R4C5'],
  ['R6C5', 'R6C6', 'R7C5', 'R7C6'],
  ['R4C6', 'R4C7', 'R5C6', 'R5C7'],
  ['R5C3', 'R5C4', 'R6C3', 'R6C4'],
  ['R7C3', 'R7C4', 'R8C3', 'R8C4'],
  ['R2C6', 'R2C7', 'R3C6', 'R3C7'],
  ['R6C7', 'R6C8', 'R7C7', 'R7C8'],
  ['R2C2', 'R2C3', 'R3C2', 'R3C3'],
];

// State machine over [topLeft, topRight, bottomLeft, bottomRight]:
// phase 0->1 records the first top digit; phase 1->2 turns it into the
// product of both top digits; phase 2->3 records the bottom-left (tens)
// digit; phase 3->4 checks the product against 10*bottomLeft + bottomRight.
// Only the final phase-4 state is inspected by `accept`.
const productCageSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    switch (state.phase) {
      case 0: return { phase: 1, t1: value };
      case 1: return { phase: 2, product: state.t1 * value };
      case 2: return { phase: 3, product: state.product, bl: value };
      case 3: return { phase: 4, ok: state.product === state.bl * 10 + value };
    }
  },
  accept: state => state.phase === 4 && state.ok,
}, 9);

function productCage(cells) {
  return new NFA(productCageSpec, 'product cage', ...cells);
}

return [
  new Shape('9x9'),

  new Given('R1C1', 1), new Given('R1C5', 8), new Given('R1C9', 6),
  new Given('R3C2', 5), new Given('R3C3', 6), new Given('R3C5', 4),
  new Given('R3C7', 8), new Given('R3C9', 7),
  new Given('R5C3', 2), new Given('R5C5', 6), new Given('R5C7', 5),
  new Given('R7C1', 3), new Given('R7C3', 5), new Given('R7C5', 7),
  new Given('R7C7', 1), new Given('R7C8', 8),
  new Given('R9C1', 7), new Given('R9C5', 3), new Given('R9C9', 5),

  ...cages.map(productCage),
];
