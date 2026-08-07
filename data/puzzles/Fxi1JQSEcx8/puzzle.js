// Title: First Seen Odd/Even X
// Author: Clover
// Video: https://www.youtube.com/watch?v=Fxi1JQSEcx8
// Source: https://app.crackingthecryptic.com/sudoku/Bm3dMdPF8m

// Normal sudoku (default 9x9 rows/columns/boxes). One given: R5C5=5.
// X marks: the two cells an X sits between sum to 10 (class `X`). The rules
// say not every such pair is marked ("Not all Xs are necessarily given"), so
// this is a positive-only clue set -- no negative constraint is added over
// unmarked adjacent pairs.
// Outside clues: each names a row/column end and a single digit N. Reading
// the row/column from that end, the first digit of N's own parity (odd if N
// is odd, even if N is even) encountered must be exactly N. Modelled with one
// small NFA per clue: state 'seeking' consumes same-parity-mismatched digits
// freely and requires the first same-parity digit met to equal N (rejecting
// otherwise); state 'done' is a sink accepting anything after that first hit.
// Every row/column holds all nine digits, so a same-parity hit always occurs
// before the scan ends.

const graph = cellGraph('9x9');

// Drawn edge marks, each between two vertically adjacent cells in one
// column.
const xPairs = [
  ['R1C2', 'R2C2'],
  ['R1C5', 'R2C5'],
  ['R1C6', 'R2C6'],
  ['R3C8', 'R4C8'],
  ['R6C2', 'R7C2'],
  ['R8C5', 'R9C5'],
  ['R8C8', 'R9C8'],
];

// Outside clue badges: lane, scan direction (cells ordered from the clue's
// side inward), and digit.
const outsideClues = [
  { label: 'top C1', value: 1, cells: graph.column(1) },
  { label: 'top C3', value: 1, cells: graph.column(3) },
  { label: 'top C5', value: 2, cells: graph.column(5) },
  { label: 'top C7', value: 3, cells: graph.column(7) },
  { label: 'top C9', value: 3, cells: graph.column(9) },
  { label: 'bottom C1', value: 9, cells: [...graph.column(1)].reverse() },
  { label: 'bottom C3', value: 9, cells: [...graph.column(3)].reverse() },
  { label: 'bottom C5', value: 8, cells: [...graph.column(5)].reverse() },
  { label: 'bottom C7', value: 7, cells: [...graph.column(7)].reverse() },
  { label: 'bottom C9', value: 7, cells: [...graph.column(9)].reverse() },
  { label: 'left R4', value: 2, cells: graph.row(4) },
  { label: 'left R5', value: 4, cells: graph.row(5) },
  { label: 'right R5', value: 9, cells: [...graph.row(5)].reverse() },
  { label: 'right R6', value: 1, cells: [...graph.row(6)].reverse() },
];

// spec(value): state 'seeking' -> 'done' once a same-parity-as-`value` digit
// is met; that digit must equal `value` or the branch is rejected. 'done' is
// a sink that accepts any further digits.
const firstParitySpec = (value) => {
  const parity = value % 2;
  return NFA.encodeSpec({
    startState: 'seeking',
    transition: (state, v) => {
      if (state === 'done') return 'done';
      if (v % 2 !== parity) return 'seeking';
      return v === value ? 'done' : undefined;
    },
    accept: (state) => state === 'done',
  }, 9);
};

const outsideConstraints = outsideClues.map(
  ({ label, value, cells }) =>
    new NFA(firstParitySpec(value), `first-${label}`, ...cells));

return [
  new Shape('9x9'),
  new Given('R5C5', 5),
  ...xPairs.map(cells => new X(...cells)),
  ...outsideConstraints,
];
