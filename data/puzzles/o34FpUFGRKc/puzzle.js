// Title: Web Design
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=o34FpUFGRKc
// Source: https://sudokupad.app/jaw9z4nws6

// Only the INSECTS rule is encoded: each insect is a fixed cell-to-cell
// edge (unconditional on the never-drawn silky-thread web), so it becomes
// a plain pairwise digit relation.
//   - Black (one digit double the other, adjacent cells): Kropki BlackDot.
//   - Stripy green (difference >= 5, adjacent cells): a 2-cell Whisper(5).
//   - Spotty red (one odd, one even): a custom Pair (no built-in class).
//
// The WEB/CECIL rules (which candidate edges among the 34 white spots
// become actual silky threads; each spot's digit equalling its thread
// degree; no two threads crossing; connected spots differing; and Cecil's
// digit counting how many insects land on a thread) are a solver-discovered
// edge-selection problem over a non-orthogonal candidate graph with a
// global no-crossing (planarity) condition -- omitted as unrepresentable.

const parityKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);

const blackInsectEdges = [
  ['R4C6', 'R5C6'],
  ['R5C5', 'R6C5'],
];

const greenInsectEdges = [
  ['R1C5', 'R1C6'],
  ['R1C1', 'R1C2'],
  ['R8C2', 'R8C3'],
  ['R8C5', 'R9C5'],
];

const redInsectEdges = [
  ['R4C4', 'R5C4'],
  ['R3C3', 'R3C4'],
  ['R6C7', 'R7C7'],
];

return [
  new Shape('9x9'),

  ...blackInsectEdges.map(([a, b]) => new BlackDot(a, b)),
  ...greenInsectEdges.map(([a, b]) => new Whisper(5, a, b)),
  ...redInsectEdges.map(([a, b]) => new Pair(parityKey, 'insect-parity', a, b)),
];
