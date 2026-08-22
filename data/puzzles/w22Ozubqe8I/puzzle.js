// Title: Parity Balance
// Author: zegres
// Video: https://www.youtube.com/watch?v=w22Ozubqe8I
// Source: https://app.crackingthecryptic.com/sudoku/QbLHMd8htg

// Normal sudoku rules apply. Grey-circle cells hold an odd digit, grey-square
// cells hold an even digit (encoded as multi-value Givens; ISS has no
// dedicated Odd/Even class). Every cage (all 11 are printed without a total)
// forbids repeats and requires the sum of its even digits to equal the sum of
// its odd digits.
//
// Cage cells (drawn geometry, no totals):
const cages = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R3C1', 'R4C1'],
  ['R1C5', 'R2C4', 'R2C5', 'R3C5', 'R4C5'],
  ['R2C2', 'R2C3', 'R3C2'],
  ['R4C2', 'R5C1', 'R5C2', 'R5C3', 'R5C4'],
  ['R1C8', 'R1C9', 'R2C8'],
  ['R2C9', 'R3C9', 'R4C8', 'R4C9'],
  ['R6C6', 'R6C7', 'R6C8', 'R6C9', 'R7C6', 'R8C6', 'R9C6'],
  ['R7C7', 'R7C8', 'R7C9', 'R8C9'],
  ['R8C7', 'R9C7', 'R9C8', 'R9C9'],
  ['R8C4', 'R9C3', 'R9C4'],
  ['R8C1', 'R8C2', 'R9C1', 'R9C2'],
];

// Underlay-derived parity marks: rounded (circle) => odd, square => even.
const oddCells = ['R1C3', 'R3C1', 'R3C7', 'R4C6', 'R6C4', 'R7C3', 'R9C9'];
const evenCells = ['R5C5', 'R6C6'];

// "Sum of even digits = sum of odd digits" is a signed running total (+digit
// if even, -digit if odd) that must reach 0 over each cage. The signed value
// (up to +/-63 for the 7-cell cages) does not fit ISS's 16-value Var domain
// cap, so it is tracked as NFA state instead of a Var: one NFA per cage,
// state = running signed sum, accepting only when the final sum is 0.
const parityBalanceNfas = cages.map((cells, i) => {
  const spec = NFA.encodeSpec({
    startState: 0,
    transition: (sum, value) => sum + (value % 2 === 0 ? value : -value),
    accept: (sum) => sum === 0,
    maxDepth: cells.length,
  }, 9);
  return new NFA(spec, `cage-${i}-parity-balance`, ...cells);
});

return [
  new Shape('9x9'),
  ...oddCells.map((c) => new Given(c, 1, 3, 5, 7, 9)),
  ...evenCells.map((c) => new Given(c, 2, 4, 6, 8)),
  ...cages.map((cells) => new AllDifferent(...cells)),
  ...parityBalanceNfas,
];
