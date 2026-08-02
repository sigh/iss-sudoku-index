// Title: Slalom mit Ablenkung
// Author: Sandra & Nala
// Video: https://www.youtube.com/watch?v=peEWc7cPHU0
// Source: https://sudokupad.app/8m29x14m56

// Standard Sudoku applies. Every standard clue below must be invalid: killer
// cages fail their displayed condition, thermometers have a decrease, whispers
// fail their threshold, marked parity cells have the opposite parity, circle
// digits are absent from their four touching cells, and dots fail their relation.
// FOGLIGHT areas and fog revelation are UI-only, so are omitted.
const nfa = (spec) => NFA.encodeSpec(spec, 9);

// A line is invalid as a slow thermometer once one adjacent step decreases.
const descendingThermo = nfa({
  startState: { prev: null, fell: false },
  transition: ({ prev, fell }, value) => ({ prev: value, fell: fell || (prev !== null && value < prev) }),
  accept: ({ fell }) => fell,
  maxDepth: 4,
});

// These machines accept a totalled cage only when its digit sum is not its label,
// and a no-total cage only when at least one digit repeats.
const wrongTotal = (total, length) => nfa({
  startState: 0,
  transition: (sum, value) => Math.min(sum + value, total + 1),
  accept: sum => sum !== total,
  maxDepth: length,
});
const repeatedDigit = nfa({
  startState: { seen: [], repeated: false },
  transition: ({ seen, repeated }, value) => ({
    seen: seen.includes(value) ? seen : [...seen, value].sort((a, b) => a - b),
    repeated: repeated || seen.includes(value),
  }),
  accept: ({ repeated }) => repeated,
  maxDepth: 5,
});
// An arrow is wrong when its bulb does not equal the sum of its arm cells.
const wrongArrow = nfa({
  startState: { bulb: null, sum: 0 },
  transition: ({ bulb, sum }, value) => bulb === null ? { bulb: value, sum: 0 } : { bulb, sum: sum + value },
  accept: ({ bulb, sum }) => bulb !== null && bulb !== sum,
  maxDepth: 3,
});

const notConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const notRatio = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);
const greenTooClose = Pair.fnToKey((a, b) => Math.abs(a - b) < 5, 9);
const orangeTooClose = Pair.fnToKey((a, b) => Math.abs(a - b) < 4, 9);

const whiteDots = [
  ['R8C2', 'R8C3'], ['R7C3', 'R8C3'], ['R6C1', 'R6C2'], ['R6C1', 'R7C1'],
  ['R6C2', 'R6C3'], ['R4C2', 'R5C2'], ['R2C3', 'R3C3'], ['R1C4', 'R2C4'],
  ['R3C2', 'R4C2'], ['R2C6', 'R3C6'], ['R6C7', 'R7C7'],
]; // Drawn white-dot dominoes.
const blackDots = [
  ['R9C1', 'R9C2'], ['R9C2', 'R9C3'], ['R8C3', 'R9C3'], ['R2C1', 'R2C2'],
  ['R1C3', 'R1C4'], ['R3C9', 'R4C9'],
]; // Drawn black-dot dominoes.
const greenWhispers = [
  ['R7C3', 'R8C2'], ['R7C3', 'R6C2'], ['R2C1', 'R3C2'], ['R5C8', 'R4C9'],
  ['R9C8', 'R8C9'], ['R6C2', 'R5C3'],
]; // Drawn thin green whisper strokes.
const orangeWhispers = [
  ['R8C1', 'R7C2'], ['R7C2', 'R6C1'], ['R7C2', 'R6C3'], ['R7C2', 'R7C1'],
  ['R1C5', 'R2C4'], ['R2C5', 'R2C4'], ['R4C4', 'R3C5'], ['R3C4', 'R4C4'],
  ['R4C9', 'R3C8'], ['R3C5', 'R4C6'],
]; // Drawn thick orange whisper strokes.

return [
  new Shape('9x9'),
  new NFA(descendingThermo, 'wrong slow thermometers', ['R7C1', 'R6C2']),
  new NFA(descendingThermo, 'wrong slow thermometers', ['R3C2', 'R4C3', 'R5C3']),
  new NFA(descendingThermo, 'wrong slow thermometers', ['R1C3', 'R2C4']),
  new NFA(descendingThermo, 'wrong slow thermometers', ['R5C8', 'R5C7', 'R6C6', 'R6C5']),
  new NFA(repeatedDigit, 'wrong no-total cage', ['R5C2', 'R5C3', 'R5C4', 'R6C4', 'R7C4']),
  new NFA(wrongTotal(6, 3), 'wrong sum-6 cage', ['R1C5', 'R2C4', 'R2C5']),
  new NFA(wrongTotal(20, 3), 'wrong sum-20 cage', ['R8C9', 'R9C8', 'R9C9']),
  new NFA(wrongArrow, 'wrong arrow', ['R1C2', 'R2C3', 'R3C3']),
  new NFA(wrongArrow, 'wrong arrow', ['R2C7', 'R2C6', 'R3C5']),
  new NFA(wrongArrow, 'wrong arrow', ['R2C7', 'R1C6']),
  new NFA(wrongArrow, 'wrong arrow', ['R6C4', 'R6C3', 'R5C2']),
  ...greenWhispers.map(cells => new Pair(greenTooClose, 'wrong green whisper', ...cells)),
  ...orangeWhispers.map(cells => new Pair(orangeTooClose, 'wrong orange whisper', ...cells)),
  ...whiteDots.map(cells => new Pair(notConsecutive, 'wrong white dot', ...cells)),
  ...blackDots.map(cells => new Pair(notRatio, 'wrong black dot', ...cells)),
  // The shown circle digits must be absent from their touching 2x2 cells.
  new Given('R2C4', 1, 2, 3, 4, 5, 6, 7, 9), new Given('R2C5', 1, 2, 3, 4, 5, 6, 7, 9),
  new Given('R3C4', 1, 2, 3, 4, 5, 6, 7, 9), new Given('R3C5', 1, 2, 3, 4, 5, 6, 7, 9),
  new Given('R8C1', 1, 2, 3, 4, 5, 7, 8, 9), new Given('R8C2', 1, 2, 3, 4, 5, 7, 8, 9),
  new Given('R9C1', 1, 2, 3, 4, 5, 7, 8, 9), new Given('R9C2', 1, 2, 3, 4, 5, 7, 8, 9),
  new Given('R3C7', 1, 2, 3, 5, 6, 7, 8, 9), new Given('R3C8', 1, 2, 3, 5, 6, 7, 8, 9),
  new Given('R4C7', 1, 2, 3, 5, 6, 7, 8, 9), new Given('R4C8', 1, 2, 3, 5, 6, 7, 8, 9),
  // Orange circles are wrong odd clues, so are even; blue squares are wrong even clues, so are odd.
  ...['R9C1', 'R9C2', 'R9C3', 'R8C3', 'R6C4', 'R1C4', 'R6C8'].map(cell => new Given(cell, 2, 4, 6, 8)),
  ...['R5C2', 'R2C6', 'R4C4', 'R4C6', 'R7C8', 'R7C4'].map(cell => new Given(cell, 1, 3, 5, 7, 9)),
];
