// Title: The Raven
// Author: Aspartagcus
// Video: https://www.youtube.com/watch?v=kglHhQzsCzo
// Source: https://app.crackingthecryptic.com/sudoku/QTDfNnbPhh

// Rules encoded:
// - Sudoku: rows, columns and the nine 3x3 boxes hold 1-9 once each.
// - Cipher: the grid draws exactly nine distinct letters -- T,H,E (row 2,
//   spelling THE), R,A,V,E,N (row 5, spelling RAVEN), and E,A,P,O (a
//   staircase spelling E.A.POE) -- nine letters for nine digits, so "each
//   letter represents a unique digit" is read as a bijection: the nine
//   letter cells below are pairwise AllDifferent, and repeated letters
//   (E: 4 cells, A: 2 cells) are tied equal via SameValues.
// - Outside X-sums (below columns 3,4,5,6,7): the clue text spells
//   NEVERMORE across the five clues; each clue's digit(s) are read off the
//   letter cipher (tens letter then units letter, or a lone units letter
//   for the one-letter clue). X-sum's own X is unknown, so this is encoded
//   as an Or over every possible count 1-9 (self-clued-total pattern),
//   rather than the built-in XSum class, whose target must be a fixed
//   literal.
//
// Omitted: the "two equal sum lines" rule. Three strokes are drawn
// connected into one figure (two grey, one brown), and no partition of
// them into "the two lines" the rule names is both a literal reading of
// the drawn strokes and satisfiable alongside plain Sudoku, so which cells
// make up the two lines cannot be recovered.

// Letter cipher cells (one representative cell per letter; repeats tied
// below). M never appears in the grid -- only in the RM outside clue --
// so it is a free Var, not part of the nine-letter bijection (a tenth
// letter would need a tenth digit, which the grid cannot supply).
const Tc = 'R2C2';
const Hc = 'R2C3';
const Ec = 'R2C4'; // also R5C6, R9C5, R7C8 -- tied equal below
const Rc = 'R5C3';
const Ac = 'R5C4'; // also R8C6 -- tied equal below
const Vc = 'R5C5';
const Nc = 'R5C7';
const Pc = 'R8C7';
const Oc = 'R7C7';
const VM = 'VM';

// Build the "sum of the first k cells counting from the clue" candidate for
// an outside clue below column `col`, for one possible count k (1-9).
function xsumBranch(col, k, targetCells) {
  const bottomCell = makeCellId(9, col);
  const cells = [];
  for (let i = 0; i < k; i++) cells.push(makeCellId(9 - i, col));
  // Self-clued total: sum of the counted cells equals the letter-derived
  // target (tens*-10 + units*-1, or units*-1 alone for a one-letter clue).
  // A one-letter target has no weighting, so express it as two equal-sum
  // segments (SameValues for the single-cell case) instead of a weighted
  // Sum.
  let total;
  if (targetCells.length === 1 && targetCells[0][1] === -1) {
    const targetCell = targetCells[0][0];
    total = k === 1
      ? new SameValues(2, cells[0], targetCell)
      : new EqualSum(cells, [targetCell]);
  } else {
    total = new Sum(0, ...cells, ...targetCells);
  }
  return new And([new Given(bottomCell, k), total]);
}

function xsumClue(col, targetCells) {
  const branches = [];
  for (let k = 1; k <= 9; k++) branches.push(xsumBranch(col, k, targetCells));
  return new Or(branches);
}

return [
  new Shape('9x9'),

  new Var('M', 'M'),

  // Repeated letters hold the same digit at every occurrence.
  new SameValues(4, 'R2C4', 'R5C6', 'R9C5', 'R7C8'), // E
  new SameValues(2, 'R5C4', 'R8C6'), // A

  // The nine cipher letters are pairwise distinct digits (M excluded --
  // see the header comment).
  new AllDifferent(Tc, Hc, Ec, Rc, Ac, Vc, Nc, Pc, Oc),

  // Outside X-sums below columns 3-7, spelling NEVERMORE: NE, VE, RM, O, RE.
  xsumClue(3, [[Nc, -10], [Ec, -1]]),
  xsumClue(4, [[Vc, -10], [Ec, -1]]),
  xsumClue(5, [[Rc, -10], [VM, -1]]),
  xsumClue(6, [[Oc, -1]]),
  xsumClue(7, [[Rc, -10], [Ec, -1]]),
];
