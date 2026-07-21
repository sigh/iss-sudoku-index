// Title: Untitled Killer
// Author: Neb
// Video: https://www.youtube.com/watch?v=GfLLGEDEHiI
// Source: https://sudokupad.app/7nnwvn08yz

// Cages are all-different and obey any displayed total. For every pair of
// cages, equal totals imply disjoint digit sets. Equivalently, the pair is
// accepted when its totals differ OR its digit sets are disjoint.

const cages = [
  [3, ['R3C3', 'R4C3']],
  [10, ['R3C4', 'R3C5']],
  [6, ['R3C6', 'R3C7']],
  [5, ['R4C7', 'R5C7']],
  [8, ['R6C7', 'R7C7']],
  [4, ['R7C5', 'R7C6']],
  [7, ['R7C3', 'R7C4']],
  [9, ['R5C3', 'R6C3']],
  [null, ['R8C1', 'R9C1']],
  [null, ['R8C2', 'R9C2']],
  [null, ['R1C1', 'R1C2']],
  [null, ['R2C1', 'R2C2']],
  [null, ['R1C8', 'R1C9', 'R2C8', 'R2C9']],
  [null, ['R8C8', 'R8C9', 'R9C8', 'R9C9']],
  [null, ['R8C6', 'R8C7']],
  [null, ['R9C6', 'R9C7']],
  [null, ['R6C1', 'R7C1']],
  [null, ['R6C2', 'R7C2']],
  [null, ['R1C3', 'R1C4']],
  [null, ['R2C3', 'R2C4']],
  [null, ['R3C8', 'R4C8']],
  [null, ['R3C9', 'R4C9']],
  [null, ['R3C2']],
  [null, ['R2C7']],
  [null, ['R7C8']],
  [null, ['R8C3']],
  [17, ['R5C5', 'R6C5']],
  [null, ['R1C5', 'R1C6', 'R1C7']],
  [null, ['R9C3', 'R9C4', 'R9C5']],
  [null, ['R2C6']],
  [null, ['R8C4']],
  [null, ['R4C1', 'R4C2', 'R5C1', 'R5C2']],
  [null, ['R5C9', 'R6C8', 'R6C9']],
];

const uniqueSumsSpec = NFA.encodeSpec({
  startState: [
    {mode: 'different-sums', phase: 'first', delta: 0},
    {mode: 'disjoint-digits', phase: 'first', seen: 0},
  ],
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) return {...state, phase: 'second'};
    if (state.mode === 'different-sums') {
      const sign = state.phase === 'first' ? 1 : -1;
      return {...state, delta: state.delta + sign * value};
    }
    const bit = 1 << value;
    if (state.phase === 'second' && (state.seen & bit)) return undefined;
    return state.phase === 'first' ? {...state, seen: state.seen | bit} : state;
  },
  accept: (state) => state.phase === 'second' &&
    (state.mode === 'disjoint-digits' || state.delta !== 0),
  // At most four cells in each cage, plus the segment break.
  maxDepth: 9,
}, 9, {multiSegment: true});

const cageConstraints = cages.flatMap(([total, cells]) => {
  if (total !== null) return [new Cage(total, ...cells)];
  return cells.length > 1 ? [new AllDifferent(...cells)] : [];
});

const uniqueSumConstraints = cages.flatMap(([, first], i) =>
  cages.slice(i + 1).map(([, second]) =>
    new NFA(uniqueSumsSpec, 'unique cage sums', first, second)));

return [
  new Shape('9x9'),
  ...cageConstraints,
  ...uniqueSumConstraints,
];
