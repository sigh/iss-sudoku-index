// Title: November 10, 2022: Maximin
// Author: clover!
// Video: https://www.youtube.com/watch?v=VTJSpH3nGo0
// Source: https://tinyurl.com/mr2b534c

// Normal Sudoku rules apply. Each outside clue gives max(digits) - min(digits)
// for its adjacent three-cell row or column segment.
const givens = [
  ['R1C1', 5], ['R1C5', 8], ['R1C9', 1], ['R2C2', 3], ['R2C4', 1],
  ['R2C8', 4], ['R3C3', 4], ['R3C7', 7], ['R4C8', 5], ['R5C1', 1],
  ['R5C9', 3], ['R6C2', 4], ['R7C3', 9], ['R7C7', 5], ['R8C2', 6],
  ['R8C6', 2], ['R8C8', 7], ['R9C1', 3], ['R9C5', 9], ['R9C9', 6],
];

// The arrays transcribe the three cells nearest each numbered outside clue.
const outsideClues = [
  [6, ['R1C1', 'R2C1', 'R3C1']], [8, ['R1C2', 'R2C2', 'R3C2']],
  [3, ['R1C4', 'R2C4', 'R3C4']], [2, ['R1C7', 'R1C8', 'R1C9']],
  [2, ['R2C7', 'R2C8', 'R2C9']], [2, ['R3C7', 'R3C8', 'R3C9']],
  [5, ['R4C7', 'R4C8', 'R4C9']], [3, ['R7C6', 'R8C6', 'R9C6']],
  [7, ['R7C8', 'R8C8', 'R9C8']], [7, ['R7C9', 'R8C9', 'R9C9']],
  [6, ['R6C1', 'R6C2', 'R6C3']], [2, ['R7C1', 'R7C2', 'R7C3']],
  [2, ['R8C1', 'R8C2', 'R8C3']], [2, ['R9C1', 'R9C2', 'R9C3']],
];

// The NFA state holds the running smallest and largest digit of one clue segment.
const rangeNFA = target => NFA.encodeSpec({
  startState: null,
  transition: (state, value) => state === null
    ? { min: value, max: value }
    : { min: Math.min(state.min, value), max: Math.max(state.max, value) },
  accept: state => state !== null && state.max - state.min === target,
}, 9);

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...outsideClues.map(([target, cells]) => new NFA(rangeNFA(target),
    `range ${target}`, ...cells)),
];
