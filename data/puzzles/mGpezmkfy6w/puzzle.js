// Title: Perseverance
// Author: WombatBreath
// Video: https://www.youtube.com/watch?v=mGpezmkfy6w
// Source: https://app.crackingthecryptic.com/sudoku/tMB6LPrG2m

// Normal sudoku rules apply (standard 3x3 boxes, per the payload's `regions`).
// No givens. One killer cage sums to 38 (all-different, `cages[0]`). The
// marked diagonal sums to 15 and may include repeats, so it is a plain Sum,
// not a Diagonal: it is the broken diagonal traced by the off-grid arrow
// entering at the R5C9/R6C9 corner and heading up-left, row - col = -4,
// R1C5 through R5C9. White dots join consecutive digits, black dots a 1:2
// ratio; "not all dots are given" means
// unmarked pairs carry no constraint, so no Strict/negative Kropki closure.
// Every line is a palindrome. Each larger-circle digit must appear in at
// least one of its 2x2 group's four cells (`Quad`).

const cage38 = ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R2C8', 'R3C9'];
const diagonal15 = ['R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'];

// White (consecutive) dot pairs, from `overlays[]` fill=#ffffff edge marks.
const whiteDots = [
  ['R3C3', 'R3C4'], ['R2C4', 'R3C4'], ['R1C5', 'R2C5'], ['R1C8', 'R2C8'],
  ['R1C9', 'R2C9'], ['R2C8', 'R2C9'], ['R5C3', 'R5C4'], ['R4C1', 'R4C2'],
  ['R5C1', 'R6C1'], ['R5C2', 'R6C2'], ['R8C1', 'R8C2'], ['R9C1', 'R9C2'],
  ['R7C6', 'R8C6'], ['R7C9', 'R8C9'], ['R8C8', 'R9C8'], ['R8C7', 'R9C7'],
];

// Black (1:2 ratio) dot pairs, from `overlays[]` fill=#000000 edge marks.
const blackDots = [
  ['R8C9', 'R9C9'], ['R6C9', 'R7C9'], ['R3C7', 'R3C8'], ['R2C7', 'R3C7'],
  ['R1C2', 'R1C3'], ['R2C3', 'R3C3'], ['R5C3', 'R6C3'], ['R8C1', 'R9C1'],
  ['R8C5', 'R8C6'], ['R6C6', 'R7C6'], ['R6C6', 'R6C7'],
];

// Palindrome lines, from `lines[].wayPoints` interpolated to cells.
const palindromes = [
  ['R1C7', 'R2C6', 'R3C5'],
  ['R2C8', 'R3C7', 'R4C6'],
  ['R3C9', 'R4C8', 'R5C7'],
  ['R7C2', 'R7C3', 'R6C4', 'R6C5'],
  ['R7C1', 'R8C2', 'R8C3', 'R7C4', 'R7C5', 'R6C6', 'R7C7', 'R7C8', 'R6C9'],
];

// Larger-circle "at least one of the four surrounding cells" clues, from
// `overlays[]` 0.5-wide circles at 2x2 corners in the bottom-right corner.
const quads = [
  ['R8C6', 1],
  ['R8C7', 9],
  ['R8C8', 2],
];

return [
  new Shape('9x9'),
  new Cage(38, ...cage38),
  new Sum(15, ...diagonal15),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...palindromes.map(cells => new Palindrome(...cells)),
  ...quads.map(([topLeft, value]) => new Quad(topLeft, value)),
];
