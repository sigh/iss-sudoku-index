// Title: Oddly Enough Even Digits Help
// Author: DC
// Video: https://www.youtube.com/watch?v=flgRSDPPU5Q
// Source: https://sudokupad.app/hignojf8ll

const parityRunNFA = NFA.encodeSpec({
  startState: { parity: -1, run: 0 },
  transition: (state, value) => {
    const parity = value % 2;
    const run = parity === state.parity ? state.run + 1 : 1;
    if (run > 2) return undefined;
    return { parity, run };
  },
  accept: () => true,
}, 9);

const paritySumNFA = (target) => NFA.encodeSpec({
  startState: { parity: -1, sum: 0 },
  transition: (state, value) => {
    const parity = state.parity === -1 ? value % 2 : state.parity;
    const sum = state.sum + (value % 2 === parity ? value : 0);
    if (sum > target) return undefined;
    return { parity, sum };
  },
  accept: (state) => state.sum === target,
}, 9);

const sameParity = Pair.fnToKey((a, b) => a % 2 === b % 2, 9);
const oppositeParity = Pair.fnToKey((a, b) => a % 2 !== b % 2, 9);

const rows = [];
const columns = [];
for (let i = 1; i <= 9; i++) {
  const row = [];
  const column = [];
  for (let j = 1; j <= 9; j++) {
    row.push(makeCellId(i, j));
    column.push(makeCellId(j, i));
  }
  rows.push(row);
  columns.push(column);
}

const outsideClues = [
  [8, ['R8C1', 'R9C2']],
  [14, ['R6C1', 'R7C2', 'R8C3', 'R9C4']],
  [6, ['R2C1']],
  [20, ['R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8']],
  [16, ['R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C9']],
  [22, ['R1C3', 'R2C4', 'R3C5', 'R4C6', 'R5C7', 'R6C8', 'R7C9']],
  [22, ['R1C4', 'R2C5', 'R3C6', 'R4C7', 'R5C8', 'R6C9']],
  [22, ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1']],
  [28, ['R1C7', 'R2C6', 'R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C1']],
  [26, ['R1C8', 'R2C7', 'R3C6', 'R4C5', 'R5C4', 'R6C3', 'R7C2', 'R8C1']],
  [30, ['R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5']],
  [18, ['R6C9', 'R7C8', 'R8C7', 'R9C6']],
  [18, ['R9C6', 'R8C5', 'R7C4', 'R6C3', 'R5C2', 'R4C1']],
  [6, ['R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9']],
  [8, ['R7C9', 'R8C8', 'R9C7']],
  [10, ['R3C9', 'R4C8', 'R5C7', 'R6C6', 'R7C5', 'R8C4', 'R9C3']],
];

return [
  new Shape('9x9'),

  ...['R2C9', 'R1C1', 'R3C5', 'R5C5', 'R6C3'].map(
    cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...['R3C3', 'R8C6', 'R9C1'].map(
    cell => new Given(cell, 2, 4, 6, 8)),

  ...rows.map(row => new NFA(parityRunNFA, 'max-two-parity', ...row)),
  ...columns.map(column => new NFA(parityRunNFA, 'max-two-parity', ...column)),

  new WhiteDot('R2C7', 'R2C8'),
  new BlackDot('R1C5', 'R2C5'),
  new BlackDot('R4C2', 'R5C2'),
  new BlackDot('R4C7', 'R5C7'),
  new BlackDot('R4C9', 'R5C9'),

  ...[
    ['R1C5', 'R1C6'],
    ['R2C5', 'R2C6'],
    ['R2C1', 'R2C2'],
    ['R3C4', 'R4C4'],
    ['R5C1', 'R5C2'],
    ['R5C1', 'R6C1'],
    ['R7C2', 'R7C3'],
    ['R8C2', 'R8C3'],
    ['R7C5', 'R8C5'],
    ['R9C6', 'R9C7'],
    ['R8C7', 'R8C8'],
    ['R4C8', 'R4C9'],
  ].map(cells => new Pair(sameParity, 'same-parity', ...cells)),

  ...[
    ['R1C3', 'R2C3'],
    ['R1C8', 'R2C8'],
    ['R2C8', 'R3C8'],
    ['R3C8', 'R4C8'],
    ['R5C7', 'R6C7'],
    ['R6C6', 'R6C7'],
    ['R6C7', 'R7C7'],
    ['R6C7', 'R6C8'],
  ].map(cells => new Pair(oppositeParity, 'opposite-parity', ...cells)),

  ...outsideClues.map(([target, cells]) =>
    new NFA(paritySumNFA(target), `parity-sum-${target}`, ...cells)),
];
