// Title: Crazy Consecutives
// Author: LlamaKing14
// Video: https://www.youtube.com/watch?v=HWksRtZT2oA
// Source: https://sudokupad.app/wb55wbfd3d

// Rule 3: within a cage of size N, the digits 1-N form a "consecutive
// string": every digit v must be orthogonally/diagonally adjacent to the
// cell holding v+1 (and v-1), and the string may cross itself. Since the
// cage holds a permutation of 1..N, exactly one pair of its cells holds any
// given (v, v+1). Forbidding a difference of 1 on every cage-cell pair that
// is NOT king-adjacent therefore forces every (v, v+1) pair onto a pair of
// cells that IS king-adjacent -- exactly rule 3 -- with no need to track
// which pair that is.
//
// Rule 2 (the marked diagonal): the diagonal's own king-adjacency graph is a
// straight path (each diagonal cell only touches its immediate diagonal
// neighbours), so the rule-3 encoding on the diagonal cage already forces
// the 1..9 run to lie in strict cell order along the diagonal -- ascending
// or descending. That is exactly "place 1-9 in consecutive order" from rule
// 2, so the diagonal needs no separate encoding beyond being one more
// consecutive-string cage.
const geometry = cellGraph('9x9');
const notConsecutiveKey = Pair.fnToKey(
  (a, b) => Math.abs(a - b) !== 1, geometry.gridGeometry());

function consecutiveStringCage(cells) {
  const gaps = [];
  for (let i = 0; i < cells.length; i++) {
    const kn = geometry.kingNeighbours(cells[i]);
    for (let j = i + 1; j < cells.length; j++) {
      if (!kn.includes(cells[j])) gaps.push([cells[i], cells[j]]);
    }
  }
  return gaps.map(
    ([a, b]) => new Pair(notConsecutiveKey, 'consecutive-string-gap', a, b));
}

// A cage of size N < 9 must hold exactly {1, ..., N}, not just any N
// distinct digits -- restrict candidates before the (redundant with
// all-different) upper bound would otherwise allow e.g. {2,3,4,5}.
function restrictToOneThroughN(cells) {
  const values = Array.from({ length: cells.length }, (_, i) => i + 1);
  return cells.map(c => new Given(c, ...values));
}

// Diagonal: drawn as the coloured line and also as a hidden, no-total,
// unique(=all-different) 9-cell cage over the same cells. Diagonal
// membership is not implied by row/column/box all-different, so it needs
// its own AllDifferent.
const diagonal = geometry.ray('R1C1', 1, 1);

// The five drawn 9-cell cages sit exactly on standard Sudoku boxes 6, 9, 5,
// 1, and 4, so their all-different is already the default box constraint and
// is not restated (an explicit AllDifferent here would exactly duplicate the
// box). Each box's centre cell (R5C8, R8C8, R5C5, R2C2, R5C2) is
// king-adjacent to every other cell in its own box, so it never appears in a
// consecutive-string-gap pair either -- it is still fully constrained, by
// the box's all-different plus the unmodified 1-9 domain.
const boxCages = [6, 9, 5, 1, 4].map(n => geometry.box(n));

// The two irregular drawn cages cross box boundaries, so their
// all-different is not implied and is added explicitly.
const crossBoxCages = [
  ['R2C6', 'R3C5', 'R3C6', 'R3C7'],
  ['R7C5', 'R8C2', 'R8C3', 'R8C4', 'R8C5'],
];

return [
  new Shape('9x9'),
  new Given('R6C4', 2),
  new Given('R7C8', 4),

  new AllDifferent(...diagonal),
  ...consecutiveStringCage(diagonal),

  ...boxCages.flatMap(cells => consecutiveStringCage(cells)),

  ...crossBoxCages.flatMap(cells => [
    new AllDifferent(...cells),
    ...restrictToOneThroughN(cells),
    ...consecutiveStringCage(cells),
  ]),

  // Rule 4: white dots (drawn edge marks between the named cell pairs).
  new WhiteDot('R6C6', 'R6C7'),
  new WhiteDot('R3C7', 'R4C7'),
  new WhiteDot('R1C8', 'R1C9'),
  new WhiteDot('R1C9', 'R2C9'),
];
