// Title: Kelowna
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=Qd8cn82k5nk
// Source: https://sudokupad.app/vrblr4abgp

// Doubler flags use 1 for normal cells and 2 for doubled cells.
// NFAs scan raw digit cells interleaved with their flag cells so value
// arithmetic can use digit * flag while Sudoku uniqueness stays on raw digits.

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const gridCells = graph.cells();
const flag = (cell) => flags.at(cell);

const interleaveFlags = (cells) => cells.flatMap(cell => [cell, flag(cell)]);

const effectiveSumCache = new Map();
const effectiveSumNFA = (total) => {
  if (effectiveSumCache.has(total)) return effectiveSumCache.get(total);
  const encoded = NFA.encodeSpec({
  startState: { phase: 0, last: 0, sum: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, last: value, sum: state.sum };
    const sum = state.sum + state.last * value;
    if (sum > total) return undefined;
    return { phase: 0, last: 0, sum };
  },
  accept: (state) => state.phase === 0 && state.sum === total,
}, 9);
  effectiveSumCache.set(total, encoded);
  return encoded;
};

const sumLineNFA = NFA.encodeSpec({
  startState: { phase: 0, last: 0, sum: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, last: value, sum: state.sum };
    const next = state.sum + state.last * value;
    if (next > 10) return undefined;
    return { phase: 0, last: 0, sum: next === 10 ? 0 : next };
  },
  accept: (state) => state.phase === 0 && state.sum === 0,
}, 9);

const blackDotValueNFA = NFA.encodeSpec({
  startState: { phase: 0, a: 0, fa: 0, b: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, a: value, fa: 0, b: 0 };
    if (state.phase === 1) return { phase: 2, a: state.a, fa: value, b: 0 };
    if (state.phase === 2) return { phase: 3, a: state.a, fa: state.fa, b: value };
    const va = state.a * state.fa;
    const vb = state.b * value;
    if (va === 2 * vb || vb === 2 * va) return { phase: 4, a: 0, fa: 0, b: 0 };
    return undefined;
  },
  accept: (state) => state.phase === 4,
}, 9);

const doubledDigitNFA = (digit) => NFA.encodeSpec({
  startState: { phase: 0, last: 0, count: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, last: value, count: state.count };
    const count = state.count + (state.last === digit && value === 2 ? 1 : 0);
    if (count > 1) return undefined;
    return { phase: 0, last: 0, count };
  },
  accept: (state) => state.phase === 0 && state.count === 1,
}, 9);

const constraints = [
  new Shape('9x9'),
  flags.toVar('doubler flags'),
  new Given('R4C1', 7),
];

for (const cell of gridCells) constraints.push(new Given(flag(cell), 1, 2));

for (let r = 1; r <= 9; r++) constraints.push(new Sum(10, ...graph.row(`R${r}C1`).map(flag)));
for (let c = 1; c <= 9; c++) constraints.push(new Sum(10, ...graph.column(`R1C${c}`).map(flag)));
for (const topLeft of ['R1C1', 'R1C4', 'R1C7', 'R4C1', 'R4C4', 'R4C7', 'R7C1', 'R7C4', 'R7C7']) {
  constraints.push(new Sum(10, ...graph.block(topLeft, 3, 3).map(flag)));
}

for (let digit = 1; digit <= 9; digit++) {
  constraints.push(new NFA(doubledDigitNFA(digit), `doubled-${digit}`, ...interleaveFlags(gridCells)));
}

const cages = [
  [13, ['R4C3', 'R4C4', 'R5C3']],
  [19, ['R3C6', 'R3C7', 'R3C8']],
  [22, ['R5C5', 'R6C4', 'R6C5', 'R7C4']],
  [26, ['R8C9', 'R9C7', 'R9C8', 'R9C9']],
];
for (const [total, cells] of cages) {
  constraints.push(new AllDifferent(...cells));
  constraints.push(new NFA(effectiveSumNFA(total), `value-sum-${total}`, ...interleaveFlags(cells)));
}

const lines = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R2C3', 'R2C2', 'R2C1', 'R3C1', 'R3C2', 'R3C3'],
  ['R4C2', 'R5C2', 'R6C2', 'R7C2'],
  ['R9C2', 'R8C2', 'R8C3', 'R8C4', 'R9C5'],
  ['R4C7', 'R4C8', 'R4C9', 'R3C9', 'R2C9', 'R2C8', 'R2C7'],
  ['R2C4', 'R3C5', 'R4C6', 'R5C7', 'R6C8', 'R7C9'],
];
for (const line of lines) constraints.push(new NFA(sumLineNFA, 'sum-line-10', ...interleaveFlags(line)));

const blackDots = [
  ['R7C1', 'R8C1'],
  ['R8C1', 'R9C1'],
  ['R4C5', 'R4C6'],
];
for (const cells of blackDots) constraints.push(new NFA(blackDotValueNFA, 'black-dot-values', ...interleaveFlags(cells)));

return constraints;
