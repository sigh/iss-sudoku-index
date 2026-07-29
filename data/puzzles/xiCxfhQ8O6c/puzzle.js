// Title: Disjunction Function
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=xiCxfhQ8O6c
// Source: https://sudokupad.app/FdDGGJQf7R

// Normal Sudoku applies. Cage digits are distinct. The 14 cages use exactly four
// distinct totals; touching cages have different totals, and each digit occurs in
// at most one cage of each total.
// The widened alphabet supplies base-16 auxiliary total cells; grid cells remain 1-9.
const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);
const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const gridDomain = graph.makeReplicate(new Given('R1C1', ...digits));

// Cage cells transcribed from the source drawing, in its cage-array order.
const cageCells = [
  ['R7C8', 'R8C8'],
  ['R5C8', 'R6C8'],
  ['R2C7', 'R2C8'],
  ['R1C6', 'R2C6'],
  ['R2C5'],
  ['R3C3', 'R3C4', 'R3C5'],
  ['R3C2', 'R4C2', 'R5C2', 'R5C3'],
  ['R6C3', 'R6C4', 'R7C4', 'R7C5'],
  ['R7C6', 'R8C6', 'R9C6'],
  ['R8C3', 'R8C4'],
  ['R8C2', 'R9C2'],
  ['R3C6', 'R3C7'],
  ['R4C3', 'R4C4'],
  ['R4C5', 'R5C4', 'R5C5'],
];

const cageTotals = new Var('C', 'cage totals', '14x2');
const targetTotals = new Var('T', 'the four cage totals', '4x2');
const choices = new Var('L', 'cage total choices', 14);
const digitFlags = new Var('D', 'cage digit occurrences', '14x9');
const cageHigh = cageCells.map((_, i) => cageTotals.cell(i + 1, 1));
const cageLow = cageCells.map((_, i) => cageTotals.cell(i + 1, 2));
const targetHigh = [1, 2, 3, 4].map(i => targetTotals.cell(i, 1));
const targetLow = [1, 2, 3, 4].map(i => targetTotals.cell(i, 2));

// A total is 16*high + low, so two auxiliary cells cover every possible cage sum.
const cageSumEquations = cageCells.map((cells, i) => new Sum(0,
  ...cells, [cageHigh[i], -16], [cageLow[i], -1]));
const highBits = [...cageHigh, ...targetHigh].map(cell => new Given(cell, 0, 1));

const distinctPair = (highA, lowA, highB, lowB, name) => new Or([
  new AllDifferent(highA, highB),
  new AllDifferent(lowA, lowB),
]);
const equal = (a, b) => new SameValues(2, a, b);

const cageChoices = choices.cells().map((choice, i) => new Or(
  [1, 2, 3, 4].map((value, j) => new And([
    new Given(choice, value),
    equal(cageHigh[i], targetHigh[j]),
    equal(cageLow[i], targetLow[j]),
  ]))));
const targetDistinct = [0, 1, 2, 3].flatMap(i =>
  [0, 1, 2, 3].slice(i + 1).map(j =>
    distinctPair(targetHigh[i], targetLow[i], targetHigh[j], targetLow[j], 'different totals')));

const touching = cageCells.map((cells, i) => cageCells.slice(i + 1).map((other, offset) => {
  const sharesEdge = cells.some(a => other.some(b => {
    const pa = parseCellId(a), pb = parseCellId(b);
    return Math.abs(pa.row - pb.row) + Math.abs(pa.column - pb.column) === 1;
  }));
  return sharesEdge ? i + offset + 1 : null;
}).filter(j => j !== null));
const touchingDifferent = touching.flatMap((neighbours, i) => neighbours.map(j =>
  distinctPair(cageHigh[i], cageLow[i], cageHigh[j], cageLow[j], 'touching cages differ')));

const cageDistinct = cageCells.filter(cells => cells.length > 1)
  .map(cells => new AllDifferent(...cells));

// Each flag is 1 exactly when its digit appears in that cage; the machine's two
// states record the flag and whether the digit has been seen while scanning the cage.
const occurrenceMachines = digits.map(digit => NFA.encodeSpec({
  startState: { phase: 'flag' },
  transition: (state, value) => {
    if (state.phase === 'flag') {
      return value === 0 || value === 1 ? { phase: 'cage', flag: value, seen: false } : undefined;
    }
    return { phase: 'cage', flag: state.flag, seen: state.seen || value === digit };
  },
  accept: state => state.phase === 'cage' && state.flag === (state.seen ? 1 : 0),
}, shape));
const digitOccurrences = cageCells.flatMap((cells, cage) => digits.map(digit =>
  new NFA(occurrenceMachines[digit - 1], 'digit occurrence',
    [digitFlags.cell(cage + 1, digit), ...cells])));
const labelsExcept = value => [1, 2, 3, 4].filter(other => other !== value);
const noRepeatedDigitForTotal = [1, 2, 3, 4].flatMap(total => digits.flatMap(digit =>
  cageCells.flatMap((_, first) => cageCells.slice(first + 1).map((__, offset) => {
    const second = first + offset + 1;
    return new Or([
      new Given(choices.cell(first + 1), ...labelsExcept(total)),
      new Given(choices.cell(second + 1), ...labelsExcept(total)),
      new Given(digitFlags.cell(first + 1, digit), 0),
      new Given(digitFlags.cell(second + 1, digit), 0),
    ]);
  }))));

return [
  shape,
  gridDomain,
  cageTotals,
  targetTotals,
  choices,
  digitFlags,
  ...highBits,
  ...choices.cells().map(cell => new Given(cell, 1, 2, 3, 4)),
  new ContainAtLeast('1_2_3_4', ...choices.cells()),
  ...cageSumEquations,
  ...cageChoices,
  ...targetDistinct,
  ...touchingDifferent,
  ...cageDistinct,
  ...digitOccurrences,
  ...noRepeatedDigitForTotal,
];
