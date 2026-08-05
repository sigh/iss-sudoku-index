// Title: Wrogn Answers Only
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=zihSVV9A4JM
// Source: https://app.crackingthecryptic.com/sudoku/4JT3tBgh32

// Normal Sudoku applies. Every shown clue is false: purple lines are not
// renbans, green lines have a pair differing by less than 5, thermometers fail
// to increase, arrows fail to sum to their circles, and all marked dominoes
// fail their usual relation. A white corner circle has a displayed digit absent
// from all four surrounding cells.

const antiRenban = NFA.encodeSpec({
  startState: { mask: 0, min: 10, max: 0, repeated: false, length: 0 },
  transition: (s, value) => {
    const bit = 1 << value;
    return {
      mask: s.mask | bit,
      min: Math.min(s.min, value),
      max: Math.max(s.max, value),
      repeated: s.repeated || Boolean(s.mask & bit),
      length: s.length + 1,
    };
  },
  accept: s => s.repeated || s.max - s.min !== s.length - 1,
  maxDepth: 4,
}, 9);

const greenLine = NFA.encodeSpec({
  startState: { previous: null, hasClosePair: false },
  transition: (s, value) => ({
    previous: value,
    hasClosePair: s.hasClosePair || (s.previous !== null && Math.abs(s.previous - value) < 5),
  }),
  accept: s => s.hasClosePair,
  maxDepth: 5,
}, 9);

const antiThermo = NFA.encodeSpec({
  startState: { previous: null, failedIncrease: false },
  transition: (s, value) => ({
    previous: value,
    failedIncrease: s.failedIncrease || (s.previous !== null && value <= s.previous),
  }),
  accept: s => s.failedIncrease,
  maxDepth: 4,
}, 9);

const whiteCircle = digits => NFA.encodeSpec({
  startState: { seen: 0 },
  transition: (s, value) => ({ seen: s.seen | (1 << value) }),
  accept: s => digits.some(digit => !(s.seen & (1 << digit))),
  maxDepth: 4,
}, 9);

const notV = Pair.fnToKey((a, b) => a + b !== 5, 9);
const notX = Pair.fnToKey((a, b) => a + b !== 10, 9);
const notConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const notRatio = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);

// Purple and green paths transcribed from their coloured strokes.
const PURPLE = [
  ['R3C3', 'R3C4', 'R4C4', 'R4C5'],
  ['R4C3', 'R5C3', 'R5C4'],
  ['R6C8', 'R5C8', 'R5C9', 'R4C9'],
];
const GREEN = [
  ['R3C1', 'R4C1', 'R5C1', 'R6C1'],
  ['R5C2', 'R6C2', 'R6C3', 'R7C3', 'R7C4'],
  ['R5C4', 'R5C5', 'R6C5'],
  ['R7C5', 'R7C6', 'R6C6', 'R6C7'],
  ['R4C7', 'R4C8', 'R3C8'],
  ['R6C8', 'R6C9', 'R7C9'],
];
const THERMOS = [
  ['R2C7', 'R1C7', 'R1C6', 'R1C5'],
  ['R9C7', 'R9C8', 'R9C9'],
];
const ARROWS = [['R1C4', 'R2C3'], ['R8C6', 'R7C7']];

// Each entry is the digits printed in one large white circle and its four cells.
const WHITE_CIRCLES = [
  [[1, 2], ['R8C2', 'R8C3', 'R9C2', 'R9C3']], [[1], ['R8C5', 'R8C6', 'R9C5', 'R9C6']],
  [[1, 9], ['R7C8', 'R7C9', 'R8C8', 'R8C9']], [[1], ['R6C3', 'R6C4', 'R7C3', 'R7C4']],
  [[1], ['R6C5', 'R6C6', 'R7C5', 'R7C6']], [[1], ['R4C3', 'R4C4', 'R5C3', 'R5C4']],
  [[4], ['R4C1', 'R4C2', 'R5C1', 'R5C2']], [[4, 7], ['R4C2', 'R4C3', 'R5C2', 'R5C3']],
  [[4], ['R3C4', 'R3C5', 'R4C4', 'R4C5']], [[2], ['R4C4', 'R4C5', 'R5C4', 'R5C5']],
  [[2], ['R5C4', 'R5C5', 'R6C4', 'R6C5']], [[2], ['R5C5', 'R5C6', 'R6C5', 'R6C6']],
  [[2, 7], ['R4C5', 'R4C6', 'R5C5', 'R5C6']], [[2, 7], ['R4C6', 'R4C7', 'R5C6', 'R5C7']],
  [[1], ['R6C1', 'R6C2', 'R7C1', 'R7C2']], [[9], ['R4C7', 'R4C8', 'R5C7', 'R5C8']],
  [[9], ['R4C8', 'R4C9', 'R5C8', 'R5C9']],
];

// Domino coordinates transcribed from the drawn V, X, white-dot, and black-dot marks.
const VS = [['R4C2', 'R4C3'], ['R5C4', 'R5C5'], ['R5C5', 'R6C5'], ['R6C6', 'R6C7'], ['R8C4', 'R9C4']];
const XS = [['R8C6', 'R9C6'], ['R8C5', 'R8C6'], ['R7C2', 'R7C3'], ['R6C7', 'R7C7'], ['R6C1', 'R6C2'], ['R6C2', 'R6C3'], ['R4C5', 'R5C5'], ['R5C5', 'R5C6'], ['R4C7', 'R4C8'], ['R4C8', 'R4C9'], ['R6C8', 'R6C9']];
const WHITE_DOTS = [['R2C1', 'R3C1'], ['R5C1', 'R6C1'], ['R6C2', 'R7C2'], ['R5C4', 'R6C4'], ['R6C4', 'R6C5'], ['R6C5', 'R6C6'], ['R5C6', 'R6C6'], ['R6C6', 'R7C6'], ['R3C8', 'R4C8'], ['R5C3', 'R5C4']];
const BLACK_DOTS = [['R7C3', 'R7C4'], ['R4C3', 'R5C3'], ['R4C5', 'R4C6'], ['R4C6', 'R5C6'], ['R5C7', 'R5C8'], ['R5C8', 'R5C9'], ['R1C4', 'R2C4']];

return [
  new Shape('9x9'),
  ...PURPLE.map((cells, i) => new NFA(antiRenban, `purple-${i + 1}`, ...cells)),
  ...GREEN.map((cells, i) => new NFA(greenLine, `green-${i + 1}`, ...cells)),
  ...THERMOS.map((cells, i) => new NFA(antiThermo, `thermo-${i + 1}`, ...cells)),
  ...ARROWS.map(([circle, arm]) => new AllDifferent(circle, arm)),
  ...WHITE_CIRCLES.map(([digits, cells], i) => new NFA(whiteCircle(digits), `circle-${i + 1}`, ...cells)),
  ...VS.map(([a, b]) => new Pair(notV, 'not-v', a, b)),
  ...XS.map(([a, b]) => new Pair(notX, 'not-x', a, b)),
  ...WHITE_DOTS.map(([a, b]) => new Pair(notConsecutive, 'not-white-dot', a, b)),
  ...BLACK_DOTS.map(([a, b]) => new Pair(notRatio, 'not-black-dot', a, b)),
];
