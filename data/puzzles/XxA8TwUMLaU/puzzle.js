// Title: Pea-thagorean Theorem
// Author: sujoyku & ChinStrap
// Video: https://www.youtube.com/watch?v=XxA8TwUMLaU
// Source: https://sudokupad.app/tuf714ivht

// Normal sudoku rules apply (default row/column/box all-different).
// Dynamic Fog is solving UI, not a final-grid rule; omitted.
//
// Split Pea Index Lines: every drawn line is a "split pea index line". Each
// pair of adjacent circles on a line bounds a segment; the cells strictly
// between the two circles (never the circle cells themselves) must
// simultaneously satisfy:
//   - Split Pea: those cells sum to the two-digit number written by the two
//     circle digits.
//   - Index: an invisible diamond sits at one end of the segment, next to
//     one of its two circles (solver-determined). Counting from the diamond
//     end, the digit in the Nth cell gives the position along the segment
//     where digit N sits.
// The rules' worked example ("3_346_1", sum 3+4+6=13 = "1 concatenated with
// 3") fixes the concatenation order: the circle nearer the diamond supplies
// the units digit, the far circle the tens digit.
//
// Rule-forced consequence (derivable by hand, not from any solved grid): for
// the index rule to be well-defined for every N from 1 up to the segment
// length L, digit N must appear on the segment for every such N. With only L
// cells, that pigeonholes the segment's digits into being exactly a
// permutation of {1..L}. So:
//   (a) each between-circle segment is restricted to candidates 1..L and
//       must be internally all-different (forces the permutation);
//   (b) the segment's sum is therefore always the fixed constant
//       L*(L+1)/2, so the two-digit-number equation collapses to a fixed
//       {tens, units} candidate pair for the two circles -- no separate sum
//       constraint is needed, only a Given restricting each circle to that
//       pair (order between the two circles is left open, matching the
//       solver-determined diamond end).
// The index/involution property itself is direction-dependent (which
// physical cell is "position 1" flips with the diamond end), so it is
// encoded as Or(read forwards, read backwards) per segment.
//
// Involution reformulation: "digit in the Nth cell gives the position of
// digit N" means the position-to-digit map is its own inverse, i.e. for
// every pair of positions i != j: (digit at i == j) iff (digit at j == i).
// That is exactly what the generated Pair constraints below check, for
// every unordered position pair within a segment, in one read direction.
//
// Line cell sequences are read from the drawn line waypoints (interpolated
// cell-by-cell); circle endpoints from the drawn circle overlays. Lines do
// not cross or share cells (per rules text), and each connected
// colour/style group is one line -- the extra thin/dashed white sub-paths
// duplicate the interior (between-circle) portion of their coloured line
// for visual layering and are not separate clues.

// Skyblue line: R1C1(o) R2C1 R3C1 R4C1 R3C2 R2C3 R1C4 R1C3 R1C2(o)
const skyblue = {
  circleP: 'R1C1', circleQ: 'R1C2',
  mid: ['R2C1', 'R3C1', 'R4C1', 'R3C2', 'R2C3', 'R1C4', 'R1C3'],
};

// Orange line: R7C2(o) R6C3 R5C4 R5C3 R5C2 R5C1 R6C1 R7C1 R8C1 R9C1 R8C2(o)
const orange = {
  circleP: 'R7C2', circleQ: 'R8C2',
  mid: ['R6C3', 'R5C4', 'R5C3', 'R5C2', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],
};

// Green line: R3C9(o) R4C8 R4C7 R5C7 R6C7 R7C6 R8C6 R8C7 R9C8 R9C9(o)
const green = {
  circleP: 'R3C9', circleQ: 'R9C9',
  mid: ['R4C8', 'R4C7', 'R5C7', 'R6C7', 'R7C6', 'R8C6', 'R8C7', 'R9C8'],
};

// Pink line: R4C5(o) R5C5 R6C5 R6C6 R5C6 R4C6 R3C6 R3C5 R3C4 R2C5 R1C5(o)
//            R1C6 R2C6 R3C7 R2C8 R1C9 R1C8(o)
// Three circles split the line into two independent between-circle segments,
// each its own split pea index line (R1C5 is the shared circle).
const pinkA = {
  circleP: 'R4C5', circleQ: 'R1C5',
  mid: ['R5C5', 'R6C5', 'R6C6', 'R5C6', 'R4C6', 'R3C6', 'R3C5', 'R3C4', 'R2C5'],
};
const pinkB = {
  circleP: 'R1C5', circleQ: 'R1C8',
  mid: ['R1C6', 'R2C6', 'R3C7', 'R2C8', 'R1C9'],
};

// The fixed {tens, units} pair forced by L*(L+1)/2 (see comment above).
function twoDigitsForSum(l) {
  const sum = l * (l + 1) / 2;
  for (let tens = 1; tens <= 9; tens++) {
    const units = sum - 10 * tens;
    if (units >= 1 && units <= 9) return [tens, units];
  }
  throw new Error(`No 1-9/1-9 decomposition for segment length ${l}`);
}

// Involution constraints for one read direction: for every unordered pair of
// positions {i, j} (1-indexed along `orderedCells`), the digit at i equals j
// iff the digit at j equals i. One shared clue name keeps these grouped
// under a single public constraint tag rather than one per position pair.
function involutionPairs(orderedCells) {
  const l = orderedCells.length;
  return Array.from({ length: l }, (_, i) => i + 1).flatMap(i =>
    Array.from({ length: l - i }, (_, k) => i + 1 + k).map(j => {
      const key = Pair.fnToKey((a, b) => (a === j) === (b === i), 9);
      return new Pair(
        key, 'index-line involution', orderedCells[i - 1], orderedCells[j - 1]);
    }));
}

function segmentConstraints(seg) {
  const { circleP, circleQ, mid } = seg;
  const l = mid.length;
  const [tens, units] = twoDigitsForSum(l);
  return [
    new Given(circleP, tens, units),
    new Given(circleQ, tens, units),
    new AllDifferent(...mid),
    // A segment of length 9 already spans the full 1-9 domain, so an
    // explicit 1..l candidate restriction would be a no-op; the involution
    // permutation is then forced by AllDifferent alone.
    ...(l < 9
      ? mid.map(cell => new Given(cell, ...Array.from({ length: l }, (_, k) => k + 1)))
      : []),
    new Or([
      new And(involutionPairs(mid)),
      new And(involutionPairs([...mid].reverse())),
    ]),
  ];
}

return [
  new Shape('9x9'),

  ...segmentConstraints(skyblue),
  ...segmentConstraints(orange),
  ...segmentConstraints(green),
  ...segmentConstraints(pinkA),
  ...segmentConstraints(pinkB),
];
