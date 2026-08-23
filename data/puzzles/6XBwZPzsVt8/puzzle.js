// Title: Primes are too Cool
// Author: Niverio
// Video: https://www.youtube.com/watch?v=6XBwZPzsVt8
// Source: https://app.crackingthecryptic.com/sudoku/QMnqTL4m7f

// Rules encoded: normal sudoku; each arrow's arm digits sum to its bulb
// (repeats allowed on the arm, the class default); the grey line is a
// palindrome; the black dot forces a 1:2 ratio between its two cells; each
// grey cell is greater than every orthogonal neighbour; no two orthogonally
// adjacent cells may both hold a prime digit (2, 3, 5 or 7).
//
// The payload also draws four short thin arrow-head strokes fanned out from
// each grey cell (thickness 1, headLength 0.1, length ~0.2 cells) -- these
// are decoration for the "grey cell > neighbours" rule already stated in the
// rules text, not separate sum-arrows (contrast the four real arrows: full
// thickness, full head, and each anchored by its own circle overlay). They
// are omitted as drawing, not as an unencoded rule.

const graph = cellGraph('9x9');

const givens = [
  new Given('R1C1', 2),
  new Given('R1C9', 5),
  new Given('R9C1', 7),
  new Given('R9C9', 3),
];

// Arrows: bulb cell first, then arm cells, per the Arrow constructor.
const arrows = [
  new Arrow('R5C3', 'R6C4', 'R7C5'),
  new Arrow('R9C6', 'R8C5', 'R7C6'),
  new Arrow('R7C8', 'R6C9'),
  new Arrow('R4C1', 'R5C2', 'R6C1'),
];

const palindrome = new Palindrome('R3C2', 'R2C3', 'R3C4', 'R2C5');

const blackDot = new BlackDot('R1C7', 'R2C7');

// Grey "larger than neighbours" cells. GreaterThan binds only pairs that are
// grid-adjacent, so listing the grey cell before its neighbours constrains
// grey > each neighbour without needing to worry about neighbour-neighbour
// adjacency (opposite neighbours of one cell are never adjacent to each
// other).
const greyCells = ['R3C6', 'R7C4'];
const greaterThans = greyCells.map(
  cell => new GreaterThan(cell, ...graph.neighbours(cell)));

// Global: no two orthogonally adjacent cells both prime (2, 3, 5, 7). One
// relation key, replicated over every horizontal and every vertical edge in
// the grid (two offset groups, one per edge direction).
const isPrime = v => v === 2 || v === 3 || v === 5 || v === 7;
const notBothPrime = Pair.fnToKey((a, b) => !(isPrime(a) && isPrime(b)), 9);
const allCells = graph.cells();
const hasRightNeighbour = cell => parseCellId(cell).col < 9;
const hasDownNeighbour = cell => parseCellId(cell).row < 9;
const noPrimeNeighbours = [
  graph.makeReplicate(
    new Pair(notBothPrime, 'no-prime-neighbours', 'R1C1', 'R1C2'),
    allCells.filter(hasRightNeighbour)),
  graph.makeReplicate(
    new Pair(notBothPrime, 'no-prime-neighbours', 'R1C1', 'R2C1'),
    allCells.filter(hasDownNeighbour)),
];

return [
  new Shape('9x9'),
  ...givens,
  ...arrows,
  palindrome,
  blackDot,
  ...greaterThans,
  ...noPrimeNeighbours,
];
