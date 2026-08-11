// Title: Four Primes
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=4oqZ1p3lU2s
// Source: https://app.crackingthecryptic.com/sudoku/LNj2JRDpq6

// Normal sudoku rules apply (default 3x3 boxes).
//
// There are four groups of coloured lines (yellow-green, brown, blue, grey).
// Within a colour, every line's digits sum to that colour's total, and
// "digits may repeat on a line if allowed by other rules" -- lines carry no
// distinctness of their own. "The four different totals are prime numbers"
// is encoded by giving each colour a shared index Var choosing one of the
// primes up to 31 (the largest achievable line sum), and requiring the four
// colours' indices to differ (AllDifferent below) -- since indices map 1:1
// to primes, distinct indices mean distinct prime totals.
//
// Three black dots are drawn (Kropki black dot: one digit double the other).
// "Not all possible black dots are shown" means these three are the only
// dot constraints -- no negative claim about undrawn cell pairs is encoded.

const graph = cellGraph('9x9');

// The colour-total index Vars (below) need a range wide enough to index all
// 11 candidate primes; restore the playable grid to ordinary digits 1-9
// afterwards, since the widened Shape would otherwise let grid cells take
// any value up to 11 too.
const restoreDigits = graph.makeReplicate(
  new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Colour-line groups, one array of cell-lists per colour, from the drawn
// coloured lines on the grid, grouped by colour.
const yellowgreenLines = [
  ['R2C1', 'R1C1', 'R1C2'],
  ['R3C1', 'R2C2', 'R1C3'],
  ['R4C4', 'R5C4'],
  ['R4C5', 'R4C6'],
  ['R5C6', 'R6C6'],
  ['R6C4', 'R6C5'],
];
const brownLines = [
  ['R7C3', 'R7C4'],
  ['R6C1', 'R7C2', 'R8C3', 'R9C4'],
  ['R7C1', 'R8C2', 'R9C3'],
  ['R8C1', 'R9C1', 'R9C2'],
];
const blueLines = [
  ['R9C6', 'R8C7', 'R7C8', 'R6C9'],
  ['R7C9', 'R8C8', 'R9C7'],
  ['R8C9', 'R9C9', 'R9C8'],
];
const greyLines = [
  ['R1C6', 'R2C7', 'R3C8', 'R4C9'],
  ['R1C7', 'R2C8', 'R3C9'],
  ['R1C8', 'R1C9', 'R2C9'],
];
const colourGroups = [yellowgreenLines, brownLines, blueLines, greyLines];

// Largest possible line sum is a 4-cell line of all 9s (36); the largest
// prime not exceeding that is 31. A shorter line's own cell-domains make
// larger candidates in this list arithmetically unreachable for it, so no
// per-colour trimming is needed.
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];

// One Var per colour: which PRIMES entry (by 1-based index) is that
// colour's shared line total.
const totalIndex = new Var('T', 'colour total (index into PRIMES)', colourGroups.length);
const totalIndexCells = totalIndex.cells();

// Each line's digits sum to one PRIMES entry, and its colour's index Var
// is pinned to that same entry -- so every line in a colour group is forced
// to agree on the same (prime) total.
const lineTotalConstraints = colourGroups.flatMap((lines, i) =>
  lines.map(cells => new Or(
    PRIMES.map((p, k) => new And([
      new Sum(p, ...cells),
      new Given(totalIndexCells[i], k + 1),
    ]))
  ))
);

return [
  new Shape('9x9', PRIMES.length),
  restoreDigits,
  totalIndex,
  new AllDifferent(...totalIndexCells),
  ...lineTotalConstraints,

  // Black dots (Kropki): one digit is double the other, drawn at these
  // adjacent cell-pair edges.
  new BlackDot('R3C7', 'R3C8'),
  new BlackDot('R3C8', 'R3C9'),
  new BlackDot('R1C8', 'R1C9'),
];
