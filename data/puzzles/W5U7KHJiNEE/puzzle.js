// Title: CTC Country Club
// Author: Dali
// Video: https://www.youtube.com/watch?v=W5U7KHJiNEE
// Source: https://sudokupad.app/30jk32po6i

// Each line receives one of the nine realizable singleton/pair rule masks.
// Truth flags use 1 for "satisfied" and 2 for "not satisfied".
const lines = [
  ['R1C2', 'R1C1', 'R2C1', 'R3C2', 'R4C2'],
  ['R2C2', 'R2C3', 'R1C3', 'R1C4', 'R2C4', 'R2C5'],
  ['R1C5', 'R1C6', 'R1C7', 'R2C8'],
  ['R1C8', 'R2C9', 'R3C9', 'R4C9', 'R5C8'],
  ['R5C7', 'R6C7', 'R7C7', 'R6C8'],
  ['R5C4', 'R4C5', 'R3C5', 'R3C6'],
  ['R2C6', 'R3C7', 'R4C7', 'R5C6'],
  ['R4C4', 'R5C3', 'R6C3'],
  ['R4C1', 'R5C2', 'R5C1', 'R6C1', 'R6C2'],
];

const givens = [
  ['R1C4', 5], ['R1C7', 6], ['R2C6', 9],
  ['R4C1', 3], ['R4C2', 4],
  ['R5C3', 2], ['R5C4', 1], ['R5C7', 8], ['R5C8', 7],
  ['R8C1', 1], ['R8C2', 2], ['R8C3', 3],
  ['R8C4', 4], ['R8C5', 5], ['R8C6', 6],
  ['R8C7', 7], ['R8C8', 8], ['R8C9', 9],
].map(([cell, value]) => new Given(cell, value));

const lineTypes = new Var('L', 'Line combination', 9);
const renbanFlags = new Var('R', 'Renban truth', 9);
const whisperFlags = new Var('W', 'Whisper truth', 9);
const thermoFlags = new Var('T', 'Thermo truth', 9);
const arrowFlags = new Var('A', 'Arrow truth', 9);

const truthMachine = (property, length) => NFA.encodeSpec({
  startState: { want: 0, state: null },
  transition: ({ want, state }, value) => {
    if (want === 0) {
      return value <= 2 ? { want: value, state: property.start } : undefined;
    }
    return { want, state: property.step(state, value) };
  },
  accept: ({ want, state }) => state !== null
    && want === (property.accept(state, length) ? 1 : 2),
  maxDepth: length + 1,
}, 9);

const renbanProperty = {
  start: { mask: 0, repeated: false },
  step: ({ mask, repeated }, value) => ({
    mask: mask | (1 << (value - 1)),
    repeated: repeated || (mask & (1 << (value - 1))) !== 0,
  }),
  accept: ({ mask, repeated }, length) => {
    if (repeated) return false;
    const values = Array.from({ length: 9 }, (_, i) => i + 1)
      .filter(value => mask & (1 << (value - 1)));
    return values.length === length
      && values[values.length - 1] - values[0] === length - 1;
  },
};

const whisperProperty = {
  start: { last: 0, valid: true },
  step: ({ last, valid }, value) => ({
    last: value,
    valid: valid && (last === 0 || Math.abs(value - last) >= 5),
  }),
  accept: ({ valid }) => valid,
};

// Read left-to-right, an unknown-bulb thermo is strictly decreasing to its
// bulb, then strictly increasing. Either phase may be empty (an endpoint bulb).
const thermoProperty = {
  start: { last: 0, phase: 0 }, // 0=start, 1=falling, 2=rising, 3=invalid
  step: ({ last, phase }, value) => {
    if (last === 0) return { last: value, phase };
    if (phase === 3 || value === last) return { last: value, phase: 3 };
    if (phase === 0) return { last: value, phase: value < last ? 1 : 2 };
    if (phase === 1) return { last: value, phase: value < last ? 1 : 2 };
    return { last: value, phase: value > last ? 2 : 3 };
  },
  accept: ({ phase }) => phase !== 3,
};

const propertyConstraints = (flags, label, property) => lines.map((cells, i) =>
  new NFA(
    truthMachine(property, cells.length),
    `${label} truth`,
    flags.cell(i + 1),
    ...cells,
  ));

const arrowAtMachine = (circleIndex, length, equal) => NFA.encodeSpec({
  startState: { phase: 'left', index: 0, sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'invalid') return state;
    if (state.phase === 'left' && state.index < circleIndex) {
      return { phase: 'left', index: state.index + 1, sum: Math.min(state.sum + value, 10) };
    }
    if (state.phase === 'left') {
      const leftValid = circleIndex === 0 || state.sum === value;
      if (!leftValid) return equal ? undefined : { phase: 'invalid' };
      return { phase: 'right', index: state.index + 1, circle: value, sum: 0 };
    }
    const sum = Math.min(state.sum + value, state.circle + 1);
    if (equal && sum > state.circle) return undefined;
    return { ...state, index: state.index + 1, sum };
  },
  accept: (state) => {
    if (state.phase === 'invalid') return !equal;
    if (state.phase !== 'right') return false;
    const rightValid = circleIndex === length - 1 || state.sum === state.circle;
    return equal ? rightValid : !rightValid;
  },
  maxDepth: length,
}, 9);

const arrowTruth = lines.map((cells, lineIndex) => {
  const atEachPosition = cells.map((_, circleIndex) => new NFA(
    arrowAtMachine(circleIndex, cells.length, true),
    'Arrow branch',
    ...cells,
  ));
  const atNoPosition = cells.map((_, circleIndex) => new NFA(
    arrowAtMachine(circleIndex, cells.length, false),
    'Not arrow branch',
    ...cells,
  ));
  return new Or([
    new And([new Given(arrowFlags.cell(lineIndex + 1), 1), new Or(atEachPosition)]),
    new And([new Given(arrowFlags.cell(lineIndex + 1), 2), new And(atNoPosition)]),
  ]);
});

// R+W is impossible on these 3-6 cell lines. Codes 1-9 are R, W, T, A,
// R+T, R+A, W+T, W+A, and T+A respectively.
const masks = [
  [1, 2, 2, 2], [2, 1, 2, 2], [2, 2, 1, 2], [2, 2, 2, 1],
  [1, 2, 1, 2], [1, 2, 2, 1], [2, 1, 1, 2],
  [2, 1, 2, 1], [2, 2, 1, 1],
];
const maskAssignments = lines.map((_, lineIndex) => new Or(
  masks.map(([renban, whisper, thermo, arrow], maskIndex) => new And([
    new Given(lineTypes.cell(lineIndex + 1), maskIndex + 1),
    new Given(renbanFlags.cell(lineIndex + 1), renban),
    new Given(whisperFlags.cell(lineIndex + 1), whisper),
    new Given(thermoFlags.cell(lineIndex + 1), thermo),
    new Given(arrowFlags.cell(lineIndex + 1), arrow),
  ])),
));

return [
  new Shape('9x9'),
  ...givens,
  new WhiteDot('R6C2', 'R7C2'),
  lineTypes,
  renbanFlags,
  whisperFlags,
  thermoFlags,
  arrowFlags,
  new AllDifferent(...lineTypes.cells()),
  ...maskAssignments,
  ...propertyConstraints(renbanFlags, 'Renban', renbanProperty),
  ...propertyConstraints(whisperFlags, 'Whisper', whisperProperty),
  ...propertyConstraints(thermoFlags, 'Thermo', thermoProperty),
  ...arrowTruth,
];
