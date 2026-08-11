// Title: Boxes Clash
// Author: Niverio
// Video: https://www.youtube.com/watch?v=jG2o59TErfM
// Source: https://app.crackingthecryptic.com/sudoku/Tgb6g6rPR7
//
// Normal sudoku rules apply.
//
// Purple line: digits on the line form a set of consecutive, non-repeating
// digits, in any order -> Renban.
//
// Outside diagonal clue: the clue is the product of the box sums that the
// diagonal passes through, where a "box sum" totals only the diagonal cells
// that lie in that box (worked example in the rules text: the SW-NE diagonal's
// 1000 clue is (R1C9+R2C8+R3C7) * (R4C6+R5C5+R6C4) * (R7C3+R8C2+R9C1)).
// Every diagonal segment used below lies entirely within a single box per
// group (checked from the drawn cell coordinates), so sudoku's own box
// all-different already forces each group's cells to be distinct -- Sum (not
// Cage) is used since the rule states a sum, not a cage, and distinctness
// needs no separate constraint.
//
// There is no native "product of sums" class, so each clue is expanded to an
// explicit Or over every integer triple (a, b, c) that multiplies to the
// clue's value and is achievable by its three groups (bounded by the min/max
// sum of that many distinct 1-9 digits), then And'ed with a Sum(a,...),
// Sum(b,...), Sum(c,...) per branch. The triple search is brute-forced over
// the achievable ranges rather than hand-enumerated, so it can't miss a case.

// Minimum/maximum possible sum of `k` distinct digits from 1-9.
function sumRange(k) {
  return { min: k * (k + 1) / 2, max: 9 * k - (k * (k - 1)) / 2 };
}

// Every diagonal outside-clue, decoded from the source payload:
//  - its arrow markers give each diagonal's path and direction.
//  - its text overlays give each clue's value and, via each overlay's
//    center half-cell offset (e.g. row -0.5 = above row 0, col 3.5 = between
//    C4/C5), which
//    side of the shared corner cell it sits on -- that offset is what
//    disambiguates the two diagonals that share a start point (both top
//    clues start at R1C5; both left clues start near R5C1/R6C1; etc), not
//    mere nearest-distance guessing. Each pairing below was cross-checked
//    against both the arrow ray direction and the overlay center and the two
//    methods agree, so no ambiguity remains.
//  - Each diagonal is split into the (up to 3) boxes it crosses; the cells
//    within one box form one group.
const diagonalClues = [
  // Main diagonal (arrow #0 / overlay #0, "1000" at the R1C1 corner).
  {
    name: 'main-diagonal',
    value: 1000,
    groups: [
      ['R1C1', 'R2C2', 'R3C3'],
      ['R4C4', 'R5C5', 'R6C6'],
      ['R7C7', 'R8C8', 'R9C9'],
    ],
  },
  // Anti-diagonal (arrow #5 / overlay #1, "1000" at the R1C9 corner). This is
  // the exact worked example in the rules text.
  {
    name: 'anti-diagonal',
    value: 1000,
    groups: [
      ['R1C9', 'R2C8', 'R3C7'],
      ['R4C6', 'R5C5', 'R6C4'],
      ['R7C3', 'R8C2', 'R9C1'],
    ],
  },
  // Top-left-of-R1C5 diagonal, down-right to R5C9 (arrow #1, overlay #4
  // "99" at top C4 -- center col 3.5, i.e. left of the R1C5 start).
  {
    name: 'top-down-right',
    value: 99,
    groups: [
      ['R1C5', 'R2C6'],
      ['R3C7'],
      ['R4C8', 'R5C9'],
    ],
  },
  // Top-right-of-R1C5 diagonal, down-left to R5C1 (arrow #2, overlay #3
  // "1001" at top C6 -- center col 5.5, i.e. right of the R1C5 start).
  {
    name: 'top-down-left',
    value: 1001,
    groups: [
      ['R1C5', 'R2C4'],
      ['R3C3'],
      ['R4C2', 'R5C1'],
    ],
  },
  // R5C1 diagonal, down-right to R9C5 (arrow #3, overlay #5 "99" at left R4
  // -- center row 3.5, above the R5C1 start).
  {
    name: 'left-upper',
    value: 99,
    groups: [
      ['R5C1', 'R6C2'],
      ['R7C3'],
      ['R8C4', 'R9C5'],
    ],
  },
  // R6C1 diagonal, down-right to R9C4 (arrow #4, overlay #6 "20" at left R5
  // -- center row 4.5, below the R5C1 start / at the R6C1 start).
  {
    name: 'left-lower',
    value: 20,
    groups: [
      ['R6C1'],
      ['R7C2', 'R8C3'],
      ['R9C4'],
    ],
  },
  // R5C9 diagonal, down-left to R9C5 (arrow #6, overlay #2 "1001" at right
  // R4 -- center row 3.5, above the R5C9 start). Its middle three cells
  // (R6C8-R7C7-R8C6) also carry the purple Renban line.
  {
    name: 'right-upper',
    value: 1001,
    groups: [
      ['R5C9', 'R6C8'],
      ['R7C7'],
      ['R8C6', 'R9C5'],
    ],
  },
  // R6C9 diagonal, down-left to R9C6 (arrow #7, overlay #7 "40" at right R5
  // -- center row 4.5, below the R5C9 start / at the R6C9 start).
  {
    name: 'right-lower',
    value: 40,
    groups: [
      ['R6C9'],
      ['R7C8', 'R8C7'],
      ['R9C6'],
    ],
  },
];

function productClueConstraint({ value, groups }) {
  const ranges = groups.map(g => sumRange(g.length));
  const branches = [];
  for (let a = ranges[0].min; a <= ranges[0].max; a++) {
    for (let b = ranges[1].min; b <= ranges[1].max; b++) {
      const ab = a * b;
      if (ab === 0 || value % ab !== 0) continue;
      const c = value / ab;
      if (c < ranges[2].min || c > ranges[2].max) continue;
      branches.push(new And([
        new Sum(a, ...groups[0]),
        new Sum(b, ...groups[1]),
        new Sum(c, ...groups[2]),
      ]));
    }
  }
  if (branches.length === 0) {
    throw new Error(`No achievable factor triple for clue value ${value}`);
  }
  return new Or(branches);
}

// Purple lines (consecutive, non-repeating digits, any order), decoded from
// the source payload's two drawn line waypoints. Both sit on diagonal cells
// already listed above (the first is the middle of 'right-upper', the second
// the middle of 'top-down-left').
const renbanLines = [
  ['R6C8', 'R7C7', 'R8C6'],
  ['R2C4', 'R3C3', 'R4C2'],
];

return [
  new Shape('9x9'),
  new Given('R7C9', 3),
  ...diagonalClues.map(productClueConstraint),
  ...renbanLines.map(cells => new Renban(...cells)),
];
