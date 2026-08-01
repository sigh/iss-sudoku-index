// Title: Aesthete
// Author: Lizzy01
// Video: https://www.youtube.com/watch?v=ZH6wQN5kjUI
// Source: https://app.crackingthecryptic.com/k763dyf84l

// Normal Sudoku rules apply. The drawn light-grey lines are thermometers, read
// from their circular bulbs. Nine unmarked doubler cells occupy one per row,
// column and box and contain the digits 1-9 once each; their values are doubled.
const graph = cellGraph('9x9');
const doublers = graph.makeOverlay('VD');
const flag = cell => doublers.at(cell);
const interleave = cells => cells.flatMap(cell => [cell, flag(cell)]);

// The states alternate between a grid digit and its 1/2 multiplier, retaining
// the preceding effective value so each thermometer step can be checked.
const thermoMachine = NFA.encodeSpec({
  startState: { phase: 'digit', previous: null },
  transition: ({ phase, previous, digit }, value) => {
    if (phase === 'digit') return { phase: 'flag', previous, digit: value };
    const effective = digit * value;
    return previous === null || previous < effective
      ? { phase: 'digit', previous: effective }
      : undefined;
  },
  accept: ({ phase }) => phase === 'digit',
}, 9);

// For each digit, this machine reads all (digit, flag) pairs and accepts exactly
// one pair whose digit is the target and whose flag is 2.
const doublerDigitMachine = target => NFA.encodeSpec({
  startState: { phase: 'digit', matches: 0 },
  transition: ({ phase, matches, digit }, value) => {
    if (phase === 'digit') return { phase: 'flag', matches, digit: value };
    const next = matches + (digit === target && value === 2 ? 1 : 0);
    return next <= 1 ? { phase: 'digit', matches: next } : undefined;
  },
  accept: ({ phase, matches }) => phase === 'digit' && matches === 1,
  maxDepth: 162,
}, 9);

const thermometers = [
  ['R1C7', 'R2C7', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R6C8'],
  ['R1C8', 'R2C8', 'R3C8', 'R4C8'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C9'],
  ['R2C5', 'R2C4', 'R3C5'],
  ['R5C6', 'R6C5', 'R7C6', 'R8C7'],
  ['R5C5', 'R5C4', 'R4C4'],
  ['R5C1', 'R4C1'],
  ['R8C4', 'R8C5'],
  ['R8C2', 'R9C1'],
  ['R6C3', 'R7C2', 'R7C1', 'R6C2', 'R5C3', 'R4C2', 'R3C1', 'R2C2', 'R1C3'],
];

return [
  new Shape('9x9'),
  doublers.toVar('doubler multipliers'),
  doublers.makeReplicate(new Given(doublers.cells()[0], 1, 2)),
  ...[...Array(9).keys()].flatMap(index => [
    new Regex('1*21*', ...doublers.row(index + 1)),
    new Regex('1*21*', ...doublers.column(index + 1)),
    new Regex('1*21*', ...doublers.boxes()[index]),
  ]),
  ...thermometers.map(cells => new NFA(thermoMachine, 'doubled thermo', ...interleave(cells))),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(target =>
    new NFA(doublerDigitMachine(target), `doubler digit ${target}`, ...interleave(graph.cells()))),
];
