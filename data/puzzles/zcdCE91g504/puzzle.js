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
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

const redLine = [
  'R8C9', 'R8C8', 'R9C7', 'R8C6', 'R7C7', 'R6C7', 'R5C6', 'R6C5',
  'R6C4', 'R7C4', 'R8C4', 'R8C3', 'R7C2', 'R6C1', 'R5C2', 'R4C1',
  'R3C2', 'R2C3', 'R1C2', 'R2C1', 'R2C2', 'R3C1', 'R4C2', 'R3C3',
  'R2C4', 'R1C5', 'R2C6', 'R2C7', 'R3C7', 'R3C8', 'R2C9', 'R1C9',
  'R1C8', 'R2C8', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9',
];

// The shade overlay is transcribed from the two possible states required by
// the Yin-Yang rules; the red-line list is the payload's drawn walk order.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, 9);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

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
  shade.toVar('shade'),
  new Given('R1C8', 5),
  new Given('R9C9', 1),
  shadeDomain,
  new Given(shade.at('R7C9'), SHADED),
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  new NFA(redLineMachine, 'red-line-shade-runs', interleavedRedLine),
  ...redLinePairs.map(cells => new NFA(shadeChangeMachine, 'red-line-shade-change', cells)),
];
