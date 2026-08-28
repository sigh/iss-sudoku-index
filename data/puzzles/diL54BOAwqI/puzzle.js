// Title: When One Thought Generates Another Puzzle
// Author: Unknown
// Video: https://www.youtube.com/watch?v=diL54BOAwqI
// Source: https://cracking-the-cryptic.web.app/sudoku/npnPp8NgGL
//
// 9x9 sudoku, standard boxes. Rules (from the video description):
// "Normal sudoku rules apply, and cages sum to different squares. Different
// 3-digit squares appear on the arrows, and 9-digit squares appear in the
// green cells."
//
// - Cages: none of the 7 drawn cages shows a printed total, so each cage's
//   total is left entirely to the "sum to different squares" rule; the 7
//   totals must be pairwise-distinct perfect squares. The two 9-cell cages
//   are not forced all-different by any row/column/box (each only covers 3
//   cells of any row or column it touches), and reading them as ordinary
//   all-different killer cages is unsatisfiable here: 9 distinct digits
//   1-9 always sum to 45, which is not a perfect square, so no cage in this
//   puzzle carries an implicit no-repeat rule -- each is a plain sum region.
//   Where a cage's cells do happen to share a row (the 2-cell and 4-cell
//   cages below), the row rule already forces those cells distinct.
// - Arrows: each arrow's three cells, read bulb-to-tip (the same order
//   ISS's own Arrow class reads a bulb first), form a 3-digit perfect
//   square, and the 7 arrows' numbers are pairwise distinct.
// - Green cells (33 cells forming a cross of column 1, column 5, column 9
//   and row 5): each of the 4 straight 9-cell strips is a 9-digit perfect
//   square. This is NOT encoded -- see the omission note at the bottom of
//   this file.

// Perfect squares of 1-9 with digits 1-9 only (a Sudoku grid never carries a
// 0), used both as literal cage totals and, via the index below, as an
// AllDifferent-able stand-in for "which square" a cage uses.
const masterSquares = [1, 4, 9, 16, 25, 36, 49, 64, 81];

// Perfect squares of 10-31 (3-digit, no zero digit): the full candidate set
// for "a 3-digit square appears on the arrow".
const threeDigitSquares = [
  121, 144, 169, 196, 225, 256, 289, 324, 361, 441,
  484, 529, 576, 625, 676, 729, 784, 841, 961,
];

const givens = [
  ['R1C5', 9], ['R1C7', 4], ['R2C1', 6], ['R4C5', 1],
  ['R6C1', 4], ['R6C4', 6], ['R7C8', 9], ['R7C9', 6],
  ['R8C2', 4], ['R8C4', 1], ['R8C6', 9], ['R9C5', 6],
  ['R9C8', 1], ['R9C9', 4],
].map(([cell, value]) => new Given(cell, value));

// Cages (cell sets transcribed from the drawn cage outlines). `indices`
// names which entries of masterSquares that cage's total could possibly
// be, from its cell count and (for the row-aligned cages) the
// forced-distinct row range.
const cages = [
  // 9 cells, rows 6-8 x cols 6-8: a 3x3 block offset from the boxes,
  // spanning parts of 4 different boxes. Repeats allowed (see header note),
  // so the total ranges 9-81: every master square from 9 up.
  { cells: ['R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8'], indices: [3, 4, 5, 6, 7, 8, 9] },
  // 9 cells, rows 6-8 x cols 2-4: same shape, same reasoning.
  { cells: ['R6C2', 'R6C3', 'R6C4', 'R7C2', 'R7C3', 'R7C4', 'R8C2', 'R8C3', 'R8C4'], indices: [3, 4, 5, 6, 7, 8, 9] },
  // 2 cells, both in row 9: forced distinct by the row, so total ranges
  // 1+2=3 .. 8+9=17.
  { cells: ['R9C1', 'R9C2'], indices: [2, 3, 4] },
  // Single cell: total is just the digit, 1-9.
  { cells: ['R3C1'], indices: [1, 2, 3] },
  { cells: ['R2C2'], indices: [1, 2, 3] },
  // 4 cells, all in row 1: forced distinct by the row, so total ranges
  // 1+2+3+4=10 .. 6+7+8+9=30.
  { cells: ['R1C3', 'R1C4', 'R1C5', 'R1C6'], indices: [4, 5] },
  { cells: ['R3C4'], indices: [1, 2, 3] },
];

// One Var per cage holding the master-square index it uses. AllDifferent
// over these Vars is exactly "different squares", because the index-to-value
// map (masterSquares) is the same fixed bijection for every cage.
const cageSquare = new Var('CS', 'CageSquareIndex', cages.length);

const cageConstraints = cages.map((cage, i) => new Or(
  cage.indices.map(idx => new And([
    new Given(cageSquare.cell(i + 1), idx),
    new Sum(masterSquares[idx - 1], ...cage.cells),
  ]))
));

// Arrows: bulb first, then the rest of the path in drawn order (see header
// note on reading direction).
const arrows = [
  ['R1C1', 'R2C1', 'R3C1'],
  ['R7C1', 'R8C1', 'R9C1'],
  ['R5C6', 'R5C5', 'R5C4'],
  ['R6C4', 'R6C3', 'R5C3'],
  ['R2C6', 'R2C5', 'R1C5'],
  ['R4C8', 'R4C7', 'R5C7'],
  ['R5C9', 'R6C9', 'R7C9'],
];

// Each arrow's 3 cells, read bulb-to-tip, must spell one of the candidate
// 3-digit squares.
const arrowSquareConstraints = arrows.map(cells => new Or(
  threeDigitSquares.map(sq => {
    const digits = String(sq).split('').map(Number);
    return new And(cells.map((cell, i) => new Given(cell, digits[i])));
  })
));

// "Different squares appear on the arrows": for every pair of arrows, they
// must not spell the same 3-digit number, i.e. they differ in at least one
// of the 3 corresponding positions.
const neqKey = Pair.fnToKey((a, b) => a !== b, 9);
const arrowDistinctConstraints = [];
for (let i = 0; i < arrows.length; i++) {
  for (let j = i + 1; j < arrows.length; j++) {
    arrowDistinctConstraints.push(new Or(
      arrows[i].map((cell, k) => new Pair(neqKey, '', cell, arrows[j][k]))
    ));
  }
}

return [
  new Shape('9x9'),
  ...givens,
  cageSquare,
  new AllDifferent(...cageSquare.cells()),
  ...cageConstraints,
  ...arrowSquareConstraints,
  ...arrowDistinctConstraints,
];

// Omission: the four 9-cell green strips (column 1, column 5, column 9, row
// 5) each being a 9-digit perfect square is not encoded. There are 8431
// nine-digit squares with no zero digit; checking membership in that set
// needs a finite-state scan (iss-constraints' NFA/Regex), but the minimal
// automaton for this specific 9-character language measured 6164 states at
// its narrowest useful cut, over the 4096-state compiled-NFA cap, and a
// flat digit-literal Or has 8431 branches per strip -- ISS has no
// arithmetic primitive (e.g. multiplication) that could check "is this
// 9-digit number a perfect square" any other way.
