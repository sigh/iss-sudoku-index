// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=yZMfUK82oTI
// Source: https://cracking-the-cryptic.web.app/sudoku/Jb4tLNM7HN

// Normal sudoku rules apply. Five colored rings are drawn (each ring the
// border of a rectangular block of cells; underlay colors, one region per
// ring). Fifteen no-total cages are drawn inside the rings -- digits cannot
// repeat within a cage. Within one ring, every one of its own cages shares
// one common total (unstated, and free to differ ring to ring); some ring
// cells are not covered by any cage and carry no local distinctness rule
// beyond ordinary sudoku. The sum of the digits in each ring is one of five
// unique primes, and the five ring sums together add to a palindrome that
// must appear as three consecutive cells along one of the grid's two main
// diagonals.
//
// The rules say a ring's sum "will appear in the bolded rectangles" (drawn
// as small boxes overlaid on the grid), but the payload carries no text for
// them -- only their rectangle outlines. Nothing is read from them: each
// ring's sum is pinned entirely by the arithmetic below (prime, the five
// mutually distinct, and the total's digits placed on a diagonal), so the
// missing printed value is not a decode gap.
//
// Per-ring candidate primes are bounded from the cage sizes actually drawn
// in that ring, using only generic combinatorics (never solving the grid):
// a k-cell distinct-digit cage sums in [tri(k-1)+k, tri(9)-tri(9-k)], all of
// a ring's cages share one total, so that total lies in the intersection of
// its cages' size ranges, and the ring sum is (that total * cage count) plus
// its uncaged cells' own range. Where a ring's uncaged cells share a box
// (checked against the drawn regions) they must be mutually distinct too,
// tightening their range from generic 1-9 draws to a distinct-digit sum.
//   red:    4 cages (3,4,3,3) + 1 uncaged cell (R3C4)                -> ring sum in [41,105]
//   blue:   3 cages (5,5,3)   + 1 uncaged cell (R6C8)                -> ring sum in [46,81]
//   yellowgreen: 3 cages (3,4,4) + 3 uncaged cells in box 9 (R8C9,R9C8,R9C9) -> ring sum in [36,96]
//   gray:   3 cages (2,4,4)   + 4 uncaged cells in box 4 (R4C1,R5C1,R5C3,R6C1) -> ring sum in [40,81]
//   purple: 2 cages (3,2)     + 3 uncaged cells in box 5 (R4C4,R4C5,R6C5) -> ring sum in [18,58]
// These are safe (non-excluding) bounds, not derived from the solution; a
// prime outside a ring's window is excluded only because no valid cage
// total could ever reach it, whatever digits the grid ends up holding.

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

