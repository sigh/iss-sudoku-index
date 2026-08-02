// Title: Manatee Meadow
// Author: heliopolix
// Video: https://www.youtube.com/watch?v=qys6tHbgDiU
// Source: https://app.crackingthecryptic.com/sudoku/H3MfbFJ83R

// Standard Sudoku. Gray lines are thermometers; green lines are German
// whispers with difference five or more. Every orange dot has the same
// unknown positive difference; undotted adjacent pairs are unrestricted.
const difference = new Var('D', 'orange-dot difference', 1);
const dotSpec = NFA.encodeSpec({
  startState: { difference: null, first: null },
  transition: ({ difference, first }, value) => {
    if (difference === null) return { difference: value, first: null };
    if (first === null) return { difference, first: value };
    return { matches: Math.abs(first - value) === difference };
  },
  accept: state => state.matches === true,
  maxDepth: 3,
}, 9);

const thermos = [
  ['R1C3', 'R2C3', 'R3C4', 'R2C5', 'R1C5'],
  ['R9C6', 'R8C6', 'R7C5', 'R8C4', 'R9C4'],
  ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R4C4'],
  ['R1C7', 'R2C7', 'R3C8', 'R2C9', 'R1C9'],
  ['R5C6', 'R5C7', 'R5C8', 'R6C8'],
  ['R8C2', 'R9C2'],
];
const whispers = [
  ['R6C2', 'R7C2', 'R6C3', 'R7C4', 'R6C4'],
  ['R6C5', 'R7C5', 'R6C6', 'R7C7', 'R6C7'],
  ['R3C6', 'R4C6', 'R3C7', 'R4C8', 'R3C8'],
  ['R3C5', 'R4C5', 'R3C4', 'R4C3', 'R3C3'],
];
// Orange-dot edges transcribed from the six orange edge marks.
const dots = [
  ['R3C4', 'R4C4'], ['R3C7', 'R3C8'], ['R7C8', 'R8C8'],
  ['R8C2', 'R8C3'], ['R5C6', 'R5C7'], ['R3C1', 'R4C1'],
];

return [
  new Shape('9x9'),
  difference,
  new Given(difference.cell(), 1, 2, 3, 4, 5, 6, 7, 8),
  ...thermos.map(cells => new Thermo(...cells)),
  ...whispers.map(cells => new Whisper(5, ...cells)),
  ...dots.map(cells => new NFA(dotSpec, 'orange-dot difference', difference.cell(), ...cells)),
];
