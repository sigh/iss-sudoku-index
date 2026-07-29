// Title: Hot and Cold
// Author: Empy Claw
// Video: https://www.youtube.com/watch?v=sVbb4gYqcFs
// Source: https://app.crackingthecryptic.com/PrHjg2jqqF

// Normal Sudoku applies. Each outlined cage has one deduced state: hot (1,
// positive digit values) or cold (2, negative digit values). Digits may repeat
// in cages. The NFAs below interleave each cell's cage state and digit to apply
// the signed thermometer and V/X rules.
const cageCells = [
  ['R7C7', 'R7C8', 'R8C7', 'R8C8'],
  ['R3C8', 'R4C8', 'R5C8', 'R5C9', 'R6C8', 'R6C9', 'R7C9'],
  ['R7C1', 'R7C2', 'R8C1', 'R8C2'],
  ['R8C3', 'R8C4', 'R9C3', 'R9C4'],
  ['R5C3'],
  ['R5C1', 'R6C1'],
  ['R5C4', 'R6C3', 'R6C4'],
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R3C4', 'R3C5', 'R4C4'],
  ['R1C8', 'R2C5', 'R2C6', 'R2C7', 'R2C8'],
  ['R4C6', 'R4C7', 'R5C6', 'R6C6'],
  ['R6C5'],
  ['R7C4', 'R7C5'],
  ['R8C5', 'R9C5', 'R9C6', 'R9C7', 'R9C8'],
  ['R7C6'],
];
// Cage cells transcribed from the fourteen drawn outlines.
const cageSigns = new Var('H', 'hot/cold cage states', 14);
const signFor = Object.fromEntries(cageCells.flatMap((cells, index) =>
  cells.map(cell => [cell, cageSigns.cell(index + 1)])));
const signedStream = (cells) => cells.flatMap(cell => [signFor[cell], cell]);

// Each cage's one sign state applies to every digit inside its drawn outline.
const cageStateNFA = NFA.encodeSpec({
  startState: 0,
  transition: (phase, value) => {
    if (phase === 0) return value === 1 || value === 2 ? 1 : undefined;
    return 0;
  },
  accept: phase => phase === 0,
}, 9);

// State 1 means positive and 2 means negative. The machine remembers the prior
// signed digit while reading a bulb-first thermometer.
const thermoNFA = NFA.encodeSpec({
  startState: { phase: 0, sign: 0, previous: null },
  transition: ({ phase, sign, previous }, value) => {
    if (phase === 0) {
      if (value !== 1 && value !== 2) return undefined;
      return { phase: 1, sign: value === 1 ? 1 : -1, previous };
    }
    const signed = sign * value;
    if (previous !== null && signed <= previous) return undefined;
    return { phase: 0, sign: 0, previous: signed };
  },
  accept: ({ phase, previous }) => phase === 0 && previous !== null,
}, 9);

// This four-symbol machine reads sign/digit/sign/digit and requires their signed
// sum to have the stated absolute value.
const signedSumNFA = (target) => NFA.encodeSpec({
  startState: { phase: 0, sign: 0, total: 0 },
  transition: ({ phase, sign, total }, value) => {
    if (phase === 0 || phase === 2) {
      if (value !== 1 && value !== 2) return undefined;
      return { phase: phase + 1, sign: value === 1 ? 1 : -1, total };
    }
    if (phase !== 1 && phase !== 3) return undefined;
    const nextTotal = total + sign * value;
    return { phase: phase + 1, sign: 0, total: nextTotal };
  },
  accept: ({ phase, total }) => phase === 4 && Math.abs(total) === target,
}, 9);

const thermometers = [
  ['R7C9', 'R6C9', 'R5C9', 'R4C8', 'R3C8', 'R2C8', 'R1C8'],
  ['R2C1', 'R1C2', 'R1C3', 'R2C3', 'R3C4', 'R4C4', 'R5C4', 'R6C3'],
  ['R9C4', 'R8C3', 'R8C2', 'R7C1', 'R6C1', 'R5C1'],
  ['R6C5', 'R7C5', 'R7C4'],
  ['R9C7', 'R9C8'],
];
// The five grey bulb-first paths from the drawn thermometers.
const vEdges = [
  ['R7C8', 'R8C8'], ['R7C7', 'R8C7'], ['R5C8', 'R6C8'], ['R7C8', 'R7C9'],
  ['R4C7', 'R4C8'], ['R5C3', 'R6C3'], ['R6C5', 'R6C6'], ['R8C4', 'R8C5'],
];
const xEdges = [['R2C5', 'R3C5'], ['R7C6', 'R7C7']];
// These are the drawn V and X edge marks; absent marks carry no negative rule.

return [
  new Shape('9x9'),
  cageSigns,
  ...cageSigns.cells().map(cell => new Given(cell, 1, 2)),
  ...cageCells.map(cells => new NFA(cageStateNFA, 'cage sign', ...signedStream(cells))),
  ...thermometers.map(cells => new NFA(thermoNFA, 'signed thermometer', ...signedStream(cells))),
  ...vEdges.map(cells => new NFA(signedSumNFA(5), 'signed V', ...signedStream(cells))),
  ...xEdges.map(cells => new NFA(signedSumNFA(10), 'signed X', ...signedStream(cells))),
];
