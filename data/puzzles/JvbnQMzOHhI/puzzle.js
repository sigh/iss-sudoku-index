// Title: Unique Sum Sudoku
// Author: I Love Sleeping & Myxo
// Video: https://www.youtube.com/watch?v=JvbnQMzOHhI
// Source: https://app.crackingthecryptic.com/sudoku/nLjQ8DjNRJ

// Digits 1-9; rows, columns, and 2x2 boxes contain no repeats. All twelve
// regions have equal sums. Each pair of rows/columns must use different sets.
const equalSumRegions = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4'],
  ['R2C1', 'R2C2', 'R2C3', 'R2C4'],
  ['R3C1', 'R3C2', 'R3C3', 'R3C4'],
  ['R4C1', 'R4C2', 'R4C3', 'R4C4'],
  ['R1C1', 'R2C1', 'R3C1', 'R4C1'],
  ['R1C2', 'R2C2', 'R3C2', 'R4C2'],
  ['R1C3', 'R2C3', 'R3C3', 'R4C3'],
  ['R1C4', 'R2C4', 'R3C4', 'R4C4'],
  ['R1C1', 'R1C2', 'R2C1', 'R2C2'],
  ['R1C3', 'R1C4', 'R2C3', 'R2C4'],
  ['R3C1', 'R3C2', 'R4C1', 'R4C2'],
  ['R3C3', 'R3C4', 'R4C3', 'R4C4'],
];
const rowColumnSets = equalSumRegions.slice(0, 8);

// Each drawn X or V is positive only: the source expressly permits unmarked
// qualifying pairs. Segment boundaries keep the separate dominoes independent.
const dominoSum = target => NFA.encodeSpec({
  startState: null,
  transition: (first, value) => {
    if (value === SEGMENT_BREAK) return first === null ? null : undefined;
    return first === null ? value : (first + value === target ? null : undefined);
  },
  accept: state => state === null,
}, 9, { multiSegment: true });
const vDomino = dominoSum(5);
const xDomino = dominoSum(10);

// The first four cells collect one four-digit set. A second-group digit outside
// it reaches the accepting state, so this NFA requires the two sets to differ.
const differentSet = NFA.encodeSpec({
  startState: { phase: 0, mask: 0 },
  transition: (state, value) => {
    if (state === 'different') return 'different';
    if (value === SEGMENT_BREAK) return state;
    const bit = 1 << (value - 1);
    if (state.phase < 3) return { phase: state.phase + 1, mask: state.mask | bit };
    if (state.phase === 3) return { phase: 'second', mask: state.mask | bit };
    return (state.mask & bit) ? state : 'different';
  },
  accept: state => state === 'different',
}, 9, { multiSegment: true });

const distinctRowColumnSets = [];
for (let a = 0; a < rowColumnSets.length; a++) {
  for (let b = a + 1; b < rowColumnSets.length; b++) {
    distinctRowColumnSets.push(new NFA(
      differentSet, 'different sets', rowColumnSets[a], rowColumnSets[b]));
  }
}

return [
  new Shape('4x4', 9),
  new EqualSum(...equalSumRegions),
  ...distinctRowColumnSets,
  new NFA(vDomino, 'V = 5', ['R1C1', 'R1C2'], ['R2C3', 'R3C3']),
  new NFA(xDomino, 'X = 10',
    ['R2C2', 'R2C3'], ['R1C4', 'R2C4'], ['R3C2', 'R4C2']),
];
