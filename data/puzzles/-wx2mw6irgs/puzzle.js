// Title: Now the People Will Know We Were Here
// Author: ViKingPrime
// Video: https://www.youtube.com/watch?v=-wx2mw6irgs
// Source: https://app.crackingthecryptic.com/7m8l0f0m4a

// Standard Sudoku. VH states are Hot (1), Cold (2), or ordinary (3). Every
// Hot/Cold placement and digit-set rule is encoded. Kropki, pink Renban, and
// gold Nabner clues use effective values: digit +1, digit -1, or digit.
// Line and dot coordinates are transcribed from the drawn clue geometry.
const HOT = 1;
const COLD = 2;
const ORDINARY = 3;
const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VH');
const cells = graph.cells();
const flag = cell => flags.at(cell);
const stream = clueCells => clueCells.flatMap(cell => [cell, flag(cell)]);
const effective = (digit, role) => digit + (role === HOT ? 1 : role === COLD ? -1 : 0);

function roleDigitSpec(digit, role) {
  return NFA.encodeSpec({
    startState: { phase: 0, raw: 0, count: 0 },
    transition: (state, value) => {
      if (state.phase === 0) return {phase: 1, raw: value, count: state.count};
      const count = state.count + (state.raw === digit && value === role ? 1 : 0);
      return count > 1 ? undefined : {phase: 0, raw: 0, count};
    },
    accept: state => state.phase === 0 && state.count === 1,
    maxDepth: 162,
  }, 9);
}

const dotCache = new Map();
function dotSpec(kind) {
  if (dotCache.has(kind)) return dotCache.get(kind);
  const spec = NFA.encodeSpec({
    startState: {phase: 0, raw: 0, left: 0},
    transition: (state, value) => {
      if (state.phase === 0) return {phase: 1, raw: value, left: state.left};
      if (state.phase === 1) return {phase: 2, left: effective(state.raw, value)};
      if (state.phase === 2) return {phase: 3, raw: value, left: state.left};
      const right = effective(state.raw, value);
      const valid = kind === 'white'
        ? Math.abs(state.left - right) === 1
        : state.left === 2 * right || right === 2 * state.left;
      return valid ? {phase: 4, raw: 0, left: 0} : undefined;
    },
    accept: state => state.phase === 4,
    maxDepth: 4,
  }, 9);
  dotCache.set(kind, spec);
  return spec;
}

const setCache = new Map();
function setSpec(kind, length) {
  const key = `${kind}-${length}`;
  if (setCache.has(key)) return setCache.get(key);
  const spec = NFA.encodeSpec({
    startState: {phase: 0, raw: 0, count: 0, min: 12, max: -1, seen: 0},
    transition: (state, value) => {
      if (state.phase === 0) return {...state, phase: 1, raw: value};
      const valueEffective = effective(state.raw, value);
      const bit = 1 << valueEffective;
      if (state.seen & bit) return undefined;
      if (kind === 'nabner' && ((state.seen & (1 << (valueEffective - 1))) || (state.seen & (1 << (valueEffective + 1))))) return undefined;
      const count = state.count + 1;
      const min = Math.min(state.min, valueEffective);
      const max = Math.max(state.max, valueEffective);
      if (count > length || (kind === 'renban' && max - min >= length)) return undefined;
      return {phase: 0, raw: 0, count, min, max, seen: state.seen | bit};
    },
    accept: state => state.phase === 0 && state.count === length &&
      (kind === 'renban' ? state.max - state.min === length - 1 : true),
    maxDepth: length * 2,
  }, 9);
  setCache.set(key, spec);
  return spec;
}

const whiteDots = [
  ['R4C6', 'R4C7'], ['R4C3', 'R4C4'], ['R3C6', 'R4C6'],
  ['R6C7', 'R7C7'], ['R6C3', 'R7C3'], ['R8C2', 'R8C3'],
];
const blackDots = [['R3C5', 'R4C5'], ['R1C5', 'R2C5'], ['R7C7', 'R7C8']];
const renbans = [
  ['R6C4', 'R5C4', 'R5C5'], ['R6C5', 'R6C6', 'R5C6'],
  ['R1C5', 'R1C6', 'R1C7', 'R2C7'],
  ['R5C7', 'R6C7', 'R6C8', 'R6C9', 'R5C9', 'R5C8'],
  ['R5C1', 'R6C1', 'R6C2', 'R6C3', 'R5C3', 'R5C2'],
];
const nabners = [
  ['R4C1', 'R4C2', 'R4C3'], ['R4C7', 'R4C8', 'R4C9'], ['R4C4', 'R4C5', 'R4C6'],
  ['R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7'], ['R8C3', 'R8C4', 'R9C4'],
  ['R9C6', 'R8C6', 'R8C7', 'R8C8'], ['R7C8', 'R7C9', 'R8C9'],
  ['R8C1', 'R7C1', 'R7C2'], ['R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'],
  ['R2C4', 'R3C4', 'R3C5', 'R3C6', 'R2C6', 'R2C5'],
];
const units = flags.at([...graph.rows(), ...graph.columns(), ...graph.boxes()]);

return [
  new Shape('9x9'),
  flags.toVar('hot-cold roles'),
  flags.makeReplicate(new Given(flags.cells()[0], HOT, COLD, ORDINARY)),
  ...units.map(unit => new ContainExact('1_2', ...unit)),
  ...[HOT, COLD].flatMap(role => Array.from({length: 9}, (_, i) =>
    new NFA(roleDigitSpec(i + 1, role), `${role === HOT ? 'hot' : 'cold'}-${i + 1}`, ...stream(cells)))),
  ...whiteDots.map(pair => new NFA(dotSpec('white'), 'white-dot', ...stream(pair))),
  ...blackDots.map(pair => new NFA(dotSpec('black'), 'black-dot', ...stream(pair))),
  ...renbans.map(line => new NFA(setSpec('renban', line.length), `renban-${line.length}`, ...stream(line))),
  ...nabners.map(line => new NFA(setSpec('nabner', line.length), `nabner-${line.length}`, ...stream(line))),
];
