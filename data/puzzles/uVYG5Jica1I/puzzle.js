// Title: All or Nothing
// Author: Edouard Lebeau
// Video: https://www.youtube.com/watch?v=uVYG5Jica1I
// Source: https://app.crackingthecryptic.com/webapp/HHL3h8gDb3

// Normal sudoku, standard boxes. Fifteen 4-cell killer cages hold distinct
// digits; eleven give a printed sum (Cage(sum, ...cells)), four do not
// (AllDifferent(...cells) only). Every cage additionally must contain
// either all decimal digits of its own total or none of them -- the total
// being the printed sum where given, or whatever the cage's four cells
// actually sum to otherwise. One NFA per cage below tracks which digits it
// has read and checks that condition once all four cells are seen.

// Cage cell lists, transcribed from the drawn cages (row-first R#C#
// coordinates). `total: null` marks a cage drawn with no printed sum.
const cages = [
  { total: 18, cells: ['R1C2', 'R1C3', 'R1C4', 'R1C5'] },
  { total: 20, cells: ['R1C6', 'R2C6', 'R3C5', 'R3C6'] },
  { total: null, cells: ['R2C1', 'R2C2', 'R2C3', 'R2C4'] },
  { total: 21, cells: ['R3C1', 'R3C2', 'R3C3', 'R3C4'] },
  { total: null, cells: ['R4C1', 'R5C1', 'R6C1', 'R7C1'] },
  { total: 18, cells: ['R8C1', 'R9C1', 'R9C2', 'R9C3'] },
  { total: 24, cells: ['R6C2', 'R7C2', 'R8C2', 'R8C3'] },
  { total: null, cells: ['R6C3', 'R7C3', 'R7C4', 'R8C4'] },
  { total: 26, cells: ['R5C3', 'R5C4', 'R5C5', 'R5C6'] },
  { total: 16, cells: ['R4C4', 'R4C5', 'R4C6', 'R4C7'] },
  { total: 16, cells: ['R1C7', 'R1C8', 'R1C9', 'R2C9'] },
  { total: 27, cells: ['R3C8', 'R3C9', 'R4C9', 'R5C9'] },
  { total: 23, cells: ['R7C8', 'R8C8', 'R8C9', 'R9C9'] },
  { total: 25, cells: ['R7C5', 'R8C5', 'R8C6', 'R8C7'] },
  { total: null, cells: ['R6C6', 'R5C7', 'R6C7', 'R7C7'] },
];

// State is a bitmask over digits 1-9 (bit d-1 set means digit d has been
// read so far). `accept` runs once, on the finished mask: it derives the
// cage's actual total as the sum of its set-bit digits, splits that total
// into tens/ones decimal digits, and requires the mask to contain both or
// neither. A digit of 0 (the ones digit whenever the total is a multiple of
// 10) can never be "contained" -- grid digits are 1-9 -- so that half of
// the digit set is always absent and the condition collapses to requiring
// the cage's other digit alone to be absent too.
const allOrNothingSpec = NFA.encodeSpec({
  startState: 0,
  transition: (mask, value) => mask | (1 << (value - 1)),
  accept: (mask) => {
    let sum = 0;
    for (let d = 1; d <= 9; d++) if (mask & (1 << (d - 1))) sum += d;
    const tens = Math.floor(sum / 10);
    const ones = sum % 10;
    const has = (d) => d >= 1 && d <= 9 && (mask & (1 << (d - 1))) !== 0;
    const hasTens = has(tens);
    const hasOnes = has(ones);
    return (hasTens && hasOnes) || (!hasTens && !hasOnes);
  },
}, 9);

function allOrNothing(cells) {
  return new NFA(allOrNothingSpec, 'all-or-nothing', ...cells);
}

return [
  new Shape('9x9'),
  ...cages.flatMap(({ total, cells }) => [
    total === null ? new AllDifferent(...cells) : new Cage(total, ...cells),
    allOrNothing(cells),
  ]),
];
