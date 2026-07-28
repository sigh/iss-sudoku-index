// Title: Find the haters
// Author: Sumanta (ANU)
// Video: https://www.youtube.com/watch?v=Fmhom-co74w
// Source: https://sudokupad.app/8mBD3pMgPj

// Normal Sudoku applies.  In each of the six displayed clue types, exactly
// three clues obey their stated rule and one hater fails it.

const cages = [
  [12, ['R6C6', 'R6C7', 'R7C6', 'R7C7']],
  [13, ['R3C3', 'R3C4', 'R4C3', 'R4C4']],
  [20, ['R3C6', 'R3C7', 'R4C6', 'R4C7']],
  [12, ['R6C3', 'R6C4', 'R7C3', 'R7C4']],
]; // Killer cages transcribed from the four dashed 2x2 regions and their totals.

const thermos = [
  ['R7C1', 'R8C1', 'R9C1', 'R9C2'],
  ['R2C1', 'R1C1', 'R1C2', 'R1C3'],
  ['R3C9', 'R2C9', 'R1C9', 'R1C8'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8'],
]; // Grey lines, ordered from their drawn circle (bulb) to the tip.

const renbans = [
  ['R2C5', 'R3C5', 'R4C5'],
  ['R5C6', 'R5C7', 'R5C8'],
  ['R5C2', 'R5C3', 'R5C4'],
  ['R6C5', 'R7C5', 'R8C5'],
]; // Purple lines transcribed from their drawn paths.

const xs = [['R4C5', 'R5C5'], ['R5C5', 'R6C5'], ['R3C3', 'R3C4'], ['R7C6', 'R7C7']];
const vs = [['R8C5', 'R9C5'], ['R1C5', 'R2C5'], ['R5C8', 'R5C9'], ['R5C1', 'R5C2']];
const orange = ['R1C5', 'R5C1', 'R9C5', 'R5C9']; // X, V, and orange-circle locations from the drawn marks.

// These NFAs recognize the complement of a clue rule, so a selected hater is
// required to be genuinely wrong rather than merely ignored.
const badCage = (target) => NFA.encodeSpec({
  startState: { pos: 0, total: 0, seen: [] },
  transition: (state, value) => {
    const pos = state.pos + 1;
    const total = state.total + value;
    if (state.repeat || state.seen.includes(value)) return { pos, total, repeat: true };
    return { pos, total, seen: [...state.seen, value].sort((a, b) => a - b) };
  },
  accept: state => state.repeat || state.total !== target,
  maxDepth: 4,
}, 9);

const badRenban = NFA.encodeSpec({
  startState: { seen: [] },
  transition: (state, value) => {
    if (state.repeat || state.seen.includes(value)) return { repeat: true };
    return { seen: [...state.seen, value].sort((a, b) => a - b) };
  },
  accept: state => state.repeat || state.seen.at(-1) - state.seen[0] + 1 !== state.seen.length,
  maxDepth: 3,
}, 9);

const badThermo = NFA.encodeSpec({
  startState: { first: true },
  transition: (state, value) => {
    if (state.bad) return state;
    if (state.first) return { prev: value };
    return value > state.prev ? { prev: value } : { bad: true };
  },
  accept: state => state.bad === true,
  maxDepth: 4,
}, 9);

const badXKey = Pair.fnToKey((a, b) => a + b !== 10, 9);
const badVKey = Pair.fnToKey((a, b) => a + b !== 5, 9);

function exactlyOneHater(items, correct, incorrect) {
  return new Or(items.map((item, hater) => new And(items.map((other, index) =>
    index === hater ? incorrect(other, index) : correct(other, index)
  ))));
}

return [
  new Shape('9x9'),
  new Given('R8C8', 5),
  exactlyOneHater(cages,
    ([sum, cells]) => new Cage(sum, ...cells),
    ([sum, cells]) => new NFA(badCage(sum), 'wrong cage', ...cells)),
  exactlyOneHater(thermos,
    cells => new Thermo(...cells),
    cells => new NFA(badThermo, 'wrong thermo', ...cells)),
  exactlyOneHater(renbans,
    cells => new Renban(...cells),
    cells => new NFA(badRenban, 'wrong renban', ...cells)),
  exactlyOneHater(xs,
    cells => new X(...cells),
    cells => new Pair(badXKey, 'wrong X', ...cells)),
  exactlyOneHater(vs,
    cells => new V(...cells),
    cells => new Pair(badVKey, 'wrong V', ...cells)),
  exactlyOneHater(orange,
    cell => new Given(cell, 1, 3, 5, 7, 9),
    cell => new Given(cell, 2, 4, 6, 8)),
];
