// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=IFXPa9zK0Mc
// Source: https://app.crackingthecryptic.com/Rfj7F4jr9p

// Normal sudoku rules apply. In cages, digits must not repeat and, when a
// total is printed, must sum to it; a cage with no printed total is still
// real and forbids repeats without fixing a sum. An "=" or inequality mark
// ("^", "v", ">") straddling the shared border of two cages compares the two
// cages' (otherwise unstated) totals: "=" is equality, and the arrow/chevron
// points at the smaller total -- the ordinary "<"/">" reading, rotated to
// each pair's shared edge (drawn art: overlays #0-#3 are "=", #4/#5 are "^"
// with the tip on the top cage, #6 is "v" with the tip on the bottom cage,
// #7 is ">" with the tip on the right cage).

// [total, ...cells] per drawn cage; total is null where no total is printed
// on the cage.
const cages = [
  [null, 'R1C1', 'R1C2', 'R1C3'],
  [6, 'R2C1', 'R3C1'],
  [null, 'R2C3', 'R2C2', 'R3C2'],
  [null, 'R1C4', 'R1C5', 'R1C6', 'R2C6', 'R2C5', 'R2C4'],
  [11, 'R1C7', 'R1C8', 'R1C9'],
  [21, 'R2C7', 'R2C8', 'R3C8'],
  [7, 'R2C9', 'R3C9'],
  [null, 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'],
  [17, 'R4C1', 'R4C2', 'R4C3'],
  [null, 'R5C1', 'R6C1'],
  [null, 'R5C2', 'R5C3'],
  [null, 'R5C4', 'R4C4', 'R4C5', 'R4C6', 'R5C6'],
  [null, 'R4C7', 'R4C8', 'R4C9'],
  [17, 'R5C7', 'R5C8'],
  [7, 'R5C9', 'R6C9'],
  [11, 'R6C8', 'R7C8', 'R8C8'],
  [null, 'R7C9', 'R8C9', 'R9C9'],
  [7, 'R9C7', 'R9C8'],
  [18, 'R7C1', 'R8C1', 'R9C1'],
  [null, 'R6C2', 'R7C2', 'R8C2'],
  [8, 'R9C2', 'R9C3'],
  [14, 'R6C3', 'R6C4'],
  [null, 'R7C3', 'R7C4'],
  [9, 'R8C3', 'R8C4'],
  [null, 'R5C5', 'R6C5', 'R7C5'],
  [null, 'R9C4', 'R9C5', 'R8C5', 'R9C6'],
  [5, 'R6C6', 'R6C7'],
  [15, 'R7C6', 'R7C7'],
  [null, 'R8C6', 'R8C7'],
];

const cageCells = i => cages[i].slice(1);

const cageConstraints = cages.map(([total, ...cells]) =>
  total === null ? new AllDifferent(...cells) : new Cage(total, ...cells));

// Cage indices (into `cages` above) referenced by the sum-comparison marks.
const A = 0, C = 2, D = 3, H = 7, J = 9, K = 10, L = 11, S = 18, T = 19,
  Y = 24, Z = 25, BB = 27, CC = 28;

// A cage total can reach 39 (the 6-cell cage), well past the 1-9 grid
// domain, so a comparison is a two-segment NFA rather than a Var: it scans
// the left cage's cells accumulating their sum, then (after the segment
// break) the right cage's cells subtracting theirs, leaving
// diff = leftSum - rightSum in state to test at the end. `cmp` gets that
// diff and says whether the mark's relationship holds. `maxDepth` is set to
// the exact symbol count (both cages' cells plus the one break between
// them); without it the compiler explores unboundedly many further steps
// and blows the state cap.
function cageCompare(cmp, leftLen, rightLen) {
  return NFA.encodeSpec({
    startState: { phase: 1, diff: 0 },
    transition: ({ phase, diff }, value) => {
      if (value === SEGMENT_BREAK) return { phase: 2, diff };
      return phase === 1
        ? { phase: 1, diff: diff + value }
        : { phase: 2, diff: diff - value };
    },
    // phase === 2 confirms the break was actually seen (both cages scanned).
    accept: ({ phase, diff }) => phase === 2 && cmp(diff),
    maxDepth: leftLen + 1 + rightLen,
  }, 9, { multiSegment: true });
}

function cageEqual(leftIdx, rightIdx, label) {
  const left = cageCells(leftIdx), right = cageCells(rightIdx);
  return new NFA(cageCompare(diff => diff === 0, left.length, right.length),
    label, left, right);
}

function cageGreater(biggerIdx, smallerIdx, label) {
  const bigger = cageCells(biggerIdx), smaller = cageCells(smallerIdx);
  return new NFA(cageCompare(diff => diff > 0, bigger.length, smaller.length),
    label, bigger, smaller);
}

const comparisons = [
  // "=" marks (overlays #0-#3).
  cageEqual(A, C, 'A = C'),
  cageEqual(D, H, 'D = H'),
  cageEqual(J, K, 'J = K'),
  cageEqual(Z, CC, 'Z = CC'),
  // "^" between H (top) and L (bottom) (overlay #4): H < L.
  cageGreater(L, H, 'L > H'),
  // "^" between BB (top) and CC (bottom) (overlay #5): BB < CC.
  cageGreater(CC, BB, 'CC > BB'),
  // "v" between Y (top) and Z (bottom) (overlay #6): Y > Z.
  cageGreater(Y, Z, 'Y > Z'),
  // ">" between S (left) and T (right) (overlay #7): S > T.
  cageGreater(S, T, 'S > T'),
];

return [
  new Shape('9x9'),
  ...cageConstraints,
  ...comparisons,
];
