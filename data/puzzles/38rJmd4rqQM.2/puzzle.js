// Title: 200,000-subscriber Sudoku (letters version)
// Author: Joke van Veenendaal
// Video: https://www.youtube.com/watch?v=38rJmd4rqQM
// Source: https://cracking-the-cryptic.web.app/sudoku/fdpFdDthm2

// Rules encoded:
//  1. Normal Sudoku: each row, column and 3x3 box contains 1-9.
//  2. 54 cells are printed with a letter, spelling "CRACKING CRYPTIC TWO
//     HUNDRED THOUSAND SUBS CONGRATS MARK & SIMON". A cell printed with the
//     first letter of an English digit name holds a digit with that name;
//     a letter that begins no digit name leaves its cell free.
//
// Not encoded (nothing is stated about either):
//  - the 17 purple cells outlining a heart;
//  - the white "&" drawn in R8C7 between MARK and SIMON.
//
// The rule above is read as first-letter, not as "the digit name contains this
// letter", on two grounds. The companion numbers version of this puzzle,
// https://cracking-the-cryptic.web.app/sudoku/8rMdM7m62G, prints a letter in
// exactly the message's 19 E/N/O/S/T cells and in no others, so those are the
// clued cells. And the "contains" reading has no solution at all: U occurs only
// in FOUR, and the Us of THOUSAND (R5C4) and SUBS (R6C5) share the centre box.

// The printed letter grid, row by row, '.' where the cell is printed empty.
const MESSAGE = [
  '.CRACKING',
  '..CRYPTIC',
  '...TWO...',
  '.HUNDRED.',
  'THOUSAND.',
  '...SUBS..',
  'CONGRATS.',
  '.MARK....',
  'SIMON....',
];

// Digits grouped by the first letter of their English name. F is listed for
// completeness; the message contains no F.
const BY_INITIAL = new Map([
  ['O', [1]],     // ONE
  ['T', [2, 3]],  // TWO, THREE
  ['F', [4, 5]],  // FOUR, FIVE
  ['S', [6, 7]],  // SIX, SEVEN
  ['E', [8]],     // EIGHT
  ['N', [9]],     // NINE
]);

const letterClues = MESSAGE.flatMap((row, r) =>
  [...row].flatMap((letter, c) => {
    const values = BY_INITIAL.get(letter);
    return values ? [new Given(makeCellId(r + 1, c + 1), ...values)] : [];
  }));

return [
  new Shape('9x9'),
  ...letterClues,
];
