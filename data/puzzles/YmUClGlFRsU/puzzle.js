// Title: Prime Pentominoes
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=YmUClGlFRsU
// Source: https://app.crackingthecryptic.com/sudoku/L6hfPmB4bn

// Normal sudoku rules apply. Eight grey pentomino cages are drawn with no
// printed total; a drawn cage with no total is still a killer cage (distinct
// digits), per the standard cage convention. A "domino" is an orthogonally
// adjacent pair of cells read as a two-digit number: for a horizontal pair
// the left cell is the tens digit and the right cell is the units digit; for
// a vertical pair the top cell is tens, bottom is units. Within each grey
// cage, every domino must be prime. The central 3x3 box (no cage drawn, just
// the grid's own box) carries the opposite rule: no domino within it may be
// prime.

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

// Every grid-adjacent (right/down) ordered pair within a cell set, so each
// pair always reads left-to-right or top-to-bottom as the rules require.
// A pentomino cage need not be a simple path (e.g. cage G below contains a
// 2x2 block), so pairs are derived from grid adjacency, not list order.
function adjacentDominoes(cells) {
  const set = new Set(cells);
  const pairs = [];
  for (const cell of cells) {
    const { row, col } = parseCellId(cell);
    const right = makeCellId(row, col + 1);
    const down = makeCellId(row + 1, col);
    if (set.has(right)) pairs.push([cell, right]);
    if (set.has(down)) pairs.push([cell, down]);
  }
  return pairs;
}

// Cage cell lists, provenance: the eight drawn 5-cell cages with no printed
// total, each filled light-grey.
const cages = [
  ['R1C5', 'R2C5', 'R2C4', 'R3C4', 'R2C6'],
  ['R3C7', 'R2C7', 'R1C7', 'R1C8', 'R1C9'],
  ['R1C2', 'R2C2', 'R1C3', 'R3C2', 'R3C1'],
  ['R4C3', 'R5C3', 'R6C3', 'R5C2', 'R5C1'],
  ['R7C3', 'R7C2', 'R8C2', 'R8C1', 'R9C1'],
  ['R7C5', 'R8C5', 'R9C5', 'R8C4', 'R8C6'],
  ['R8C7', 'R8C8', 'R9C8', 'R9C7', 'R7C8'],
  ['R6C8', 'R6C9', 'R5C9', 'R4C9', 'R4C8'],
];

// Central box cells, provenance: the 9-cell deepskyblue fill group drawn
// over the grid's own central box, which exactly covers R4C4:R6C6.
const centerBoxCells = [];
for (let row = 4; row <= 6; row++) {
  for (let col = 4; col <= 6; col++) centerBoxCells.push(makeCellId(row, col));
}

const primeDominoKey = Pair.fnToKey((a, b) => isPrime(10 * a + b), 9);
const nonPrimeDominoKey = Pair.fnToKey((a, b) => !isPrime(10 * a + b), 9);

const cageAllDifferent = cages.map(cells => new AllDifferent(...cells));

const cagePrimeDominoes = cages.flatMap((cells, i) => adjacentDominoes(cells).map(
  ([a, b]) => new Pair(primeDominoKey, `Cage ${i + 1} prime domino`, a, b)));

const centerNonPrimeDominoes = adjacentDominoes(centerBoxCells).map(
  ([a, b]) => new Pair(nonPrimeDominoKey, 'Center box non-prime domino', a, b));

return [
  new Shape('9x9'),
  new Given('R2C7', 7),
  new Given('R8C1', 5),
  new Given('R9C2', 2),
  ...cageAllDifferent,
  ...cagePrimeDominoes,
  ...centerNonPrimeDominoes,
];
