// Title: Circled Killers
// Author: SparkNights
// Video: https://www.youtube.com/watch?v=dtdF-ncUOS4
// Source: https://sudokupad.app/sparknights/circled-killers

// Normal Sudoku applies. Cage sums are the one- or two-digit circled values;
// cage digits are distinct. The written digits are self-counting, and equal-
// size cages have different digit sets. The two grey lines are thermometers.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const circleTensVar = new Var('CT', 'circle-value tens digits', 19);
const circleOnesVar = new Var('CO', 'circle-value ones digits', 19);
const tens = circleTensVar.cells();
const ones = circleOnesVar.cells();

// The outlined cage cells are transcribed from the nineteen drawn cage borders.
const cages = [
  ['R1C1', 'R2C1'],
  ['R1C2'],
  ['R1C3', 'R1C4'],
  ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C7', 'R2C8', 'R2C9', 'R3C9'],
  ['R2C4', 'R2C5', 'R2C6'],
  ['R3C1', 'R3C2', 'R3C3'],
  ['R3C4', 'R3C5', 'R4C4', 'R4C5'],
  ['R3C6', 'R4C6', 'R5C6'],
  ['R3C7', 'R3C8'],
  ['R4C7', 'R4C8', 'R5C7', 'R5C8', 'R5C9', 'R6C8', 'R6C9'],
  ['R6C7', 'R7C6', 'R7C7'],
  ['R6C5', 'R7C5'],
  ['R5C4'],
  ['R4C1', 'R5C1', 'R6C1', 'R7C1', 'R7C2', 'R8C1', 'R8C2', 'R9C2'],
  ['R4C3', 'R5C3', 'R6C3'],
  ['R7C4', 'R8C4'],
  ['R8C6'],
  ['R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'],
  ['R7C8', 'R7C9', 'R8C7', 'R8C8'],
];

// The wider shape supplies a zero for a one-digit tens place; this replicate
// keeps all playable grid cells in the stated 1-9 Sudoku digit domain.
const gridDigits = graph.makeReplicate(
  new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9));
const circleDomains = [
  ...tens.map(cell => new Given(cell, 0, 1, 2, 3, 4)),
  ...ones.map(cell => new Given(cell, 1, 2, 3, 4, 5, 6, 7, 8, 9)),
];
const atMost45 = Pair.fnToKey((ten, one) => ten < 4 || (ten === 4 && one <= 5), shape);
const circleValues = cages.flatMap((cells, i) => [
  new Sum(0, ...cells, [tens[i], -10], [ones[i], -1]),
  new Pair(atMost45, 'circle value at most 45', tens[i], ones[i]),
  new AllDifferent(...cells),
]);

// For each nonzero digit, its global written-decimal count is either absent or
// equals that digit. The scan covers every tens and ones place exactly once.
function digitCountMachine(digit) {
  return NFA.encodeSpec({
    startState: 0,
    transition: (count, value) => {
      const next = count + (value === digit ? 1 : 0);
      return next <= digit ? next : undefined;
    },
    accept: count => count === 0 || count === digit,
    maxDepth: 38,
  }, shape);
}
const writtenDigits = [...tens, ...ones];
const selfCounts = Array.from({length: 9}, (_, i) => {
  const digit = i + 1;
  return new NFA(digitCountMachine(digit), `written ${digit} count`, writtenDigits);
});

// The first segment's digit set is a bit mask. With equal cage sizes and cage
// distinctness, the second set differs exactly when it has a digit outside it.
const differentSetMachine = NFA.encodeSpec({
  startState: {phase: 'left', left: 0, different: false},
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return state.phase === 'left' ? {...state, phase: 'right'} : undefined;
    }
    const bit = 1 << (value - 1);
    return state.phase === 'left'
      ? {...state, left: state.left | bit}
      : {...state, different: state.different || !(state.left & bit)};
  },
  accept: state => state.phase === 'right' && state.different,
  maxDepth: 17,
}, shape, {multiSegment: true});
const differentCombinations = cages.flatMap((left, i) =>
  cages.slice(i + 1).filter(right => right.length === left.length).map(right =>
    new NFA(differentSetMachine, 'different same-size cage combination', left, right)));

return [
  shape,
  circleTensVar,
  circleOnesVar,
  gridDigits,
  ...circleDomains,
  ...circleValues,
  ...selfCounts,
  ...differentCombinations,
  new Thermo('R2C8', 'R1C9', 'R1C8', 'R1C7'),
  new Thermo('R8C7', 'R8C8'),
];
