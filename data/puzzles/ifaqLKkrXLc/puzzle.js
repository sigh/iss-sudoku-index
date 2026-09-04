// Title: Mystery Killer Primes
// Author: Shintaro Fushida-Hardy
// Video: https://www.youtube.com/watch?v=ifaqLKkrXLc
// Source: https://sudokupad.app/Jr8MFGh6Qf

// Standard 5x5: each row and column holds 1-5 once each (no boxes -- the
// rules name only rows and columns). Seven cages partition the grid, each
// drawn with no printed total; digits within a cage may repeat. Each cage's
// own total (unprinted, derived by the solver) must be prime, and no two
// cages may share the same prime total.
//
// Cage cell lists below are transcribed from the puzzle's drawn cage
// geometry.
const CAGES = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1'],
  ['R1C4', 'R1C5', 'R2C5'],
  ['R1C2', 'R1C3', 'R2C2', 'R3C2', 'R3C3'],
  ['R2C3', 'R2C4', 'R3C4'],
  ['R3C5', 'R4C5'],
  ['R4C4', 'R5C3', 'R5C4', 'R5C5'],
  ['R4C2', 'R4C3', 'R5C1', 'R5C2'],
];

// Every prime a cage total could possibly be: cage sizes here run 2-5 cells
// over digits 1-5, spanning sums 2..25, and 23 is the largest prime in that
// span. There are exactly nine of them, which is why the widened alphabet
// below is 1-9: each cage gets a Var holding the *index* (1-9) into this
// list rather than the prime value itself, since a raw value up to 23 would
// not fit a widened shape (capped at 16 values).
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23];

const shape = new Shape('5x5', PRIMES.length);
const graph = cellGraph(shape);

// Restrict the real grid cells back down to the true digit set: the widened
// alphabet only exists to give the per-cage index Vars (below) enough room.
const gridCells = graph.cells();
const digitRange = gridCells.map(cell => new Given(cell, 1, 2, 3, 4, 5));

// One Var per cage, holding which prime (as an index into PRIMES) that
// cage's digits sum to. The index and the actual sum commit together: for
// each cage, Or over every candidate index i of And(Given(index, i),
// Sum(PRIMES[i-1], ...cage cells)). AllDifferent over the index Vars then
// directly states "no two cages sum to the same prime" (distinct indices
// <=> distinct primes, since the index-to-prime mapping is one-to-one).
const cageIndex = new Var('P', 'cage prime index', CAGES.length);
const cagePrimes = CAGES.map((cells, i) => {
  const indexCell = cageIndex.cell(i + 1);
  return new Or(PRIMES.map((prime, k) => new And([
    new Given(indexCell, k + 1),
    new Sum(prime, ...cells),
  ])));
});

return [
  shape,
  new NoBoxes(),
  cageIndex,
  ...digitRange,
  ...cagePrimes,
  new AllDifferent(...cageIndex.cells()),
];
