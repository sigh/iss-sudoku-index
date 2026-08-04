// Title: Record Highs
// Author: ViKingPrime
// Video: https://www.youtube.com/watch?v=ou7OIivrmoE
// Source: https://app.crackingthecryptic.com/sudoku/PH9RM439TG

// Normal sudoku rules apply (default row/column/box all-different, no
// givens). Along each thermometer, digits increase from the bulb end,
// except that a 1 may act as either 1 or 10 for that comparison.
//
// Thermometer cell lists below are transcribed bulb -> tip from the drawn
// lines, with each bulb confirmed against its circle mark.

// One NFA state machine per thermometer expresses the "1 is 1 or 10" rule.
// State = the previous cell's chosen effective value (or null before the
// bulb). Each cell's digit contributes candidate effective values -- {d},
// or {1, 10} when d === 1 -- and only candidates exceeding the previous
// state survive; a digit with no surviving candidate rejects that branch.
// `accept` is unconditional because `transition` already enforces the
// increase at every step; nothing further is required of the final digit.
const thermoOneOrTenSpec = NFA.encodeSpec({
  startState: null,
  transition: (state, value) => {
    const candidates = value === 1 ? [1, 10] : [value];
    if (state === null) return candidates;
    const next = candidates.filter((effective) => effective > state);
    if (next.length === 0) return undefined;
    return next;
  },
  accept: () => true,
}, 9);

const thermometers = [
  ['R9C3', 'R8C3', 'R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3', 'R2C3', 'R1C3'],
  ['R9C7', 'R8C7', 'R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C7', 'R2C7', 'R1C7'],
  ['R7C4', 'R6C4', 'R5C4', 'R4C4'],
  ['R9C6', 'R8C6', 'R7C6', 'R6C6'],
  ['R3C6', 'R4C6', 'R5C6'],
  ['R6C1', 'R5C1', 'R4C1'],
  ['R6C2', 'R5C2', 'R4C2'],
  ['R6C9', 'R5C9', 'R4C9'],
  ['R6C8', 'R5C8'],
  ['R9C1', 'R8C1', 'R7C1'],
  ['R3C9', 'R2C9', 'R1C9'],
  ['R7C2', 'R8C2'],
  ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5'],
];

return [
  new Shape('9x9'),
  ...thermometers.map(
    (cells, i) => new NFA(thermoOneOrTenSpec, `thermo${i + 1}`, ...cells)),
];
