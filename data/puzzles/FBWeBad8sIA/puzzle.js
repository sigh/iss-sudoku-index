// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=FBWeBad8sIA
// Source: https://cracking-the-cryptic.web.app/sudoku/NmHf44DPGQ

// Rules:
//   Normal Sudoku rules apply.
//   Each orange string of cells is a three-digit number, exactly divisible by
//   the number in the attached green cell.
//   The green cells form a set of 1-9.
//
// The 24 orange cells form eight straight three-cell runs. Every green cell
// except R5C5 is orthogonally adjacent to exactly one orange cell, and that
// cell is always an end of its run, so the string-to-green pairing is forced.
// R5C5 is green but touches no run, so it only joins the 1-9 set.
//
// Reading order: a run is read the way digits written in a grid are read --
// left to right along a row, top to bottom down a column. Nothing drawn marks
// either end (all 24 orange cells are identically styled single-cell squares),
// and the rules sentence gives the green cell no orientation role, only the
// divisor: under this reading it sits beside the hundreds digit of four runs
// (R3C4, R1C7, R4C7, R7C9) and beside the units digit of the other four.
//
// The green cells hold nine values from 1-9 and are all different, so they are
// exactly the set 1-9.

// Transcribed from the drawn orange runs, each in reading order, paired with
// the green cell it touches.
const STRINGS = [
  [['R1C1', 'R2C1', 'R3C1'], 'R3C2'],
  [['R3C4', 'R3C5', 'R3C6'], 'R2C4'],
  [['R1C7', 'R1C8', 'R1C9'], 'R2C7'],
  [['R4C3', 'R5C3', 'R6C3'], 'R6C2'],
  [['R4C7', 'R5C7', 'R6C7'], 'R4C8'],
  [['R7C4', 'R7C5', 'R7C6'], 'R8C6'],
  [['R9C1', 'R9C2', 'R9C3'], 'R8C3'],
  [['R7C9', 'R8C9', 'R9C9'], 'R7C8'],
];

// Every drawn green cell, R5C5 included.
const GREENS = [
  'R2C4', 'R2C7', 'R3C2', 'R4C8', 'R5C5', 'R6C2', 'R7C8', 'R8C3', 'R8C6',
];

// Transcribed from the drawn given digits.
const GIVENS = [
  ['R1C9', 5], ['R3C6', 3], ['R4C7', 2], ['R5C3', 4], ['R5C4', 8],
  ['R5C6', 9], ['R5C7', 1], ['R6C3', 1], ['R6C7', 6], ['R7C4', 9],
  ['R7C5', 3], ['R7C6', 1], ['R8C9', 1], ['R9C1', 9], ['R9C9', 2],
];

// Scans [green, hundreds, tens, units]. The first symbol read is the green
// cell and fixes the divisor; each later symbol appends a digit to the running
// value, carried as that value modulo the divisor so the state stays finite
// (46 states: the start state plus one per divisor/remainder pair). Accepting
// on remainder 0 is "exactly divisible"; `accept` runs only on the final state,
// after all three digits, so a prefix that happens to be divisible is not
// accepted on its own.
const DIVISIBLE = NFA.encodeSpec({
  startState: { div: null, rem: 0 },
  transition: (state, value) => (state.div === null
    ? { div: value, rem: 0 }
    : { div: state.div, rem: (state.rem * 10 + value) % state.div }),
  accept: (state) => state.div !== null && state.rem === 0,
}, 9);

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...STRINGS.map(([cells, green]) => new NFA(DIVISIBLE, 'divisible', green, ...cells)),
  new AllDifferent(...GREENS),
];
