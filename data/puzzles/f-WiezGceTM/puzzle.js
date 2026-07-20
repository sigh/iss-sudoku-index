// Title: Thinking Inside the Box
// Author: masetab
// Video: https://www.youtube.com/watch?v=f-WiezGceTM
// Source: https://sudokupad.app/rq8hdyfg1n

// Every entry is one drawn cage. EqualSum enforces the common sum within each box.
const cagesByBox = [
  [['R1C1', 'R2C1'], ['R1C2', 'R2C2'], ['R2C3', 'R3C3'], ['R3C1', 'R3C2']],
  [['R1C4', 'R2C4'], ['R1C5', 'R2C5'], ['R2C6', 'R3C6'], ['R3C4', 'R3C5']],
  [['R1C7', 'R1C8', 'R2C8'], ['R2C7', 'R3C7', 'R3C8'], ['R2C9', 'R3C9']],
  [['R4C1', 'R4C2', 'R4C3', 'R5C3', 'R6C3'], ['R5C1', 'R5C2'], ['R6C1', 'R6C2']],
  [['R4C4', 'R5C4', 'R6C4'], ['R4C5', 'R5C5'], ['R5C6', 'R6C5', 'R6C6']],
  [['R4C7', 'R4C8'], ['R5C7', 'R6C7'], ['R5C8', 'R6C8'], ['R5C9', 'R6C9']],
  [['R7C2', 'R7C3', 'R8C3'], ['R9C2', 'R9C3']],
  [['R7C4', 'R7C5'], ['R9C5', 'R9C6']],
  [['R7C7', 'R7C8'], ['R7C9', 'R8C8', 'R8C9'], ['R8C7', 'R9C7', 'R9C8']],
];

// Each box has a two-cell cage representative. Comparing all 36 pairs proves
// that the nine common box sums are pairwise distinct without storing sums in
// digit-valued auxiliary cells (two-cell sums can exceed 9).
const representatives = cagesByBox.map(cages => cages.find(cage => cage.length === 2));
const unequalSums = NFA.encodeSpec({
  startState: { phase: 'first', difference: 0 },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return state.phase === 'first'
        ? { phase: 'second', difference: state.difference }
        : undefined;
    }
    return {
      phase: state.phase,
      difference: state.difference + (state.phase === 'first' ? value : -value),
    };
  },
  accept: state => state.phase === 'second' && state.difference !== 0,
  // Two two-cell segments plus their boundary.
  maxDepth: 5,
}, 9, { multiSegment: true });

const distinctBoxSums = representatives.flatMap((first, i) =>
  representatives.slice(i + 1).map(second =>
    new NFA(unequalSums, 'unequal cage sums', first, second)));

return [
  new Shape('9x9'),
  ...cagesByBox.map(cages => new EqualSum(...cages)),
  ...distinctBoxSums,
  new BlackDot('R6C6', 'R6C7'),
  new BlackDot('R8C7', 'R9C7'),
];
