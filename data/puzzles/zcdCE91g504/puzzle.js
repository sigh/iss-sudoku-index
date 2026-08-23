// Title: Californian Mountain Snake
// Author: Video Floral
// Video: https://www.youtube.com/watch?v=zcdCE91g504
// Source: https://app.crackingthecryptic.com/sudoku/HQ76Db67Qg

// Standard Sudoku applies. Cells have two shades; each shade is connected,
// no 2x2 is monochromatic, and R7C9 is shaded. On the drawn red line, each
// same-shade run is a non-repeating consecutive set and shade changes differ
// by at least 5.

const SHADED = 1;
const UNSHADED = 2;
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');

const redLine = [
  'R8C9', 'R8C8', 'R9C7', 'R8C6', 'R7C7', 'R6C7', 'R5C6', 'R6C5',
  'R6C4', 'R7C4', 'R8C4', 'R8C3', 'R7C2', 'R6C1', 'R5C2', 'R4C1',
  'R3C2', 'R2C3', 'R1C2', 'R2C1', 'R2C2', 'R3C1', 'R4C2', 'R3C3',
  'R2C4', 'R1C5', 'R2C6', 'R2C7', 'R3C7', 'R3C8', 'R2C9', 'R1C9',
  'R1C8', 'R2C8', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9',
];

// The red-line list is the payload's drawn walk order.

// This machine reads alternating shade and digit cells. Its set records the
// current same-shade run, which is checked whenever the shade changes.
const redLineMachine = NFA.encodeSpec({
  startState: { phase: 'shade', shade: null, digits: [] },
  transition: (state, value) => {
    if (state.phase === 'shade') {
      if (value !== SHADED && value !== UNSHADED) return undefined;
      if (state.shade === null) {
        return { phase: 'digit', shade: value, digits: [] };
      }
      if (value === state.shade) {
        return { ...state, phase: 'digit' };
      }
      const consecutive = state.digits.length > 0 &&
        state.digits.at(-1) - state.digits[0] + 1 === state.digits.length;
      if (!consecutive) return undefined;
      return {
        phase: 'digit', shade: value, digits: [],
      };
    }
    if (state.digits.includes(value)) return undefined;
    return {
      phase: 'shade', shade: state.shade,
      digits: [...state.digits, value].sort((a, b) => a - b),
    };
  },
  accept: state => state.phase === 'shade' && state.digits.length > 0 &&
    state.digits.at(-1) - state.digits[0] + 1 === state.digits.length,
}, 9);

const interleavedRedLine = redLine.flatMap(cell => [shade.at(cell), cell]);

// This four-symbol machine applies the other red-line clause to one adjacent
// pair: different shades require the two intervening digits to differ by 5.
const shadeChangeMachine = NFA.encodeSpec({
  startState: { phase: 0, firstShade: null, firstDigit: null },
  transition: (state, value) => {
    if (state.phase === 0) {
      return value === SHADED || value === UNSHADED
        ? { phase: 1, firstShade: value, firstDigit: null } : undefined;
    }
    if (state.phase === 1) {
      return { phase: 2, firstShade: state.firstShade, firstDigit: value };
    }
    if (state.phase === 2) {
      return value === SHADED || value === UNSHADED
        ? { ...state, phase: 3, secondShade: value } : undefined;
    }
    if (state.phase === 3) {
      return state.firstShade === state.secondShade ||
          Math.abs(state.firstDigit - value) >= 5
        ? { phase: 4 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 4,
}, 9);
const redLinePairs = redLine.slice(0, -1).map((cell, index) => [
  shade.at(cell), cell, shade.at(redLine[index + 1]), redLine[index + 1],
]);

return [
  new Shape('9x9'),
  new YinYang(),
  new Given('R1C8', 5),
  new Given('R9C9', 1),
  new Given(shade.at('R7C9'), SHADED),
  new NFA(redLineMachine, 'red-line-shade-runs', interleavedRedLine),
  ...redLinePairs.map(cells => new NFA(shadeChangeMachine, 'red-line-shade-change', cells)),
];
