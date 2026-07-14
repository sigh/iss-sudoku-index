// Title: Increasing Sum Line
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=m3IzqXmL4qw
// Source: https://sudokupad.app/97b5wl5ii6
//
// Normal sudoku rules apply. The 3x3 box borders divide the blue line into
// segments. Each segment's total is found by summing the digits on that
// segment. The segment totals must increase from one end of the line to the
// other.

const graph = cellGraph('9x9');
const boxes = graph.boxes();
const boxIndexOf = cell => boxes.findIndex(box => box.includes(cell));

// The blue line, in drawn path order.
const lineCells = [
  'R9C7', 'R9C6', 'R9C5', 'R8C4', 'R8C3', 'R7C3', 'R6C4', 'R5C5', 'R6C6',
  'R7C6', 'R8C7', 'R9C8', 'R8C9', 'R7C8', 'R6C8', 'R5C8', 'R5C9', 'R4C8',
  'R3C8', 'R3C7', 'R4C6', 'R4C5', 'R4C4', 'R3C5', 'R2C4', 'R2C3', 'R3C2',
  'R4C1', 'R5C1', 'R5C2', 'R5C3', 'R6C3', 'R7C2', 'R8C2',
];

// Box borders split the line into segments; derive the split from the drawn
// line and the grid's own box regions rather than hand-listing them.
const segments = [[lineCells[0]]];
for (let i = 1; i < lineCells.length; i++) {
  if (boxIndexOf(lineCells[i]) === boxIndexOf(lineCells[i - 1])) {
    segments[segments.length - 1].push(lineCells[i]);
  } else {
    segments.push([lineCells[i]]);
  }
}

// --- Segment totals strictly increase from one end of the line to the
// other. No end is marked as the "start" (no arrowhead, no stated
// direction), so the rule only fixes that the 13 segment totals are
// monotonic in ONE of the two directions along the drawn path -- not
// necessarily the direction `lineCells` happens to be listed in. Encoded as
// Or(all-consecutive-pairs-increasing, all-consecutive-pairs-decreasing).
//
// A segment can be up to 5 cells, so a total can reach 45 (the NFA doesn't
// know about box distinctness while compiling) -- above the Var/Shape domain
// cap (16) -- so totals can't be materialized as Vars and compared with a
// chain constraint. A single 13-segment direction-latching NFA was tried
// first but blew the 4096 compiled-state limit: `encodeSpec` compiles one
// machine shared by every instantiation, so without a depth bound the
// compiler must explore `total`/`prevTotal` growing over arbitrarily many
// SEGMENT_BREAKs, not just the 12 this puzzle actually uses. Splitting into
// one small two-segment NFA per adjacent pair (accumulate segment A, then
// segment B, compare once) plus an explicit `maxDepth` -- the longest any
// pair's two segments plus their one break can run (4 + 4 cells + 1 break,
// from the length-4/length-4 pair) -- keeps the shared machine's reachable
// states well within budget.
const MAX_PAIR_SYMBOLS = 9;
const pairTotalsSpec = (strictGreater) => NFA.encodeSpec({
  startState: { total: 0, prevTotal: null },
  transition: ({ total, prevTotal }, value) => {
    if (value !== SEGMENT_BREAK) return { total: total + value, prevTotal };
    return { total: 0, prevTotal: total };  // segment B starts; remember segment A's total
  },
  accept: ({ total, prevTotal }) =>
    strictGreater ? total > prevTotal : total < prevTotal,
  maxDepth: MAX_PAIR_SYMBOLS,
}, 9, { multiSegment: true });
const risingPairSpec = pairTotalsSpec(true);
const fallingPairSpec = pairTotalsSpec(false);

const adjacentPairs = segments.slice(1).map((seg, i) => [segments[i], seg]);
const rising = adjacentPairs.map(([a, b], i) =>
  new NFA(risingPairSpec, `rising-${i}`, a, b));
const falling = adjacentPairs.map(([a, b], i) =>
  new NFA(fallingPairSpec, `falling-${i}`, a, b));

return [
  new Shape('9x9'),
  new Given('R1C3', 4),
  new Or([new And(rising), new And(falling)]),
];
