// Title: Happy birthday, sujoyku!
// Author: sujoyku and friends (Ft: Calvinball, ChinStrap, gdc, mellowrobinson, MSDOS, Nordy, SamuPiano, and sujoyku)
// Video: https://www.youtube.com/watch?v=eP7ty0Ys_yg
// Source: https://sudokupad.app/s6pgqi6msp

// For an Odd Lots clue, the first cell is the circle and its digit is the
// target number of odd digits on the complete connected line.
const oddLotsMachine = NFA.encodeSpec({
  startState: { phase: 'circle' },
  transition: (state, value) => {
    if (state.phase === 'circle') {
      return {
        phase: 'line',
        target: value,
        count: value % 2,
      };
    }
    const count = state.count + value % 2;
    return count <= state.target
      ? { phase: 'line', target: state.target, count }
      : undefined;
  },
  accept: (state) => state.phase === 'line' && state.count === state.target,
  maxDepth: 9,
}, 9);

// The Split Peas stream is [circle, five inner cells, circle]. The inner sum
// must equal the two circled digits in either tens/units orientation.
const splitPeasMachine = NFA.encodeSpec({
  startState: { pos: 0, first: 0, sum: 0, valid: false },
  transition: (state, value) => {
    if (state.pos === 0) {
      return { pos: 1, first: value, sum: 0, valid: false };
    }
    if (state.pos <= 5) {
      return {
        pos: state.pos + 1,
        first: state.first,
        sum: state.sum + value,
        valid: false,
      };
    }
    if (state.pos === 6) {
      const valid = state.sum === 10 * state.first + value
        || state.sum === 10 * value + state.first;
      return valid
        ? { pos: 7, first: state.first, sum: state.sum, valid: true }
        : undefined;
    }
    return undefined;
  },
  accept: (state) => state.pos === 7 && state.valid,
  maxDepth: 7,
}, 9);

const blueRegionSumLine = [
  'R4C2', 'R4C1', 'R5C1', 'R6C1', 'R7C1',
  'R8C1', 'R9C1', 'R9C2', 'R9C3',
];

const orangeLines = [
  ['R1C4', 'R2C4', 'R2C5', 'R2C6'],
  ['R4C7', 'R4C6', 'R5C6', 'R5C5'],
  ['R7C4', 'R8C4', 'R8C5', 'R7C5'],
];

const cages = [
  [15, 'R1C3', 'R1C4'],
  [21, 'R1C5', 'R1C6', 'R2C6'],
  [22, 'R2C8', 'R2C9', 'R3C9'],
  [22, 'R6C3', 'R7C3', 'R7C4'],
  [22, 'R6C6', 'R7C5', 'R7C6'],
  [22, 'R7C9', 'R8C8', 'R8C9'],
];

return [
  new Shape('9x9'),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
  ...orangeLines.map(cells => new Whisper(4, ...cells)),
  new RegionSumLine(...blueRegionSumLine),
  new NFA(oddLotsMachine, 'odd-lot count', ...blueRegionSumLine),
  new NFA(oddLotsMachine, 'odd-lot count', ...orangeLines[1]),
  new NFA(
    splitPeasMachine,
    'split peas',
    'R6C8', 'R7C8', 'R7C7', 'R8C7', 'R8C6', 'R9C6', 'R9C7'),
];
