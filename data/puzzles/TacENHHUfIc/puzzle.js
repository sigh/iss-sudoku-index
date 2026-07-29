// Title: Lief, the Univeres, and Everythign
// Author: SSG
// Video: https://www.youtube.com/watch?v=TacENHHUfIc
// Source: https://sudokupad.app/3nkifpknc6

// Normal Sudoku applies. Every ordinary clue below is wrong, so this script
// requires the negation of its named standard rule. The comparison-sign outside
// labels and the central cage label '<42' are omitted: the rules do not define
// those signs as part of the relevant clue semantics.

const renbans = [
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1'],
  ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1'],
];
const modulars = [
  ['R1C9', 'R2C9', 'R2C8', 'R3C8'],
  ['R6C8', 'R7C8', 'R8C8'],
  ['R4C3', 'R4C4', 'R5C4'],
];
const entropics = [
  ['R4C6', 'R4C7', 'R3C7'],
  ['R6C3', 'R6C4', 'R7C4'],
];
const nabners = [
  ['R4C7', 'R3C7', 'R3C6'],
  ['R7C6', 'R7C7', 'R8C7'],
  ['R8C4', 'R8C3', 'R7C3'],
];
const parities = [
  ['R5C7', 'R5C6', 'R4C6'],
  ['R8C6', 'R8C7', 'R7C7'],
  ['R8C4', 'R7C4', 'R7C3'],
];
const thermos = [
  ['R2C2', 'R2C1', 'R1C2'], ['R1C2', 'R2C2', 'R3C2'],
  ['R1C8', 'R1C9', 'R2C9'], ['R2C8', 'R3C8', 'R3C9'],
  ['R4C3', 'R3C4'], ['R5C4', 'R4C4', 'R3C4'],
  ['R6C6', 'R6C7', 'R7C7'], ['R8C3', 'R7C3', 'R6C3'],
];
const cages42 = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9'],
  ['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],
];
const graph = cellGraph('9x9');

// State masks record the digits/classes already seen, allowing each NFA to
// express the failure of one standard line or clue rule.
const wrongRenban = NFA.encodeSpec({
  startState: 0,
  transition: (mask, value) => mask | (1 << (value - 1)),
  accept: mask => {
    let count = 0;
    let low = 9;
    let high = 0;
    for (let digit = 1; digit <= 9; digit++) {
      if (mask & (1 << (digit - 1))) {
        count++;
        low = Math.min(low, digit);
        high = Math.max(high, digit);
      }
    }
    return count !== 8 || high - low !== 7;
  },
}, 9);
const wrongModular = NFA.encodeSpec({
  startState: { previous: [], bad: false },
  transition: ({ previous, bad }, value) => {
    const residue = value % 3;
    return {
      previous: [...previous.slice(-1), residue],
      bad: bad || previous.includes(residue),
    };
  },
  accept: ({ bad }) => bad,
}, 9);
const wrongEntropic = NFA.encodeSpec({
  startState: 0,
  transition: (mask, value) => mask | (1 << Math.floor((value - 1) / 3)),
  accept: mask => mask !== 7,
}, 9);
const wrongNabner = NFA.encodeSpec({
  startState: { first: null, previous: null, bad: false },
  transition: ({ first, previous, bad }, value) => ({
    first: first === null ? value : first,
    previous: value,
    bad: bad || (first !== null && Math.abs(value - first) <= 1)
      || (previous !== null && Math.abs(value - previous) <= 1),
  }),
  accept: ({ bad }) => bad,
}, 9);
const wrongParity = NFA.encodeSpec({
  startState: { previous: null, bad: false },
  transition: ({ previous, bad }, value) => ({
    previous: value % 2,
    bad: bad || (previous !== null && previous === value % 2),
  }),
  accept: ({ bad }) => bad,
}, 9);
const wrongThermo = NFA.encodeSpec({
  startState: { previous: null, up: true, down: true },
  transition: ({ previous, up, down }, value) => ({
    previous: value,
    up: up && (previous === null || previous < value),
    down: down && (previous === null || previous > value),
  }),
  accept: ({ up, down }) => !up && !down,
}, 9);
const wrong42 = NFA.encodeSpec({
  startState: 0,
  transition: (sum, value) => Math.min(sum + value, 43),
  accept: sum => sum !== 42,
}, 9);
const wrongQuad = values => NFA.encodeSpec({
  startState: 0,
  transition: (mask, value) => {
    const bit = values.indexOf(value);
    return bit < 0 ? mask : mask | (1 << bit);
  },
  accept: mask => mask !== (1 << values.length) - 1,
}, 9);
const quad = (topLeft, values) => new NFA(wrongQuad(values), 'wrong quad',
  ...graph.block(topLeft, 2, 2));

return [
  new Shape('9x9'),
  ...renbans.map(cells => new NFA(wrongRenban, 'wrong renban', ...cells)),
  ...modulars.map(cells => new NFA(wrongModular, 'wrong modular', ...cells)),
  ...entropics.map(cells => new NFA(wrongEntropic, 'wrong entropy', ...cells)),
  ...nabners.map(cells => new NFA(wrongNabner, 'wrong Nabner', ...cells)),
  ...parities.map(cells => new NFA(wrongParity, 'wrong parity', ...cells)),
  ...thermos.map(cells => new NFA(wrongThermo, 'wrong ambiguous thermo', ...cells)),
  ...cages42.map(cells => new NFA(wrong42, 'wrong 42 cage', ...cells)),
  // Quad digit lists transcribed from the drawn corner circles.
  quad('R1C8', [2]), quad('R1C3', [8]), quad('R1C6', [3, 1]), quad('R1C1', [4]),
  quad('R7C1', [4]), quad('R7C8', [2]), quad('R8C4', [8]), quad('R8C5', [3, 1]),
  quad('R5C8', [8, 2]), quad('R5C2', [1, 9]),
];
