// Title: Unique Sums
// Author: SamuPiano
// Video: https://www.youtube.com/watch?v=BTI8RhqVru8
// Source: https://app.crackingthecryptic.com/sudoku/RMqLfJ9qMf

// Normal Sudoku applies. Every outlined cage has a total different from every
// other outlined cage; its cells are not separately required to be distinct.
// The grey R2C3 square is even.
const cages = [
  // The outlined cages transcribed from the source drawing.
  ['R1C4', 'R2C4', 'R2C5'], ['R2C6', 'R3C5', 'R3C6'],
  ['R4C5', 'R4C6', 'R5C5'], ['R6C4', 'R6C5', 'R6C6'],
  ['R9C4', 'R9C5'], ['R8C5', 'R8C6'], ['R7C5', 'R7C6'],
  ['R5C2', 'R6C1', 'R6C2'], ['R6C8', 'R6C9'], ['R2C8', 'R2C9'],
  ['R3C8', 'R3C9'], ['R3C3', 'R4C3'], ['R1C1', 'R1C2'],
  ['R1C7'], ['R7C4'], ['R4C1'], ['R9C2'], ['R3C1'], ['R9C9'],
  ['R8C8'], ['R9C7'], ['R5C9'],
];

// The state is the first cage sum minus the second. SEGMENT_BREAK switches
// from adding the first outlined cage to subtracting the second, so acceptance
// means their totals differ.
const unequalCageSums = NFA.encodeSpec({
  startState: { difference: 0, secondCage: false },
  transition: ({ difference, secondCage }, value) => {
    if (value === SEGMENT_BREAK) return { difference, secondCage: true };
    return { difference: difference + (secondCage ? -value : value), secondCage };
  },
  accept: ({ difference, secondCage }) => secondCage && difference !== 0,
  // At most two three-cell cages and their one segment break are consumed.
  maxDepth: 7,
}, 9, { multiSegment: true });

const distinctTotals = [];
for (let first = 0; first < cages.length; first++) {
  for (let second = first + 1; second < cages.length; second++) {
    distinctTotals.push(new NFA(
      unequalCageSums, 'distinct cage totals', cages[first], cages[second]));
  }
}

return [
  new Shape('9x9'),
  new Given('R2C3', 2, 4, 6, 8),
  ...distinctTotals,
];
