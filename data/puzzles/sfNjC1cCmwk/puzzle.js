// Title: Whispering Dominoes
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=sfNjC1cCmwk
// Source: https://sudokupad.app/17j9j9bf82

// Normal sudoku rules apply. For every pair of cages, a small NFA compares
// their totals by tracking the running difference sum(A) - sum(B). Adjacent
// cages use the stronger "difference at least 7" machine.

const cages = [
  ['R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R2C7'],
  ['R3C7', 'R4C7'],
  ['R4C8', 'R4C9'],
  ['R5C9', 'R6C9'],
  ['R7C8', 'R7C9'],
  ['R6C7', 'R7C7'],
  ['R5C6', 'R5C7'],
  ['R5C4', 'R5C5'],
  ['R5C2', 'R5C3'],
  ['R3C2', 'R4C2'],
  ['R3C3', 'R3C4'],
  ['R3C5', 'R3C6'],
  ['R2C1', 'R3C1'],
  ['R6C2', 'R7C2'],
  ['R7C3', 'R7C4'],
  ['R7C5', 'R7C6'],
  ['R8C6'],
  ['R9C6', 'R9C7', 'R9C8'],
  ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'],
];

const adjacentPairs = [
  [1, 2], [2, 3], [3, 4], [3, 8], [3, 13], [4, 5],
  [5, 6], [6, 7], [7, 8], [7, 17], [8, 9], [9, 10],
  [10, 11], [10, 15], [11, 12], [11, 14], [12, 13],
  [15, 16], [16, 17], [17, 18], [18, 19], [19, 20],
];

const compareCageTotals = (accept) => NFA.encodeSpec({
  startState: { segment: 0, diff: 0 },
  transition: ({ segment, diff }, value) => {
    if (value === SEGMENT_BREAK) return { segment: 1, diff };
    const next = segment === 0
      ? { segment, diff: diff + value }
      : { segment, diff: diff - value };
    return Math.abs(next.diff) <= 45 ? next : [];
  },
  accept,
}, 9, { multiSegment: true });

const notEqualTotals = compareCageTotals(({ diff }) => diff !== 0);
const whisperTotals = compareCageTotals(({ diff }) => Math.abs(diff) >= 7);
const adjacent = new Set(adjacentPairs.map(([a, b]) => `${a}-${b}`));
const constraints = [new Shape('9x9')];

for (let a = 1; a <= cages.length; a++) {
  for (let b = a + 1; b <= cages.length; b++) {
    const isAdjacent = adjacent.has(`${a}-${b}`);
    constraints.push(new NFA(
      isAdjacent ? whisperTotals : notEqualTotals,
      isAdjacent ? 'adjacent cage totals differ by at least 7' : 'cage totals differ',
      cages[a - 1],
      cages[b - 1],
    ));
  }
}

return constraints;
