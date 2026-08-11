// Title: 18 Letters
// Author: Dante Hidemark
// Video: https://www.youtube.com/watch?v=1HFdYLY70KQ
// Source: https://app.crackingthecryptic.com/sudoku/TdN62gDmFL

// Normal sudoku rules apply (rows, columns, boxes all-different). Cage cells
// are all-different and sum to the cage's clue. The clue is not printed as a
// number: it is spelled with the puzzle's letters, each of which stands for a
// digit 1-9 (never 0), and every digit is the value of exactly two letters
// ("Each of the 18 letters in the grid represents one of the digits 1-9 with
// exactly two letters corresponding to each digit"). A one-letter clue is
// that letter's digit; a two-letter clue is the two-digit number the letters
// spell left-to-right (tens digit first). Concatenation, not addition, is
// forced by cage #KH (7 cells, R7C9/R7C8/R7C7/R9C8/R8C8/R8C7/R9C7): a
// distinct-digit 7-cell sum is at least 1+2+...+7=28, which the sum of two
// 1-9 letters (max 18) cannot reach, while 10*d(K)+d(H) reaches it easily.
// Letters also appear written directly in some cells (the "overlays" below);
// there the cell's own digit equals that letter's digit. The two right-hand
// columns of the source grid are UI scratch space only ("The two columns on
// the right are just for notating discovered equivalences") and are omitted:
// they carry no rule and are not part of this 9x9 shape.

const LETTERS = 'ABCDEFGHIJKLMNOPQR'; // 18 letters, one Var each, domain 1-9
const letterVars = [...LETTERS].map(l => new Var(l, `letter ${l}`, 1));
const vLet = l => 'V' + l;

// Cages: cell list (provenance: the drawn cage outlines) and the cage's
// letter-coded total clue string.
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
    // A one-letter clue is a plain "these cells sum to that digit": same
    // sum as the single-cell letter-Var segment.
    return [...distinct, new EqualSum(cells, [vLet(clue)])];
  }
  // A two-letter clue is a two-digit number, tens digit first:
  // sum(cells) - 10*tens - ones = 0.
  const total = new Sum(0, ...cells, [vLet(clue[0]), -10], [vLet(clue[1]), -1]);
  return [...distinct, total];
});

// Overlay letters written directly in a cell (provenance: the drawn cell-center
// letter labels): that cell's digit equals the letter's digit. Grouped by
// letter so a letter drawn twice (P) ties both cells to the one Var.
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

// Exactly two of the 18 letters take each digit 1-9.
const twoLettersPerDigit = new ContainExact(
  '1_1_2_2_3_3_4_4_5_5_6_6_7_7_8_8_9_9',
  ...[...LETTERS].map(vLet));

return [
  new Shape('9x9'),
  ...letterVars,
  ...cageConstraints,
  ...cellLetterConstraints,
  twoLettersPerDigit,
];
