// Title: Dutch Flat Mates: Prison Break!
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=_ID6vxLaySA
// Source: https://sudokupad.app/3qz1km5o1d

// Normal sudoku rules apply. The grid wraps at its top and bottom edges.
// Every cell has either a digit at least 4 greater immediately below it or a
// digit at least 4 smaller immediately above it. The first two cells are
// repeated at the end of each column scan so the NFA checks the wraparound
// triples centred on R9 and R1 as well.
const dutchCellmatesSpec = NFA.encodeSpec({
  startState: { phase: 'start', previous: null, current: null },
  transition: (state, value) => {
    if (state.phase === 'start') {
      return { phase: 'one', previous: value, current: null };
    }
    if (state.phase === 'one') {
      return { phase: 'scan', previous: state.previous, current: value };
    }

    const hasGreaterBelow = value >= state.current + 4;
    const hasSmallerAbove = state.previous <= state.current - 4;
    if (!hasGreaterBelow && !hasSmallerAbove) return undefined;
    return { phase: 'scan', previous: state.current, current: value };
  },
  accept: state => state.phase === 'scan',
}, 9);

const wraparoundColumns = Array.from({ length: 9 }, (_, colIndex) => {
  const col = colIndex + 1;
  const cells = Array.from({ length: 9 }, (_, rowIndex) =>
    makeCellId(rowIndex + 1, col));
  return new NFA(
    dutchCellmatesSpec,
    'Dutch cellmates (wraparound)',
    ...cells,
    cells[0],
    cells[1],
  );
});

// Each entry contains the two separately outlined cages joined by a chain.
// EqualSum compares their totals; AllDifferent supplies the killer-cage
// no-repeat rule for each cage that contains more than one cell.
const chainedCagePairs = [
  [['R3C3'], ['R4C4', 'R5C4', 'R6C4']],
  [['R3C6'], ['R4C7']],
  [['R5C9', 'R6C9'], ['R6C1', 'R7C1']],
];

const chainedCageSums = chainedCagePairs.map(
  ([first, second]) => new EqualSum(first, second));
const killerNoRepeats = chainedCagePairs
  .flat()
  .filter(cage => cage.length > 1)
  .map(cage => new AllDifferent(...cage));

return [
  new Shape('9x9'),
  ...wraparoundColumns,
  ...chainedCageSums,
  ...killerNoRepeats,
];
