// Title: First Seen Odd/Even Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=v0QKrsO1TcM
// Source: https://cracking-the-cryptic.web.app/sudoku/pFF6RtJqTh

// Normal sudoku rules apply. Sixteen givens form a ring in the centre band
// (R3-R7, C3-C7): R3C3=8 R3C4=4 R3C5=3 R3C6=2 R3C7=6, R4C3=6 R4C7=8,
// R5C3=5 R5C7=1, R6C3=2 R6C7=4, R7C3=4 R7C4=8 R7C5=7 R7C6=6 R7C7=2.
// Outside clue rule: a clue outside the grid gives the first odd digit
// (if the clue is odd) or first even digit (if the clue is even) encountered
// reading into the grid from that side. Each of columns C3-C7 and rows
// R3-R7 carries one such clue of each parity on each applicable side (top &
// bottom for columns, left & right for rows) -- 20 lanes, 40 clues total.
// Each is modelled with a small NFA per clue over the row/column ordered
// from the clue's side: state 'seeking' passes opposite-parity digits and
// requires the first same-parity digit met to equal the clue value
// (rejecting otherwise); 'done' is a sink accepting anything after that.

const graph = cellGraph('9x9');

// Ring givens, transcribed from the drawn grid.
const givens = [
  ['R3C3', 8], ['R3C4', 4], ['R3C5', 3], ['R3C6', 2], ['R3C7', 6],
  ['R4C3', 6], ['R4C7', 8],
  ['R5C3', 5], ['R5C7', 1],
  ['R6C3', 2], ['R6C7', 4],
  ['R7C3', 4], ['R7C4', 8], ['R7C5', 7], ['R7C6', 6], ['R7C7', 2],
];

// Outside clue lanes: cells ordered from the clue's side inward, plus the
// even-clue and odd-clue values read there, transcribed from the drawn
// badges. For each lane the badge nearer the grid edge is always an even
// value and the badge farther out is always odd, so parity itself
// identifies which rule each badge states.
const lanes = [
  { label: 'top C3', cells: graph.column(3), even: 8, odd: 1 },
  { label: 'top C4', cells: graph.column(4), even: 4, odd: 7 },
  { label: 'top C5', cells: graph.column(5), even: 6, odd: 3 },
  { label: 'top C6', cells: graph.column(6), even: 2, odd: 9 },
  { label: 'top C7', cells: graph.column(7), even: 6, odd: 5 },

  { label: 'bottom C3', cells: [...graph.column(3)].reverse(), even: 4, odd: 9 },
  { label: 'bottom C4', cells: [...graph.column(4)].reverse(), even: 8, odd: 1 },
  { label: 'bottom C5', cells: [...graph.column(5)].reverse(), even: 4, odd: 7 },
  { label: 'bottom C6', cells: [...graph.column(6)].reverse(), even: 6, odd: 3 },
  { label: 'bottom C7', cells: [...graph.column(7)].reverse(), even: 2, odd: 7 },

  { label: 'left R3', cells: graph.row(3), even: 8, odd: 5 },
  { label: 'left R4', cells: graph.row(4), even: 6, odd: 9 },
  { label: 'left R5', cells: graph.row(5), even: 8, odd: 5 },
  { label: 'left R6', cells: graph.row(6), even: 2, odd: 1 },
  { label: 'left R7', cells: graph.row(7), even: 4, odd: 3 },

  { label: 'right R3', cells: [...graph.row(3)].reverse(), even: 6, odd: 7 },
  { label: 'right R4', cells: [...graph.row(4)].reverse(), even: 8, odd: 5 },
  { label: 'right R5', cells: [...graph.row(5)].reverse(), even: 2, odd: 1 },
  { label: 'right R6', cells: [...graph.row(6)].reverse(), even: 4, odd: 3 },
  { label: 'right R7', cells: [...graph.row(7)].reverse(), even: 2, odd: 9 },
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

const outsideConstraints = lanes.flatMap(({ label, cells, even, odd }) => [
  new NFA(firstParitySpec(even), `first-even-${label}`, ...cells),
  new NFA(firstParitySpec(odd), `first-odd-${label}`, ...cells),
]);

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...outsideConstraints,
];
