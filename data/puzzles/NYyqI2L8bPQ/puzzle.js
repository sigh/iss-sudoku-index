// Title: Hidden Identity Killers
// Author: Fluster
// Video: https://www.youtube.com/watch?v=NYyqI2L8bPQ
// Source: https://app.crackingthecryptic.com/sudoku/ptrTq8MMmt

// Normal sudoku rules apply (standard 3x3 boxes; no givens). Digits cannot
// repeat within a cage. Cages of the same size share one sum, and cages of
// different sizes have different sums. No cage total is printed anywhere,
// so each cage's sum is purely a function of its size.
//
// The 28 cages below are transcribed from the payload's `cages` array
// (cells, 1-indexed) and together tile all 81 cells. They fall into five
// size classes: 1 cell (x5), 2 cells (x8), 3 cells (x5), 4 cells (x5), and
// 5 cells (x5).
//
// "Same size -> same sum" is one `EqualSum` per size class, tying every
// cage in that class to a shared total directly -- no auxiliary Var, so no
// widened value range is needed (a size-5 cage's total can reach 35, well
// past the grid's 9-value alphabet).
//
// "Different size -> different sum" has no dedicated class. Since EqualSum
// already forces every cage in a class to one shared total, it is enough to
// compare one representative cage per class against every other class's
// representative: 5-choose-2 = 10 pairs. Each comparison is a 2-segment NFA
// that scans the first cage's cells while accumulating a running total, then
// the second's while subtracting, and accepts only when the net difference
// at the end is nonzero -- i.e. the two totals differ.

const cagesBySize = {
  1: [
    ['R1C8'],
    ['R4C1'],
    ['R9C3'],
    ['R5C4'],
    ['R7C7'],
  ],
  2: [
    ['R3C3', 'R3C4'],
    ['R4C2', 'R5C2'],
    ['R5C5', 'R6C5'],
    ['R7C5', 'R8C5'],
    ['R6C6', 'R6C7'],
    ['R4C7', 'R4C8'],
    ['R4C9', 'R5C9'],
    ['R7C8', 'R7C9'],
  ],
  3: [
    ['R2C4', 'R2C5', 'R2C6'],
    ['R1C9', 'R2C9', 'R2C8'],
    ['R5C1', 'R6C1', 'R6C2'],
    ['R7C1', 'R7C2', 'R8C2'],
    ['R8C1', 'R9C1', 'R9C2'],
  ],
  4: [
    ['R1C1', 'R1C2', 'R1C3', 'R2C3'],
    ['R2C1', 'R3C1', 'R3C2', 'R2C2'],
    ['R9C4', 'R8C4', 'R7C4', 'R6C4'],
    ['R4C4', 'R4C5', 'R4C6', 'R5C6'],
    ['R5C8', 'R5C7', 'R6C8', 'R6C9'],
  ],
  5: [
    ['R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C7'],
    ['R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9'],
    ['R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3'],
    ['R9C5', 'R9C6', 'R8C6', 'R7C6', 'R9C7'],
    ['R8C7', 'R8C8', 'R9C8', 'R9C9', 'R8C9'],
  ],
};

const sizes = Object.keys(cagesBySize).map(Number).sort((a, b) => a - b);
const allCages = sizes.flatMap(size => cagesBySize[size]);

// Running-difference NFA: accumulate segment 1's total, then subtract
// segment 2's total; accept only if the two totals are not equal.
// maxDepth bounds compile-time state exploration: the largest pair used
// below is a 4-cell and a 5-cell representative, so cells + (segments - 1)
// = 9 + 1 = 10.
const neqSumSpec = NFA.encodeSpec({
  startState: { phase: 'first', diff: 0 },
  transition: ({ phase, diff }, value) => {
    if (value === SEGMENT_BREAK) return { phase: 'second', diff };
    return phase === 'first'
      ? { phase: 'first', diff: diff + value }
      : { phase: 'second', diff: diff - value };
  },
  accept: ({ phase, diff }) => phase === 'second' && diff !== 0,
  maxDepth: 10,
}, 9, { multiSegment: true });

// One representative cage per size class; EqualSum below already ties every
// cage in a class to the same total, so comparing representatives suffices.
const representative = Object.fromEntries(sizes.map(size => [size, cagesBySize[size][0]]));

const crossSizeInequalities = [];
for (let i = 0; i < sizes.length; i++) {
  for (let j = i + 1; j < sizes.length; j++) {
    crossSizeInequalities.push(new NFA(
      neqSumSpec, `neqSum${sizes[i]}v${sizes[j]}`,
      representative[sizes[i]], representative[sizes[j]]
    ));
  }
}

return [
  new Shape('9x9'),

  // Digits cannot repeat within a cage (single-cell cages add no local
  // constraint).
  ...allCages.filter(cage => cage.length > 1).map(cage => new AllDifferent(...cage)),

  // Same size -> same sum.
  ...sizes.map(size => new EqualSum(...cagesBySize[size])),

  // Different size -> different sum.
  ...crossSizeInequalities,
];