// Widening to 0-9 lets the auxiliary digit-Vars below hold a leading zero
// (a two-digit ring sum's "hundreds" digit). Restrict the 81 playable grid
// cells back to the true 1-9 range -- one Given template replicated to
// every cell, since the restriction is identical everywhere.
const digitGivens = graph.makeReplicate(new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Ring cell membership, from the drawn underlay colors (one region per ring).
const rings = [
  {
    name: 'red',
    cells: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C1', 'R2C6', 'R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6'],
    primes: [41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103],
  },
  {
    name: 'blue',
    cells: ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C9', 'R3C7', 'R3C9', 'R4C7', 'R4C9', 'R5C7', 'R5C9', 'R6C7', 'R6C8', 'R6C9'],
    primes: [47, 53, 59, 61, 67, 71, 73, 79],
  },
  {
    name: 'yellowgreen',
    cells: ['R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9', 'R8C4', 'R8C9', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
    primes: [37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89],
  },
  {
    name: 'gray',
    cells: ['R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C3', 'R6C1', 'R6C3', 'R7C1', 'R7C3', 'R8C1', 'R8C3', 'R9C1', 'R9C2', 'R9C3'],
    primes: [41, 43, 47, 53, 59, 61, 67, 71, 73, 79],
  },
  {
    name: 'purple',
    cells: ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C6', 'R6C4', 'R6C5', 'R6C6'],
    primes: [19, 23, 29, 31, 37, 41, 43, 47, 53],
  },
];

// The 15 drawn no-total cages (a 16th "cages" array entry has no cells and
// is a metadata stub, omitted). Grouped here by which ring each sits in, for
// the per-ring "cages share a total" constraint below.
const ringCages = {
  red: [
    ['R1C1', 'R1C2', 'R1C3'],
    ['R2C1', 'R3C1', 'R3C2', 'R3C3'],
    ['R1C4', 'R1C5', 'R1C6'],
    ['R2C6', 'R3C6', 'R3C5'],
  ],
  blue: [
    ['R3C7', 'R2C7', 'R1C7', 'R1C8', 'R1C9'],
    ['R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9'],
    ['R4C7', 'R5C7', 'R6C7'],
  ],
  yellowgreen: [
    ['R9C7', 'R9C6', 'R9C5'],
    ['R9C4', 'R8C4', 'R7C4', 'R7C5'],
    ['R7C6', 'R7C7', 'R7C8', 'R7C9'],
  ],
  gray: [
    ['R4C2', 'R4C3'],
    ['R6C3', 'R7C3', 'R8C3', 'R9C3'],
    ['R7C1', 'R8C1', 'R9C1', 'R9C2'],
  ],
  purple: [
    ['R4C6', 'R5C6', 'R6C6'],
    ['R5C4', 'R6C4'],
  ],
};

// Digits cannot repeat within a cage.
const cageAllDifferent = Object.values(ringCages)
  .flat()
  .map(cells => new AllDifferent(...cells));

// The cages within one ring share a common (unstated) total.
const equalSumPerRing = Object.values(ringCages)
  .map(cageList => new EqualSum(...cageList));

// Auxiliary hundreds/tens/units digit-Vars for each ring's sum, and for the
// five sums' total. Indexed 1..5 in `rings` order; the total uses count-1
// groups so each gets the bare 'VPH'/'VPT'/'VPU' cell id.
const H = new Var('H', 'ring sum hundreds digit', rings.length);
const T = new Var('T', 'ring sum tens digit', rings.length);
const U = new Var('U', 'ring sum units digit', rings.length);
const PH = new Var('PH', 'total hundreds digit', 1);
const PT = new Var('PT', 'total tens digit', 1);
const PU = new Var('PU', 'total units digit', 1);

const ringDigits = rings.map((_, i) => [H.cell(i + 1), T.cell(i + 1), U.cell(i + 1)]);

// Tie each ring's cell sum to its own three digit-Vars: sum(ring) = 100h+10t+u.
const ringSumLinks = rings.map((ring, i) => {
  const [h, t, u] = ringDigits[i];
  return new Sum(0, ...ring.cells, [h, -100], [t, -10], [u, -1]);
});

// Each ring's sum must be one of its own candidate primes (see the bounds
// comment above). Reads the three digit-Vars as a 3-digit number and checks
// membership in that ring's own prime list -- no relation to the puzzle's
// solution, only to what that ring's cage sizes could ever total.
const ringIsPrime = rings.map((ring, i) => {
  const [h, t, u] = ringDigits[i];
  const spec = NFA.encodeSpec({
    startState: { value: 0 },
    transition: ({ value }, digit) => ({ value: value * 10 + digit }),
    accept: ({ value }) => ring.primes.includes(value),
    maxDepth: 3,
  }, shape);
  return new NFA(spec, `${ring.name}Prime`, h, t, u);
});

// The five ring sums are pairwise distinct: for every pair of rings, at
// least one of their three digit-Vars must differ.
const neKey = Pair.fnToKey((a, b) => a !== b, shape);
const distinctRingSums = [];
for (let i = 0; i < rings.length; i++) {
  for (let j = i + 1; j < rings.length; j++) {
    const [h1, t1, u1] = ringDigits[i];
    const [h2, t2, u2] = ringDigits[j];
    const label = `${rings[i].name}-${rings[j].name}`;
    distinctRingSums.push(new Or([
      new Pair(neKey, `${label} h`, h1, h2),
      new Pair(neKey, `${label} t`, t1, t2),
      new Pair(neKey, `${label} u`, u1, u2),
    ]));
  }
}

// Total of the five ring sums, as its own three digit-Vars:
// sum(100h+10t+u over rings) = 100*PH + 10*PT + PU.
const totalLink = new Sum(
  0,
  ...ringDigits.flatMap(([h, t, u]) => [[h, 100], [t, 10], [u, 1]]),
  [PH.cell(1), -100], [PT.cell(1), -10], [PU.cell(1), -1],
);

// Palindrome: for a 3-digit number this is exactly "first digit = last
// digit" (the middle digit is unconstrained).
const totalIsPalindrome = new SameValues(2, PH.cell(1), PU.cell(1));

// The total's digits must appear as 3 consecutive cells along one of the two
// main diagonals. The source draws no other diagonal, and ISS's own
// `Diagonal` class scopes "diagonal" to these two, so no other placement is
// a live candidate. Which diagonal, and where along it, is left open by the
// rules, so disjoin over every contiguous placement on each. A true
// palindrome (PH === PU, enforced above) reads the same in both directions,
// so the two scan directions collapse to one set of windows.
const mainDiagonal = [
  'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9',
];
const antiDiagonal = [
  'R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1',
];
const diagonalPlacements = [];
for (const diag of [mainDiagonal, antiDiagonal]) {
  for (let start = 0; start + 2 < diag.length; start++) {
    diagonalPlacements.push(new And([
      new SameValues(2, diag[start], PH.cell(1)),
      new SameValues(2, diag[start + 1], PT.cell(1)),
      new SameValues(2, diag[start + 2], PU.cell(1)),
    ]));
  }
}
const totalOnDiagonal = new Or(diagonalPlacements);

return [
  shape,
  digitGivens,
  H, T, U, PH, PT, PU,
  ...cageAllDifferent,
  ...equalSumPerRing,
  ...ringSumLinks,
  ...ringIsPrime,
  ...distinctRingSums,
  totalLink,
  totalIsPalindrome,
  totalOnDiagonal,
];
