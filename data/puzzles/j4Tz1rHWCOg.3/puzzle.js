// Title: May 30, 2022: Frameless
// Author: clover!
// Video: https://www.youtube.com/watch?v=j4Tz1rHWCOg
// Source: https://tinyurl.com/y3tf4xw8
//
// Normal sudoku rules (rows, columns, default 3x3 boxes). Each outside clue
// means: some unknown X in 1..9 exists such that the first X cells in the
// clue's direction sum to the printed value; X differs per clue and is not
// given. Because grid digits are positive, a prefix sum along one direction
// is strictly increasing, so "some prefix equals the target" is checked by a
// single scanning NFA per clue: it tracks the running sum (clamped, since it
// can only fail once it passes the target) and accepts once the sum lands on
// the target, then ignores every cell read afterward.

// One row/column line per outside clue, cells listed in the clue's own
// reading direction, transcribed from the drawn outside-clue labels.
const outsideClues = [
  { target: 6, cells: ['R1C2', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R9C2'] }, // R0C2
  { target: 10, cells: ['R1C4', 'R2C4', 'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4'] }, // R0C4
  { target: 10, cells: ['R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R9C6'] }, // R0C6
  { target: 8, cells: ['R1C8', 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8'] }, // R0C8
  { target: 6, cells: ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9'] }, // R2C0
  { target: 8, cells: ['R2C9', 'R2C8', 'R2C7', 'R2C6', 'R2C5', 'R2C4', 'R2C3', 'R2C2', 'R2C1'] }, // R2C10
  { target: 2, cells: ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'] }, // R5C0
  { target: 8, cells: ['R5C9', 'R5C8', 'R5C7', 'R5C6', 'R5C5', 'R5C4', 'R5C3', 'R5C2', 'R5C1'] }, // R5C10
  { target: 10, cells: ['R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9'] }, // R8C0
  { target: 10, cells: ['R8C9', 'R8C8', 'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R8C2', 'R8C1'] }, // R8C10
  { target: 6, cells: ['R9C5', 'R8C5', 'R7C5', 'R6C5', 'R5C5', 'R4C5', 'R3C5', 'R2C5', 'R1C5'] }, // R10C5
];

// State { sum, hit }: sum is the running prefix total, clamped by rejecting
// (returning undefined) as soon as it passes target -- a dead branch, since
// later cells only add more. hit latches once sum lands exactly on target;
// after that every further cell is ignored, which is what lets X be anything
// from 1 up to 9 without inflating the state.
function outsideSumSpec(target) {
  return NFA.encodeSpec({
    startState: { sum: 0, hit: false },
    transition: ({ sum, hit }, value) => {
      if (hit) return { sum, hit: true };
      const next = sum + value;
      if (next === target) return { sum: next, hit: true };
      if (next > target) return undefined;
      return { sum: next, hit: false };
    },
    accept: ({ hit }) => hit,
  }, 9);
}

const outsideSumConstraints = outsideClues.map(
  ({ target, cells }) => new NFA(outsideSumSpec(target), `outside-sum-${target}`, cells));

return [
  new Shape('9x9'),

  new Given('R1C2', 3), new Given('R1C8', 4),
  new Given('R2C4', 2), new Given('R2C6', 6),
  new Given('R3C5', 5),
  new Given('R4C3', 4), new Given('R4C7', 5),
  new Given('R6C3', 9), new Given('R6C7', 6),
  new Given('R7C5', 1),
  new Given('R9C2', 5), new Given('R9C8', 8),

  ...outsideSumConstraints,
];
