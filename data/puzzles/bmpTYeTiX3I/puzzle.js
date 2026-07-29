// Title: Double Date
// Author: Malrog & Tallcat
// Video: https://www.youtube.com/watch?v=bmpTYeTiX3I
// Source: https://app.crackingthecryptic.com/f0sif99oqy

// Standard Sudoku. For cage, renban, and arrow values, exactly two 2s, four
// 4s, and five 5s are doubled. Cages use effective-value sums and distinct raw
// digits; purple lines are effective-value renbans; arrow arms sum to circles.
// Cage, line, and arrow coordinates are transcribed from the drawn clues.
const graph = cellGraph('9x9');
const cells = graph.cells();
const modifiers = graph.makeOverlay('VD');
const flag = cell => modifiers.at(cell);
const stream = clueCells => clueCells.flatMap(cell => [cell, flag(cell)]);

const flags = modifiers.at(cells);
const flagOrigin = flags[0];

// The flag follows its raw digit: 1 is ordinary and 2 doubles it. Only 2, 4,
// and 5 may be doubled; the digit-count NFAs below select the stated numbers.
const permittedModifier = Pair.fnToKey((digit, state) =>
  state === 1 || [2, 4, 5].includes(digit), 9);

function doubledCountSpec(target, required) {
  return NFA.encodeSpec({
    startState: { phase: 0, digit: 0, count: 0 },
    transition: (state, value) => {
      if (state.phase === 0) return { phase: 1, digit: value, count: state.count };
      const count = state.count + (state.digit === target && value === 2 ? 1 : 0);
      return count > required ? undefined : { phase: 0, digit: 0, count };
    },
    accept: state => state.phase === 0 && state.count === required,
    maxDepth: 162,
  }, 9);
}

const sumCache = new Map();
function effectiveSumSpec(total) {
  if (sumCache.has(total)) return sumCache.get(total);
  const spec = NFA.encodeSpec({
    startState: { phase: 0, digit: 0, sum: 0 },
    transition: (state, value) => {
      if (state.phase === 0) return { phase: 1, digit: value, sum: state.sum };
      const sum = state.sum + state.digit * value;
      return sum > total ? undefined : { phase: 0, digit: 0, sum };
    },
    accept: state => state.phase === 0 && state.sum === total,
  }, 9);
  sumCache.set(total, spec);
  return spec;
}

const renbanCache = new Map();
function effectiveRenbanSpec(length) {
  if (renbanCache.has(length)) return renbanCache.get(length);
  const spec = NFA.encodeSpec({
    startState: { phase: 0, digit: 0, count: 0, min: 11, max: 0, seen: 0 },
    transition: (state, value) => {
      if (state.phase === 0) {
        return { ...state, phase: 1, digit: value };
      }
      const effective = state.digit * value;
      const bit = 1 << effective;
      if (state.seen & bit) return undefined;
      const count = state.count + 1;
      const min = Math.min(state.min, effective);
      const max = Math.max(state.max, effective);
      if (count > length || max - min >= length) return undefined;
      return { phase: 0, digit: 0, count, min, max, seen: state.seen | bit };
    },
    accept: state => state.phase === 0 && state.count === length && state.max - state.min === length - 1,
    maxDepth: length * 2,
  }, 9);
  renbanCache.set(length, spec);
  return spec;
}

const arrowCache = new Map();
function effectiveArrowSpec(length) {
  if (arrowCache.has(length)) return arrowCache.get(length);
  const spec = NFA.encodeSpec({
    startState: { phase: 0, digit: 0, position: 0, remaining: 0 },
    transition: (state, value) => {
      if (state.phase === 0) {
        return { ...state, phase: 1, digit: value };
      }
      const remaining = state.position === 0
        ? state.digit * value
        : state.remaining - state.digit * value;
      if (remaining < 0) return undefined;
      return {
        phase: 0,
        digit: 0,
        position: state.position + 1,
        remaining,
      };
    },
    accept: state => state.phase === 0 && state.position === length && state.remaining === 0,
    maxDepth: length * 2,
  }, 9);
  arrowCache.set(length, spec);
  return spec;
}

const cages = [
  [45, ['R1C3', 'R1C4', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3', 'R4C1']],
  [7, ['R1C7', 'R1C8', 'R1C9']],
  [21, ['R5C9', 'R6C8', 'R6C9']],
  [28, ['R8C5', 'R9C4', 'R9C5', 'R9C6']],
  [27, ['R7C1', 'R8C1', 'R9C1']],
];
const renbans = [
  ['R9C3', 'R8C3', 'R7C4', 'R7C5'],
  ['R8C7', 'R9C7', 'R9C8'],
  ['R2C1', 'R1C1', 'R1C2'],
  ['R2C2', 'R3C3', 'R4C4'],
];
const arrows = [
  ['R7C2', 'R6C3', 'R5C3'], ['R7C2', 'R6C1', 'R5C2'],
  ['R4C5', 'R5C5', 'R6C5'], ['R4C7', 'R5C6', 'R6C6'],
  ['R2C6', 'R3C7', 'R3C8', 'R4C9'],
];

return [
  new Shape('9x9'),
  modifiers.toVar('double-date flags'),
  modifiers.makeReplicate(new Given(flagOrigin, 1, 2), flags),
  ...cells.map(cell => new Pair(permittedModifier, 'valid doubler', cell, flag(cell))),
  ...[[2, 2], [4, 4], [5, 5]].map(([digit, count]) =>
    new NFA(doubledCountSpec(digit, count), `doubled-${digit}`, ...stream(cells))),
  ...cages.flatMap(([total, cageCells]) => [
    new AllDifferent(...cageCells),
    new NFA(effectiveSumSpec(total), `cage-${total}`, ...stream(cageCells)),
  ]),
  ...renbans.map(line => new NFA(
    effectiveRenbanSpec(line.length), `renban-${line.length}`, ...stream(line))),
  ...arrows.map(([circle, ...arms]) => new NFA(
    effectiveArrowSpec(arms.length + 1), `arrow-${arms.length}`, ...stream([circle, ...arms]))),
];
