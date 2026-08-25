// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=pLh_gPw9qBE
// Source: https://sudokupad.app/mPHfBTHRTf

// Normal sudoku rules apply. In cages, digits must not repeat and, when a
// total is printed, must sum to it; a cage with no printed total is still
// real and forbids repeats without fixing a sum. An "=", "^" or "v" mark
// straddling the shared border of two vertically-adjacent cages compares
// the two cages' (otherwise unstated) totals: "=" is equality, and the tip
// of an inequality mark points at the smaller total -- the ordinary "<"/">"
// reading, rotated to each pair's shared horizontal edge (drawn art:
// overlays #0-#2 are "=" between R1C6/R1C7 & R2C5/R2C6, R6C3/R6C4 &
// R3C5-R7C5, and R7C1/R8C1 & R7C2/R7C3; overlays #3/#4 are "^" with the tip
// on the top cage at R2C7/R3C7 and R8C7/R9C7; overlays #5/#6 are "v" with
// the tip on the bottom cage at R3C7/R4C7 and R8C6/R9C6).

// [total, ...cells] per drawn cage; total is null where no total is printed
// on the cage.
const cages = [
  [null, 'R1C1', 'R1C2', 'R2C2'],
  [18, 'R1C3', 'R1C4', 'R1C5'],
  [null, 'R1C6', 'R1C7'],
  [10, 'R1C8', 'R1C9'],
  [null, 'R2C1', 'R3C1'],
  [11, 'R3C2', 'R3C3'],
  [null, 'R2C3', 'R2C4', 'R3C4'],
  [null, 'R2C5', 'R2C6'],
  [null, 'R2C7', 'R2C8'],
  [17, 'R2C9', 'R3C9', 'R4C9'],
  [null, 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5'],
  [null, 'R3C6', 'R3C7'],
  [null, 'R3C8', 'R4C8'],
  [12, 'R4C1', 'R5C1', 'R6C1'],
  [21, 'R4C2', 'R5C2', 'R6C2'],
  [3, 'R4C3', 'R4C4'],
  [11, 'R5C3', 'R5C4'],
  [null, 'R6C3', 'R6C4'],
  [12, 'R4C6', 'R4C7'],
  [7, 'R5C6', 'R5C7'],
  [null, 'R6C6', 'R6C7'],
  [8, 'R5C8', 'R5C9'],
  [14, 'R6C8', 'R7C8'],
  [8, 'R6C9', 'R7C9', 'R8C9'],
  [null, 'R7C1', 'R8C1'],
  [null, 'R7C2', 'R7C3'],
  [10, 'R7C4', 'R8C4', 'R8C3'],
  [9, 'R7C6', 'R7C7'],
  [null, 'R8C2', 'R9C2', 'R9C1'],
  [19, 'R9C3', 'R9C4', 'R9C5'],
  [null, 'R8C5', 'R8C6'],
  [null, 'R9C6', 'R9C7'],
  [null, 'R8C7', 'R8C8'],
  [8, 'R9C8', 'R9C9'],
];

const cageCells = i => cages[i].slice(1);

const cageConstraints = cages.map(([total, ...cells]) =>
  total === null ? new AllDifferent(...cells) : new Cage(total, ...cells));

// Cage indices (into `cages` above) referenced by the sum-comparison marks.
const cP = 2, cQ = 7, cR = 17, cS = 10, cT = 24, cU = 25, cV = 11, cW = 8,
  cX = 31, cY = 32, cZ = 18, cAA = 30;

// A cage total can reach 35 (the 5-cell no-total cage in column 5), past the
// 1-9 grid domain, so a comparison is a two-segment NFA rather than a Var:
// it scans the left cage's cells accumulating their sum, then (after the
// segment break) the right cage's cells subtracting theirs, leaving
// diff = leftSum - rightSum in state to test at the end. `maxDepth` is set
// to the exact scanned symbol count (both cages' cell counts plus the one
// break) -- without it the compiler explores unboundedly many further steps
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
  // "=" (overlay #0): {R1C6,R1C7} = {R2C5,R2C6}.
  cageEqual(cP, cQ, 'P = Q'),
  // "=" (overlay #1): {R6C3,R6C4} = {R3C5..R7C5}.
  cageEqual(cR, cS, 'R = S'),
  // "=" (overlay #2): {R7C1,R8C1} = {R7C2,R7C3}.
  cageEqual(cT, cU, 'T = U'),
  // "^" tip on top cage W (overlay #3, R2C7/R2C8 over R3C6/R3C7): W < V,
  // i.e. V > W.
  cageGreater(cV, cW, 'V > W'),
  // "v" tip on bottom cage Z (overlay #5, R3C6/R3C7 over R4C6/R4C7): Z < V,
  // i.e. V > Z.
  cageGreater(cV, cZ, 'V > Z'),
  // "^" tip on top cage Y (overlay #4, R8C7/R8C8 over R9C6/R9C7): Y < X,
  // i.e. X > Y.
  cageGreater(cX, cY, 'X > Y'),
  // "v" tip on bottom cage X (overlay #6, R8C5/R8C6 over R9C6/R9C7): X < AA,
  // i.e. AA > X.
  cageGreater(cAA, cX, 'AA > X'),
];

return [
  new Shape('9x9'),
  ...cageConstraints,
  ...comparisons,
];
