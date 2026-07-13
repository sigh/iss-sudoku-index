// Title: Quadratics
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=RbjLl7O_Qx0

// Normal sudoku rules apply.
//
// Quads: each circle sits at the corner shared by four cells and contains
// four invisible digits (not necessarily distinct, to be deduced); these
// four digits must each appear in the surrounding four cells. Since there
// are exactly four hidden digits for four cells, the hidden digits are
// simply the four grid digits themselves, in some order.
//
// Quadratics: of the four digits on a circle, two of them are the two
// solutions of X^2 - aX + b = 0, where a & b are the other two digits on
// that circle. If the equation has only one solution, that digit is
// repeated twice (a double root, i.e. the two "root" cells hold the same
// digit).
//
// By Vieta's formulas, if r1 and r2 are the two roots then a = r1 + r2 and
// b = r1 * r2. So the rule is: among the four cells on a circle, some two
// of them (the "root" cells) have a sum and a product that equal the
// other two cells' digits (as a set of two values, in either order).

// One circle's four cells, read row-major from the raw overlay geometry:
// a circle centred on grid corner (r, c) touches cells (r-1,c-1), (r-1,c),
// (r,c-1), (r,c).
const CIRCLES = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2'],
  ['R2C3', 'R2C4', 'R3C3', 'R3C4'],
  ['R1C5', 'R1C6', 'R2C5', 'R2C6'],
  ['R2C7', 'R2C8', 'R3C7', 'R3C8'],
  ['R3C6', 'R3C7', 'R4C6', 'R4C7'],
  ['R4C5', 'R4C6', 'R5C5', 'R5C6'],
  ['R1C6', 'R1C7', 'R2C6', 'R2C7'],
  ['R6C2', 'R6C3', 'R7C2', 'R7C3'],
  ['R7C3', 'R7C4', 'R8C3', 'R8C4'],
  ['R6C4', 'R6C5', 'R7C4', 'R7C5'],
  ['R5C8', 'R5C9', 'R6C8', 'R6C9'],
  ['R6C7', 'R6C8', 'R7C7', 'R7C8'],
];

// Does some choice of two of the four (sorted) digits work as the root
// pair, with the other two matching {sum, product} of the roots?
const satisfiesQuadratic = (vals) => {
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      const r1 = vals[i], r2 = vals[j];
      const others = [];
      for (let k = 0; k < 4; k++) if (k !== i && k !== j) others.push(vals[k]);
      const want = [r1 + r2, r1 * r2].sort((x, y) => x - y);
      const got = [...others].sort((x, y) => x - y);
      if (want[0] === got[0] && want[1] === got[1]) return true;
    }
  }
  return false;
};

// Read all four cells, canonicalizing the running state to a sorted
// tuple so the compiled state count depends only on the multiset seen so
// far (a few hundred states), not on the order cells are scanned in.
const quadSpec = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen }, value) => ({ seen: [...seen, value].sort((a, b) => a - b) }),
  accept: ({ seen }) => seen.length === 4 && satisfiesQuadratic(seen),
  maxDepth: 4,
}, 9);

return [
  new Shape('9x9'),

  ...CIRCLES.map((cells, i) => new NFA(quadSpec, `quad${i}`, ...cells)),
];
