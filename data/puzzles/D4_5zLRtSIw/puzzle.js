// Title: Rainy Day Sudoku 12^2 & 35
// Author: joecat
// Video: https://www.youtube.com/watch?v=D4_5zLRtSIw
// Source: https://sudokupad.app/qm4anii4zz

// Each segment is one cage. The machine records the factors needed to test
// divisibility by 144 = 2^4 * 3^2, and whether both 5 and 7 occur (a factor 35).
const cageRule = NFA.encodeSpec({
  startState: { bad: 0, twos: 0, threes: 0, has5: false, has7: false },
  transition: (state, value) => {
    const isGood = state.twos === 4 && state.threes === 2 &&
      !(state.has5 && state.has7);

    if (value === SEGMENT_BREAK) {
      const bad = state.bad + (isGood ? 0 : 1);
      if (bad > 1) return undefined;
      return { bad, twos: 0, threes: 0, has5: false, has7: false };
    }

    const twoFactors = [0, 1, 0, 2, 0, 1, 0, 3, 0][value - 1];
    const threeFactors = [0, 0, 1, 0, 0, 1, 0, 0, 2][value - 1];
    return {
      bad: state.bad,
      twos: Math.min(4, state.twos + twoFactors),
      threes: Math.min(2, state.threes + threeFactors),
      has5: state.has5 || value === 5,
      has7: state.has7 || value === 7,
    };
  },
  accept: state => {
    const finalIsGood = state.twos === 4 && state.threes === 2 &&
      !(state.has5 && state.has7);
    return state.bad + (finalIsGood ? 0 : 1) === 1;
  },
  maxDepth: 95,
}, 9, { multiSegment: true });

const cages = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R3C1'],
  ['R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['R7C9', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'],
  ['R1C5', 'R1C6', 'R2C5', 'R3C5', 'R3C6'],
  ['R2C6', 'R2C7', 'R2C8', 'R3C7', 'R3C8'],
  ['R4C7', 'R4C8', 'R4C9', 'R5C7', 'R5C9'],
  ['R5C8', 'R6C6', 'R6C7', 'R6C8', 'R6C9'],
  ['R7C6', 'R7C7', 'R7C8', 'R8C7', 'R8C8'],
  ['R6C5', 'R7C4', 'R7C5', 'R8C3', 'R8C4'],
  ['R8C5', 'R8C6', 'R9C4', 'R9C5', 'R9C6'],
  ['R6C1', 'R6C2', 'R7C2', 'R7C3', 'R8C2'],
  ['R4C3', 'R4C4', 'R4C5', 'R5C3', 'R6C3'],
  ['R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4'],
  ['R3C2', 'R4C1', 'R4C2', 'R5C1', 'R5C2'],
  ['R1C4', 'R2C2', 'R2C3', 'R2C4', 'R3C4'],
];

return [
  new Shape('9x9'),
  new Given('R1C8', 3),
  new Given('R2C9', 2),
  new Given('R3C2', 1),
  new Given('R5C2', 2),
  new Given('R8C7', 5),
  new Given('R8C8', 8),
  ...cages.map(cells => new AllDifferent(...cells)),
  new NFA(cageRule, 'Exactly one rogue product cage', ...cages),
];
