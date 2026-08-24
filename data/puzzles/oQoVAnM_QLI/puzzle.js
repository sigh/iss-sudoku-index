// Title: Imbalance
// Author: Znacks
// Video: https://www.youtube.com/watch?v=oQoVAnM_QLI
// Source: https://app.crackingthecryptic.com/sudoku/dnm4b38dmB

// Normal sudoku rules apply. (The payload's 9 "regions" are exactly the
// standard 3x3 boxes, only listed column-major, so the default Shape boxes
// already match -- no Jigsaw needed.)
// Cells connected with V sum to 5; cells connected with X sum to 10. Black
// dots connect digits with a ratio of 1:2; white dots connect consecutive
// digits. "Not all clues are given", so the absence of a dot/V/X between two
// cells carries no information -- only the marks actually drawn are
// constrained below (no Strict/negative variant).
// Numbers outside the grid give the length of the longest run of consecutive
// odd digits in that row/column, read either direction (a run's length does
// not depend on reading direction). Only 4 of the 18 possible outside lanes
// carry a printed number; the rest are unconstrained.

const graph = cellGraph('9x9');

// Longest run of consecutive odd digits along a 9-cell row/column equals
// `target`. State carries the run ending at the current cell and the max run
// seen so far, each clamped at target+1 (a sink meaning "already exceeded").
function oddRunLengthNFA(target) {
  const cap = target + 1;
  return NFA.encodeSpec({
    startState: { run: 0, max: 0 },
    transition: ({ run, max }, value) => {
      const nextRun = (value % 2 === 1) ? Math.min(run + 1, cap) : 0;
      return { run: nextRun, max: Math.min(Math.max(max, nextRun), cap) };
    },
    accept: ({ max }) => max === target,
  }, 9);
}

const outsideOddRuns = [
  // Printed "2" to the left of row 8.
  new NFA(oddRunLengthNFA(2), 'oddRunR8', ...graph.row(8)),
  // Printed "4" to the left of row 9.
  new NFA(oddRunLengthNFA(4), 'oddRunR9', ...graph.row(9)),
  // Printed "2" above column 6.
  new NFA(oddRunLengthNFA(2), 'oddRunC6', ...graph.column(6)),
  // Printed "4" above column 7.
  new NFA(oddRunLengthNFA(4), 'oddRunC7', ...graph.column(7)),
];

// White dots (consecutive): drawn as rounded marks with white fill and no
// printed sum.
const whiteDots = [
  new WhiteDot('R2C2', 'R2C3'),
  new WhiteDot('R3C1', 'R4C1'),
  new WhiteDot('R3C8', 'R3C9'),
  new WhiteDot('R6C8', 'R6C9'),
  new WhiteDot('R7C8', 'R7C9'),
  new WhiteDot('R8C8', 'R8C9'),
];

// Black dots (ratio 1:2): drawn as rounded marks with black fill and no
// printed sum.
const blackDots = [
  new BlackDot('R7C2', 'R7C3'),
  new BlackDot('R7C4', 'R7C5'),
  new BlackDot('R5C8', 'R6C8'),
  new BlackDot('R3C7', 'R3C8'),
  new BlackDot('R3C5', 'R3C6'),
];

// X (sum 10). The drawn marks put an X on all four edges of the 2x2 block
// R3C6/R3C7/R4C6/R4C7, so one X over the four cells applies to exactly those
// four adjacent pairs (a 2x2 block has no other adjacent pairs); likewise for
// R6C3/R6C4/R7C3/R7C4. The rest are lone edges.
const xPairs = [
  new X('R3C6', 'R3C7', 'R4C6', 'R4C7'),
  new X('R6C3', 'R6C4', 'R7C3', 'R7C4'),
  new X('R6C6', 'R7C6'),
  new X('R4C4', 'R5C4'),
  new X('R5C2', 'R5C3'),
  new X('R4C1', 'R5C1'),
];

// V (sum 5): lone edges.
const vPairs = [
  new V('R2C7', 'R3C7'),
  new V('R7C3', 'R8C3'),
];

return [
  new Shape('9x9'),
  ...outsideOddRuns,
  ...whiteDots,
  ...blackDots,
  ...xPairs,
  ...vPairs,
];
