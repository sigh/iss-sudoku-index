// Title: Feb 23, 2022: Rank Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=5KkjaYmgOBc
// Source: https://tinyurl.com/2p8p5zvs

// Normal sudoku rules apply. Digits may not repeat within a cage (no cage
// prints a sum total; only the no-repeat rule applies). Each cage also
// carries some gray "#k" markers: the digit in a "#k" cell must be the
// k-th smallest among all of that cage's own digits (a "#1" cell holds its
// cage's lowest digit, a "#2" cell the second-lowest, etc.). Not every
// cage cell carries a marker; an unmarked cell's rank is unconstrained.

// Cage cell membership, drawn as killer cages with no totals.
const cages = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R3C1', 'R4C1'],
  ['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9'],
  ['R2C4', 'R2C5', 'R2C6'],
  ['R4C8', 'R5C8', 'R6C8'],
  ['R6C9', 'R7C9', 'R8C9', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R8C4', 'R8C5', 'R8C6'],
  ['R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4'],
  ['R4C2', 'R5C2', 'R6C2'],
  ['R6C3', 'R6C4', 'R7C4'],
  ['R3C6', 'R4C6', 'R4C7'],
];

// Rank markers (gray "#k" text drawn on individual cells), one object per
// cage above, cross-checked against each cage's own cell list.
const rankMarks = [
  { R1C1: 4, R1C2: 2, R1C4: 7, R2C1: 1, R4C1: 6 },
  { R1C6: 2, R1C8: 6, R2C9: 7, R4C9: 3 },
  { R2C4: 2 },
  { R4C8: 2 },
  { R6C9: 6, R8C9: 2, R9C6: 7, R9C8: 1, R9C9: 3 },
  { R8C6: 3 },
  { R6C1: 7, R8C1: 1, R9C1: 2, R9C2: 3, R9C4: 6 },
  { R6C2: 2 },
  { R6C3: 3, R7C4: 2 },
  { R3C6: 1, R4C7: 2 },
];

// A "#k" marker on cell C means: among C's own cage, exactly k-1 other
// cells hold a smaller digit than C. Encode each marker as one NFA that
// reads C first (fixing the comparison target in state), then every other
// cell of that same cage, counting how many are smaller than the target;
// it accepts only when that count equals k-1 exactly.
function rankNFA(target, others, rank) {
  const threshold = rank - 1;
  const spec = NFA.encodeSpec({
    startState: { target: null, count: 0 },
    transition: ({ target, count }, value) => {
      if (target === null) return { target: value, count };
      const smaller = value < target ? 1 : 0;
      // Clamp: once count would exceed the threshold the branch can only
      // reject, so collapse every overshoot to one sink value.
      return { target, count: Math.min(count + smaller, threshold + 1) };
    },
    accept: ({ target, count }) => target !== null && count === threshold,
  }, 9);
  return new NFA(spec, 'Rank', target, ...others);
}

const rankConstraints = cages.flatMap((cells, i) =>
  Object.entries(rankMarks[i]).map(([cell, rank]) =>
    rankNFA(cell, cells.filter(c => c !== cell), rank)));

return [
  new Shape('9x9'),

  new Given('R1C5', 3),
  new Given('R2C2', 1),
  new Given('R2C8', 5),
  new Given('R3C3', 2),
  new Given('R3C7', 4),
  new Given('R4C6', 4),
  new Given('R5C1', 5),
  new Given('R5C9', 2),
  new Given('R6C4', 2),
  new Given('R7C3', 9),
  new Given('R7C7', 6),
  new Given('R8C2', 5),
  new Given('R8C8', 9),
  new Given('R9C5', 7),

  ...cages.map(cells => new AllDifferent(...cells)),
  ...rankConstraints,
];
