// Title: Aquatic Marmalade
// Author: heliopolix
// Video: https://www.youtube.com/watch?v=v3z-urLs9zo
// Source: https://app.crackingthecryptic.com/sudoku/dRJffr6LQb

// Normal sudoku on the default 3x3 boxes. Two thermometers increase from
// the bulb (Thermo). Eight green lines require consecutive cells along the
// drawn path to differ by at least 5 (Whisper(5)); several of these lines
// zigzag diagonally, so "consecutive" is the drawn order, not a shared grid
// edge. Sixteen white dots each mark a cell pair; the rules state every
// marked pair shares one common difference D, whose value is not given and
// must be found, while unmarked pairs carry no constraint. One dot edge
// (R7C1/R7C2) coincides with a green-line segment, so that pair must
// satisfy both rules simultaneously.

const thermos = [
  new Thermo('R5C1', 'R6C1', 'R6C2', 'R6C3'),
  new Thermo('R2C7', 'R2C8', 'R1C9', 'R1C8'),
];

const whispers = [
  new Whisper(5, 'R9C3', 'R9C4'),
  new Whisper(5, 'R9C5', 'R8C6'),
  new Whisper(5, 'R7C1', 'R7C2', 'R8C3', 'R7C4', 'R7C5', 'R6C6', 'R7C7', 'R7C8'),
  new Whisper(5, 'R1C2', 'R2C3', 'R1C4'),
  new Whisper(5, 'R1C5', 'R2C6', 'R1C7'),
  new Whisper(5, 'R4C2', 'R3C3', 'R4C4'),
  new Whisper(5, 'R4C5', 'R3C6', 'R4C7'),
  new Whisper(5, 'R5C8', 'R6C8'),
];

// Every white-dot edge (drawn as a plain rounded dot, no printed value).
const dotEdges = [
  ['R8C2', 'R9C2'], ['R5C3', 'R6C3'], ['R6C2', 'R7C2'], ['R4C8', 'R5C8'],
  ['R2C9', 'R3C9'], ['R5C4', 'R5C5'], ['R8C3', 'R9C3'], ['R7C1', 'R7C2'],
  ['R2C6', 'R3C6'], ['R8C9', 'R9C9'], ['R8C8', 'R9C8'], ['R1C1', 'R1C2'],
  ['R1C4', 'R1C5'], ['R1C7', 'R1C8'], ['R4C4', 'R4C5'], ['R2C7', 'R3C7'],
];

// The dots share one unknown difference D (1-8, since 9 is impossible on a
// 1-9 grid): branch over each candidate D and, within a branch, require
// every dot edge to differ by exactly that D. D=1 is exactly the native
// WhiteDot relation; other D values have no dedicated class, so use a
// same-shaped custom Pair.
const dotConstraintsForDifference = d => dotEdges.map(([a, b]) => (
  d === 1
    ? new WhiteDot(a, b)
    : new Pair(
      Pair.fnToKey((x, y) => Math.abs(x - y) === d, 9),
      `white dot diff ${d}`,
      a, b)
));

const dotDifference = new Or(
  [1, 2, 3, 4, 5, 6, 7, 8].map(
    d => new And(dotConstraintsForDifference(d)))
);

return [
  new Shape('9x9'),
  new Given('R5C9', 9),
  new Given('R9C7', 4),
  ...thermos,
  ...whispers,
  dotDifference,
];
