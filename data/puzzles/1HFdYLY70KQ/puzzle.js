// Title: 18 Letters
// Author: Dante Hidemark
// Video: https://www.youtube.com/watch?v=1HFdYLY70KQ
// Source: https://app.crackingthecryptic.com/sudoku/TdN62gDmFL

// Rules encoded here:
//   - Normal sudoku (rows, columns, boxes all-different).
//   - Cage cells are all-different and sum to the cage's corner clue.
//   - "Each of the 18 letters in the grid represents one of the digits 1-9
//     with exactly two letters corresponding to each digit. No letter
//     represents 0."
// Nothing is stated numerically: every cage clue is spelled with letters, and
// eight cells carry a letter written in the cell instead of a digit. The 18
// letters are A-R.
//
// A one-letter clue is that letter's digit; a two-letter clue is the two-digit
// number the letters spell, tens digit first. Concatenation is forced by the
// 7-cell "KH" cage: with digits not repeating in a cage its total is at least
// 1+2+...+7 = 28, which two added letters (max 9+9 = 18) cannot reach.
//
// The board is the 9x9 sudoku. The source grid is 9x11 because two extra
// columns are drawn to its right, labelled 1-9 down the rows, "just for
// notating discovered equivalences": row d holds the two letters worth d.
// Those columns hold no rule and are not part of this shape, but the puzzle
// ships one equivalence already notated, and that single letter is encoded
// below.

const LETTERS = 'ABCDEFGHIJKLMNOPQR'; // one Var each, domain 1-9
const letterVars = [...LETTERS].map(l => new Var(l, `letter ${l}`, 1));
const vLet = l => 'V' + l;

// Cages: cell list (provenance: the drawn cage outlines) and the letters
// printed in the cage's top-left corner.
const cages = [
  { cells: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5'], clue: 'NE' },
  { cells: ['R2C3', 'R2C4', 'R2C5'], clue: 'I' },
  { cells: ['R3C3'], clue: 'E' },
  { cells: ['R3C5', 'R4C5', 'R4C4', 'R5C4', 'R5C3'], clue: 'RO' },
  { cells: ['R3C7', 'R3C6', 'R4C6'], clue: 'JD' },
  { cells: ['R5C7', 'R5C6', 'R6C6', 'R6C5', 'R7C5'], clue: 'BL' },
  { cells: ['R7C2', 'R8C2'], clue: 'C' },
  { cells: ['R8C5', 'R8C6'], clue: 'Q' },
  { cells: ['R7C9', 'R7C8', 'R7C7', 'R9C8', 'R8C8', 'R8C7', 'R9C7'], clue: 'KH' },
  { cells: ['R6C7', 'R6C8'], clue: 'F' },
  { cells: ['R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9'], clue: 'LG' },
];

const cageConstraints = cages.flatMap(({ cells, clue }) => {
  const distinct = cells.length > 1 ? [new AllDifferent(...cells)] : [];
  if (clue.length === 1) {
    return [...distinct, new EqualSum(cells, [vLet(clue)])];
  }
  // sum(cells) - 10*tens - ones = 0.
  const total = new Sum(0, ...cells, [vLet(clue[0]), -10], [vLet(clue[1]), -1]);
  return [...distinct, total];
});

// Letters written in a cell (provenance: the drawn cell-centre letter labels):
// the cell's digit is that letter's digit. Grouped by letter, so the two "P"
// cells tie to the one Var.
const cellLetters = {
  A: ['R3C3'],
  G: ['R2C1'],
  J: ['R4C2'],
  P: ['R7C2', 'R4C6'],
  M: ['R8C1'],
  H: ['R8C2'],
  C: ['R5C5'],
};
const cellLetterConstraints = Object.entries(cellLetters).map(
  ([letter, cells]) => new SameValues(cells.length + 1, ...cells, vLet(letter)));

// The one equivalence the source already notates: an "H" is printed in the
// left notation cell of the row labelled "1", i.e. H is one of the two
// letters worth 1.
const notatedEquivalence = new Given(vLet('H'), 1);

// "exactly two letters corresponding to each digit", over all 18 letters.
const twoLettersPerDigit = new ContainExact(
  '1_1_2_2_3_3_4_4_5_5_6_6_7_7_8_8_9_9',
  ...[...LETTERS].map(vLet));

return [
  new Shape('9x9'),
  ...letterVars,
  ...cageConstraints,
  ...cellLetterConstraints,
  notatedEquivalence,
  twoLettersPerDigit,
];
