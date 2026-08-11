// Title: Killer Ambiguity
// Author: Abed Hawila
// Video: https://www.youtube.com/watch?v=u6Le6f9d0KU
// Source: https://app.crackingthecryptic.com/sudoku/Bd6PRfFP8J

// Normal sudoku rules apply (default Shape gives the row/column/box
// all-different rules; there are no given digits). In each of the 26 drawn
// cages: digits cannot repeat (AllDifferent, independent of the Or below),
// and at least one of (a) the cage's digit sum is a square number, or
// (b) the sum of the cage's even digits equals the sum of its odd digits.
// No cage carries a printed total -- that is the puzzle's whole point. 10
// grid cells belong to no cage (R7C1, R7C2, R7C7, R8C1, R8C5, R8C8, R9C5,
// R9C7, R9C8, R9C9) and carry only the base sudoku rules.

// Cage cell lists, transcribed from the puzzle's drawn cage outlines.
const cages = [
  ['R1C1', 'R1C2'],
  ['R1C3', 'R1C4'],
  ['R1C5', 'R1C6', 'R1C7', 'R2C7', 'R3C7', 'R2C8', 'R2C9'],
  ['R1C8', 'R1C9'],
  ['R2C1', 'R3C1', 'R3C2', 'R2C2', 'R2C3'],
  ['R3C3', 'R4C3'],
  ['R2C4', 'R2C5'],
  ['R2C6', 'R3C6', 'R3C5', 'R3C4'],
  ['R3C8', 'R3C9'],
  ['R4C8', 'R5C8'],
  ['R4C9', 'R5C9'],
  ['R4C7', 'R4C6'],
  ['R5C7', 'R6C7'],
  ['R6C8', 'R6C9'],
  ['R5C5', 'R5C6', 'R6C6'],
  ['R4C5', 'R4C4', 'R5C4'],
  ['R6C5', 'R6C4', 'R7C5', 'R7C6'],
  ['R4C1', 'R4C2'],
  ['R5C1', 'R6C1'],
  ['R5C2', 'R6C2'],
  ['R5C3', 'R6C3'],
  ['R8C2', 'R9C2', 'R9C1', 'R9C3'],
  ['R8C3', 'R7C3', 'R7C4'],
  ['R8C4', 'R9C4'],
  ['R9C6', 'R8C6', 'R8C7'],
  ['R7C8', 'R7C9', 'R8C9'],
];

// A cage of `size` distinct digits from 1-9 can only reach a sum in
// [size*(size+1)/2, size*9 - size*(size-1)/2]. Restrict the square-number
// branch to the squares that actually fall in that range for the cage's own
// size, rather than listing all six squares on every cage.
const SQUARES = [1, 4, 9, 16, 25, 36];
function achievableSquares(size) {
  const min = (size * (size + 1)) / 2;
  const max = size * 9 - (size * (size - 1)) / 2;
  return SQUARES.filter(s => s >= min && s <= max);
}

// Even/odd-balance branch: track the running (evenSum - oddSum) across the
// cage's cells -- order doesn't matter since only the final total is
// checked -- and accept when the two sums are equal. Without a bound the
// diff climbs forever (the compiler explores all length sequences, not just
// this cage's), blowing the 4096-state cap, so `maxDepth` is set to the
// cage's own cell count: state creation stops the instant every cage cell
// has been consumed. Cached per cage size since only 5 distinct sizes occur.
const evenOddBalanceSpecCache = new Map();
function evenOddBalanceSpec(size) {
  if (!evenOddBalanceSpecCache.has(size)) {
    evenOddBalanceSpecCache.set(size, NFA.encodeSpec({
      startState: 0,
      transition: (diff, value) => diff + (value % 2 === 0 ? value : -value),
      accept: diff => diff === 0,
      maxDepth: size,
    }, 9));
  }
  return evenOddBalanceSpecCache.get(size);
}

function cageConstraints(cells) {
  const squareBranches = achievableSquares(cells.length).map(
    total => new Sum(total, ...cells));
  // A 2-cell cage's balance branch can never fire, so it is omitted rather
  // than encoded and left permanently unsatisfied: with two *distinct*
  // digits a != b, either they share parity (the other parity's sum is 0
  // while this one is positive) or they don't (equality would need the even
  // one to equal the odd one, impossible since they differ in parity). Every
  // case is unsatisfiable, independent of which two digits land there.
  const branches = cells.length === 2
    ? squareBranches
    : [...squareBranches, new NFA(
      evenOddBalanceSpec(cells.length), 'even/odd balance', ...cells)];
  return [
    new AllDifferent(...cells),
    new Or(branches),
  ];
}

return [
  new Shape('9x9'),
  ...cages.flatMap(cageConstraints),
];
