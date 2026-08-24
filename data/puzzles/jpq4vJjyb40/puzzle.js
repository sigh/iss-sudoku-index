// Title: 362,880 subs Sudoku uses 1-9!
// Author: Trevor Tao
// Video: https://www.youtube.com/watch?v=jpq4vJjyb40
// Source: https://app.crackingthecryptic.com/sudoku/RPLDhr2rpQ

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Givens: R3C1=3, R3C3=6, R5C4=2, R5C6=8, R7C7=8.
//
// "Digits do not repeat in cages, which show their products": every listed
// cage below is both AllDifferent and a product-total, enforced together by
// productCage() (an NFA tracking the running product, capped at the target
// so the state space stays bounded; see factorial_cages.js for the sibling
// pattern with a size-derived target instead of a fixed one).
//
// Three of the payload's cages (R1C1/R1C2/R1C3/R2C1/R3C1/R4C1/R5C1/R5C2/R5C3,
// R3C3/R3C4/R3C5/R3C6/R3C7/R4C5/R5C5/R6C5/R7C5, and
// R5C7/R5C8/R5C9/R6C7/R7C7/R8C7/R9C7/R9C8/R9C9) carry the non-numeric cage
// value "#362880" -- the puzzle's namesake number (9!) used as a text label,
// not a printed numeric total (contrast every other cage's plain numeric
// value). They are still real cages under "digits do not repeat in cages",
// and each has exactly 9 cells in a 1-9 grid, so all-different alone forces
// each to hold every digit 1-9 once -- the product is then 362880
// automatically, with no separate total to enforce. Encoded as AllDifferent.
//
// The grey circle overlay at R7C9 makes that digit odd (rules text); there
// is no Odd/Even class, so it is a restricted Given.

function productCage(target, cells) {
  const spec = NFA.encodeSpec({
    startState: 1,
    transition: (state, value) => {
      const next = state * value;
      if (next > target) return; // reject: overshoots the target
      return next;
    },
    accept: (state) => state === target,
  }, 9);
  return [
    new AllDifferent(...cells),
    new NFA(spec, `product=${target}`, ...cells),
  ];
}

// [total, ...cells], transcribed from the payload's numeric-valued cages.
const PRODUCT_CAGES = [
  [15, 'R1C4', 'R1C5', 'R2C4'],
  [168, 'R1C6', 'R2C5', 'R2C6'],
  [240, 'R1C7', 'R2C7', 'R2C8'],
  [54, 'R1C8', 'R1C9', 'R2C9'],
  [224, 'R3C8', 'R3C9', 'R4C9'],
  [126, 'R6C9', 'R7C9', 'R8C9'],
  [135, 'R8C6', 'R9C5', 'R9C6'],
  [192, 'R7C4', 'R8C4', 'R9C4'],
  [54, 'R6C3', 'R7C3', 'R8C3'],
  [72, 'R7C2', 'R8C1', 'R8C2'],
  [56, 'R9C1', 'R9C2', 'R9C3'],
  [90, 'R2C2', 'R3C2', 'R4C2'],
];

// The three "#362880"-labelled cages (all-different only; see header note).
const NO_TOTAL_CAGES = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R5C2', 'R5C3'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C5', 'R5C5', 'R6C5', 'R7C5'],
  ['R5C7', 'R5C8', 'R5C9', 'R6C7', 'R7C7', 'R8C7', 'R9C7', 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  new Given('R3C1', 3),
  new Given('R3C3', 6),
  new Given('R5C4', 2),
  new Given('R5C6', 8),
  new Given('R7C7', 8),
  new Given('R7C9', 1, 3, 5, 7, 9), // grey circle: odd digit
  ...PRODUCT_CAGES.flatMap(([total, ...cells]) => productCage(total, cells)),
  ...NO_TOTAL_CAGES.map((cells) => new AllDifferent(...cells)),
];
