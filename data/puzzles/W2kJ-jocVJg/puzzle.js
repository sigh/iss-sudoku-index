// Title: Pride Sums
// Author: Toir
// Video: https://www.youtube.com/watch?v=W2kJ-jocVJg
// Source: https://sudokupad.app/bqeojmgfc0

// Normal 6x6 Sudoku rules apply. R2C1, marked by the gray circle, is odd.
// The six arrays are the colored row groups drawn in the source. Every pair
// of their digit sums must differ by at least 2.
const coloredGroups = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4'], // Red fill.
  ['R2C3', 'R2C4', 'R2C5', 'R2C6'], // Orange fill.
  ['R3C2', 'R3C3', 'R3C4', 'R3C5'], // Yellow fill.
  ['R4C2', 'R4C3', 'R4C4'],         // Green fill.
  ['R5C1', 'R5C2', 'R5C3', 'R5C4'], // Blue fill.
  ['R6C2', 'R6C3', 'R6C4', 'R6C5'], // Purple fill.
];

// The first segment accumulates one colored-group sum. At the segment break,
// it becomes the reference sum while the second segment begins accumulating.
// The final state accepts only non-equal, non-consecutive sums.
const separatedSums = NFA.encodeSpec({
  startState: { firstSum: null, sum: 0 },
  transition: ({ firstSum, sum }, value) => {
    if (value === SEGMENT_BREAK) return { firstSum: sum, sum: 0 };
    return { firstSum, sum: sum + value };
  },
  accept: ({ firstSum, sum }) => firstSum !== null && Math.abs(firstSum - sum) >= 2,
  maxDepth: 9,
}, 6, { multiSegment: true });

const groupPairs = [];
for (let first = 0; first < coloredGroups.length; first++) {
  for (let second = first + 1; second < coloredGroups.length; second++) {
    groupPairs.push(new NFA(
      separatedSums,
      'colored-sums-separated',
      coloredGroups[first],
      coloredGroups[second],
    ));
  }
}

return [
  new Shape('6x6'),
  new Given('R1C6', 5),
  new Given('R4C6', 4),
  new Given('R6C1', 6),
  new Given('R2C1', 1, 3, 5),
  ...groupPairs,
];
