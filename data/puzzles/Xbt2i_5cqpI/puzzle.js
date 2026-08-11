// Title: Parity Lines
// Author: ExFalsoQuodlibet
// Video: https://www.youtube.com/watch?v=Xbt2i_5cqpI
// Source: https://app.crackingthecryptic.com/sudoku/qJt66F2JG4

// Normal sudoku rules: default row/column/box all-different from Shape('9x9').
//
// Cage: "digits in the cage sum to the given total." The payload's own
// "cages" array names this group (its only real cage entry), so it is
// encoded as a killer Cage (distinct + sum), not a plain Sum.
//
// Each grey line carries a circle at each end. One end-circle holds the
// count of odd digits on the whole line (itself included), the other holds
// the count of even digits (itself included); which end is which is left
// for the solver, and lines are not otherwise constrained to distinct
// digits. parityLineNFA below encodes that two-way choice.
function parityLineNFA(cells) {
  const n = cells.length;
  // State: value at the first-listed cell (fixed once seen), the running
  // count of odd digits over every cell read so far, and the value most
  // recently read. After the whole line is scanned, `last` is exactly the
  // last-listed cell's value and `count` is the total odd-digit count over
  // the whole line, so no separate even-counter is needed: evenCount is
  // n - count, since every cell is one or the other.
  const spec = NFA.encodeSpec({
    startState: { first: null, count: 0, last: null },
    transition: ({ first, count }, v) => ({
      first: first === null ? v : first,
      count: count + (v % 2 === 1 ? 1 : 0),
      last: v,
    }),
    accept: ({ first, count, last }) =>
      (first === count && last === n - count) ||
      (first === n - count && last === count),
    // Bounds compile-time state exploration to this line's own length -- the
    // count field otherwise climbs unboundedly since encodeSpec compiles
    // independently of how many cells any particular caller will feed it.
    maxDepth: n,
  }, 9);
  return new NFA(spec, 'parity-line', ...cells);
}

// Each array follows the drawn stroke in order; index 0 and the last index
// are the two circled (endpoint) cells, matched against the payload's
// circle-underlay coordinates (24 circles, one-to-one with these 12 lines).
const LINES = [
  ['R1C2', 'R1C1', 'R2C1'],
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R2C3', 'R2C4', 'R3C5', 'R4C4', 'R5C4'],
  ['R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C2', 'R9C3', 'R9C4', 'R9C5'],
  ['R8C1', 'R9C1', 'R9C2'],
  ['R9C6', 'R8C6', 'R7C6', 'R6C6', 'R5C6', 'R4C6', 'R3C6'],
  ['R2C5', 'R3C4', 'R4C3', 'R5C2'],
  ['R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7', 'R8C7'],
  ['R5C8', 'R6C7', 'R7C6', 'R8C5'],
  ['R6C9', 'R6C8', 'R6C7', 'R6C6', 'R6C5', 'R6C4', 'R6C3'],
  ['R9C9', 'R8C8', 'R7C7', 'R6C6', 'R5C5', 'R4C4', 'R3C3'],
  ['R3C8', 'R2C8', 'R2C9', 'R3C9'],
];

return [
  new Shape('9x9'),
  new Cage(18, 'R8C9', 'R9C9', 'R9C8'),
  ...LINES.map(parityLineNFA),
];
