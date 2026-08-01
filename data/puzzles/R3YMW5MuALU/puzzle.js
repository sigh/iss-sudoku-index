// Title: Lonely Killers
// Author: Yawnus
// Video: https://www.youtube.com/watch?v=R3YMW5MuALU
// Source: https://sudokupad.app/dFn78qGdrD

// Normal Sudoku rules apply. Digits do not repeat within each outlined cage.
// The totals of every pair of cages are different and differ by at least two.

// Unlabelled cage outlines transcribed from the drawing.
const cages = [
  ['R4C1', 'R5C1', 'R5C2', 'R6C1', 'R6C2'],
  ['R4C2', 'R4C3', 'R5C3'],
  ['R5C4', 'R6C3', 'R6C4'],
  ['R3C6', 'R4C6', 'R5C6'],
  ['R3C3', 'R3C4', 'R4C4', 'R4C5'],
  ['R4C7', 'R4C8', 'R4C9'],
  ['R5C7', 'R5C8', 'R6C8', 'R6C9'],
  ['R1C7', 'R1C8', 'R2C7', 'R3C7'],
  ['R1C9', 'R2C8', 'R2C9', 'R3C8', 'R3C9'],
  ['R7C7', 'R7C8', 'R8C7', 'R9C7'],
  ['R7C9', 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
  ['R7C3', 'R7C4', 'R8C4'],
  ['R9C2', 'R9C3', 'R9C4'],
  ['R8C5', 'R8C6', 'R9C5'],
  ['R1C2', 'R1C3', 'R1C4'],
];

// This machine reads one cage then another. Its state stores their running
// total difference; acceptance rejects equal and consecutive final totals.
const totalDifferenceMachine = (leftLength, rightLength) => NFA.encodeSpec({
  startState: { position: 0, difference: 0 },
  transition: ({ position, difference }, value) => ({
    position: position + 1,
    difference: difference + (position < leftLength ? value : -value),
  }),
  accept: ({ position, difference }) =>
    position === leftLength + rightLength && Math.abs(difference) >= 2,
  maxDepth: leftLength + rightLength,
}, 9);

const cageTotalPairs = cages.flatMap((left, i) =>
  cages.slice(i + 1).map(right => new NFA(
    totalDifferenceMachine(left.length, right.length),
    'nonconsecutive cage totals',
    ...left, ...right,
  )));

return [
  new Shape('9x9'),
  ...cages.map(cells => new AllDifferent(...cells)),
  ...cageTotalPairs,
];
