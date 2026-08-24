// Title: Bedazzled
// Author: GarlicBredFries
// Video: https://www.youtube.com/watch?v=6I8sGjxqpuI
// Source: https://app.crackingthecryptic.com/sudoku/fj78pdJMhT

// Normal sudoku rules apply (standard 3x3 boxes; no givens).
//
// 25 small marks are drawn centred on points where 4 cells meet. Each such
// point joins two diagonal pairs of cells: "\" (top-left + bottom-right) and
// "/" (top-right + bottom-left). The marks are drawn 0.25 cells wide and
// exactly on the lattice point, so neither diagonal is singled out and both
// are the rule's subject -- matching the plural "the pairs of digits".
//
//   - black square: both diagonal pairs have a ratio of 1:n, and the two
//     pairs' n differ from each other ("but not the same one").
//   - black circle: both diagonal pairs have a ratio of 1:n, with the same n.
//   - white square: neither diagonal pair has a ratio of 1:n for any n.
//
// n ranges over 1..9: the rules say "a ratio of 1 to an integer", and 1 is an
// integer, so two equal digits stand in such a ratio. This matters only where
// a mark's diagonal joins two different boxes -- white squares at the (3,3),
// (3,4), (3,5) and (6,3) corners, and the black circle at (3,6); every other
// mark has all 4 cells inside one box, where equal digits are impossible
// anyway.
//
// Digits along an arrow sum to the digit in its bulb circle.

// n = 1..9 rather than 2..9; see the header.
const RATIOS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// A pair of digits stands in ratio 1:k when one is exactly k times the other,
// in either direction (k = 1 means the two digits are equal).
const ratioKey = k => Pair.fnToKey((a, b) => a === k * b || b === k * a, 9);
// No ratio at all, for the white-square negative.
const noRatioKey = Pair.fnToKey(
  (a, b) => !RATIOS.some(k => a === k * b || b === k * a), 9);

// The 2x2 block at corner (r, c) is RrCc, RrC(c+1), R(r+1)Cc, R(r+1)C(c+1).
function cornerDiagonals(r, c) {
  return {
    backslash: [makeCellId(r, c), makeCellId(r + 1, c + 1)],
    forwardslash: [makeCellId(r, c + 1), makeCellId(r + 1, c)],
  };
}

// One Pair per candidate ratio k, so a marker rule can select over k.
function ratioPairsByK(cells, name) {
  const byK = {};
  for (const k of RATIOS) byK[k] = new Pair(ratioKey(k), `${name}-r${k}`, ...cells);
  return byK;
}

function whiteCorner(r, c, i) {
  const { backslash, forwardslash } = cornerDiagonals(r, c);
  return [
    new Pair(noRatioKey, `white${i}-bs`, ...backslash),
    new Pair(noRatioKey, `white${i}-fs`, ...forwardslash),
  ];
}

// Both pairs carry a ratio and the two n differ: Or over every ordered
// (n1, n2) with n1 != n2. An unordered digit pair admits at most one n, so
// this selection is exact rather than a relaxation.
function differentRatioCorner(r, c, i) {
  const { backslash, forwardslash } = cornerDiagonals(r, c);
  const bs = ratioPairsByK(backslash, `square${i}-bs`);
  const fs = ratioPairsByK(forwardslash, `square${i}-fs`);
  const combos = [];
  for (const n1 of RATIOS) {
    for (const n2 of RATIOS) {
      if (n1 !== n2) combos.push(new And([bs[n1], fs[n2]]));
    }
  }
  return new Or(combos);
}

// Both pairs carry a ratio and the two n agree: Or over the shared n.
function sameRatioCorner(r, c, i) {
  const { backslash, forwardslash } = cornerDiagonals(r, c);
  const bs = ratioPairsByK(backslash, `circle${i}-bs`);
  const fs = ratioPairsByK(forwardslash, `circle${i}-fs`);
  return new Or(RATIOS.map(n => new And([bs[n], fs[n]])));
}

// Marker corners transcribed from the drawn overlays, grouped by fill and
// rounding: white fill / black border, black fill square, black fill circle.
const whiteCorners = [
  [3, 3], [3, 4], [3, 5], [4, 5], [5, 4], [6, 3], [7, 4], [7, 2],
  [5, 1], [8, 5], [1, 8], [2, 7], [4, 7], [5, 8],
];
const blackSquareCorners = [
  [8, 1], [7, 1], [4, 1], [2, 1], [1, 2], [1, 5],
];
const blackCircleCorners = [
  [3, 6], [5, 5], [4, 4], [7, 5], [8, 2],
];

return [
  new Shape('9x9'),

  ...whiteCorners.flatMap(([r, c], i) => whiteCorner(r, c, i)),
  ...blackSquareCorners.map(([r, c], i) => differentRatioCorner(r, c, i)),
  ...blackCircleCorners.map(([r, c], i) => sameRatioCorner(r, c, i)),

  // Arrow bulbs are the two large grey-bordered circles, at R1C9 and R9C6.
  new Arrow('R1C9', 'R2C9', 'R3C8'),
  new Arrow('R9C6', 'R9C7', 'R8C8'),
];
