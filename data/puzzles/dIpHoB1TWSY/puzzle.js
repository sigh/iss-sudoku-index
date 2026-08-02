// Title: Menage a Trois
// Author: Die Hard
// Video: https://www.youtube.com/watch?v=dIpHoB1TWSY
// Source: https://app.crackingthecryptic.com/ifd8mehebc

// Normal Sudoku applies. The marked diagonal has no repeats; outlined cages
// sum to their labels; every grey line is split into at least two adjacent groups
// of one line-specific N, and the eleven N values are all different.
const nLines = [
  ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'],
  ['R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8'],
  ['R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8'],
  ['R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8'],
  ['R4C8', 'R4C9', 'R5C9'],
  ['R1C7', 'R2C6', 'R3C7'],
  ['R1C9', 'R2C9', 'R3C9'],
  ['R7C9', 'R8C9', 'R9C9'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R1C1', 'R2C2', 'R3C3'],
  ['R3C2', 'R4C2', 'R5C2'],
];
const cages = [
  [9, 'R5C1', 'R5C2', 'R5C3'], [16, 'R2C7', 'R2C8'],
  [16, 'R7C2', 'R7C3'], [20, 'R9C6', 'R9C7', 'R9C8'],
  [15, 'R8C4', 'R8C5'], [10, 'R6C6', 'R6C7'], [11, 'R2C3', 'R2C4'],
];

// These one-hot Vars name each line's otherwise unprinted N. N cannot exceed 22:
// an eight-cell row segment has total at most 44 and must have at least two groups.
const nValues = Array.from({length: 22}, (_, i) => i + 1);
const nVars = 'ABCDEFGHIJK'.split('').map((prefix, line) =>
  new Var(prefix, `N-sum choices for line ${line + 1}`, 22));
const choice = (line, n) => nVars[line].cell(n);
const nChoices = nLines.map((_, line) => nValues.map(n => choice(line, n)));
const nChoiceDomains = nChoices.flat().map(cell => new Given(cell, 1, 2));

// A selected option fixes its one-hot cell to 2. Its Sum total is a multiple of N
// with multiplier at least 2, so SumLine's N-sized segments number at least two.
const nLineRules = nLines.map((cells, line) => new Or(nValues.map(n =>
  new And([
    new Given(choice(line, n), 2),
    new Or(Array.from({length: Math.floor(cells.length * 9 / n) - 1}, (_, i) =>
      new And([new SumLine(n, ...cells), new Sum((i + 2) * n, ...cells)]))),
  ])
)));
const oneNPerLine = nChoices.map(cells => new ContainExact('2', ...cells));
// State 0/1 records whether an N has already been selected while scanning lines;
// a second 2 rejects, which implements the different-N requirement.
const atMostOneSelected = NFA.encodeSpec({
  startState: 0,
  transition: (seen, value) => value === 2 ? (seen ? undefined : 1) : seen,
  accept: () => true,
}, 9);
const noRepeatedN = nValues.map(n => new NFA(
  atMostOneSelected, 'different N values', ...nLines.map((_, line) => choice(line, n))));

return [
  new Shape('9x9'),
  // The rules say "the marked diagonal" without naming it; the drawn mark is the
  // rising '/' one, R9C1 to R1C9. Diagonal(1) is that '/' option.
  new Diagonal(1),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...nVars,
  ...nChoiceDomains,
  ...nLineRules,
  ...oneNPerLine,
  ...noRepeatedN,
];
