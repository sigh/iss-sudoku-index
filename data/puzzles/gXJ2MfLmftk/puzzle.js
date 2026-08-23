// Title: Kropki Cages
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=gXJ2MfLmftk
// Source: https://app.crackingthecryptic.com/sudoku/n7PPHLg8pT
//
// Normal sudoku rules apply (standard rows/columns/3x3 boxes; no givens).
// 22 cages are drawn (no cage shows a total); digits must not repeat within
// a cage. Cages cover 60 of the 81 cells -- cells outside every cage carry no
// cage-uniqueness rule. "Adjacent" cages (per the rules sentence) means cages
// sharing at least one grid edge; computed from the cage cell lists below,
// there are 33 such adjacent cage pairs. A white dot between two cages means
// their (unlabeled) sums are consecutive; a black dot means their sums are in
// a 1:2 ratio. Both mark types are drawn on this board, so the rule is read
// exhaustively both ways: every adjacent pair *without* a dot is a positive
// claim that its sums are neither consecutive nor in a 1:2 ratio.

// Cage cells, 1-indexed, transcribed from the puzzle's drawn cage outlines.
const cages = [
  ['R1C1', 'R1C2', 'R2C1'],                       // 0
  ['R2C2', 'R3C2'],                                // 1
  ['R3C1', 'R4C1', 'R4C2', 'R5C2', 'R5C3'],        // 2
  ['R1C3', 'R2C3', 'R3C3'],                        // 3
  ['R1C4', 'R1C5'],                                // 4
  ['R2C5', 'R3C4', 'R3C5'],                        // 5
  ['R3C6', 'R4C6', 'R4C7'],                        // 6
  ['R3C7', 'R3C8'],                                // 7
  ['R1C8', 'R2C8', 'R2C9'],                        // 8
  ['R4C8'],                                        // 9
  ['R5C8', 'R5C9', 'R6C8', 'R6C9'],                // 10
  ['R6C7', 'R7C7', 'R8C7'],                        // 11
  ['R9C6', 'R9C7', 'R9C8', 'R9C9'],                // 12
  ['R7C6', 'R8C6'],                                // 13
  ['R5C5', 'R5C6', 'R6C4', 'R6C5'],                // 14
  ['R4C5'],                                        // 15
  ['R6C1', 'R6C2'],                                // 16
  ['R7C2', 'R8C1', 'R8C2'],                        // 17
  ['R7C3', 'R8C3'],                                // 18
  ['R7C4', 'R7C5', 'R8C4'],                        // 19
  ['R9C4', 'R9C5'],                                // 20
  ['R9C1', 'R9C2', 'R9C3'],                        // 21
];

// Dot pairs, transcribed from the puzzle's drawn dot overlays: each dot's
// edge sits between two specific cage cells, which identifies the cage pair.
// Cage index pairs are 0-based, matching the `cages` array above.
const whitePairs = [
  [0, 2], [1, 2], [2, 16], [3, 4], [6, 15], [7, 9],
  [12, 13], [12, 20], [14, 15], [14, 19], [16, 17], [17, 18], [17, 21],
];
const blackPairs = [
  [4, 5], [5, 6], [9, 10], [10, 11], [11, 13],
];

// Every adjacent cage pair not carrying a dot: 33 total adjacent pairs (any
// two cages sharing a grid edge) minus the 19 with a drawn dot (14 white +
// 5 black).
function pairKey(a, b) { return `${Math.min(a, b)}_${Math.max(a, b)}`; }
const dotted = new Set([...whitePairs, ...blackPairs].map(([a, b]) => pairKey(a, b)));
const allAdjacentPairs = [
  [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 16], [3, 4], [3, 5], [4, 5],
  [5, 6], [5, 15], [6, 7], [6, 9], [6, 14], [6, 15], [7, 8], [7, 9], [9, 10],
  [10, 11], [11, 12], [11, 13], [12, 13], [12, 20], [13, 19], [14, 15],
  [14, 19], [16, 17], [17, 18], [17, 21], [18, 19], [18, 21], [19, 20], [20, 21],
];
const noDotPairs = allAdjacentPairs.filter(([a, b]) => !dotted.has(pairKey(a, b)));

// A cage sum can reach up to 45 (5 cells x max digit 9) while this NFA scans
// it, before AllDifferent (a separate constraint) rules out the higher
// values -- so the running sum is clamped at 46, a sink past every value a
// 5-cell cage could actually reach.
const SUM_CAP = 46;

// Scans cage A's cells, a SEGMENT_BREAK, then cage B's cells, carrying each
// cage's running total; accepts iff `relation(sumA, sumB)` holds on the two
// final totals. One compiled spec per relation, reused across every pair
// that needs it.
function cageSumRelationSpec(relation) {
  return NFA.encodeSpec({
    startState: { phase: 'A', sum: 0, sumA: null },
    transition: ({ phase, sum, sumA }, value) => {
      if (value === SEGMENT_BREAK) {
        // Exactly one break is expected, between the two segments.
        if (phase !== 'A') return undefined;
        return { phase: 'B', sum: 0, sumA: sum };
      }
      return { phase, sum: Math.min(sum + value, SUM_CAP), sumA };
    },
    accept: ({ phase, sum, sumA }) => phase === 'B' && relation(sumA, sum),
  }, 9, { multiSegment: true });
}

const consecutive = (a, b) => Math.abs(a - b) === 1;
const ratioTwo = (a, b) => a === 2 * b || b === 2 * a;
const consecutiveSpec = cageSumRelationSpec(consecutive);
const ratioTwoSpec = cageSumRelationSpec(ratioTwo);
const neitherSpec = cageSumRelationSpec((a, b) => !consecutive(a, b) && !ratioTwo(a, b));

return [
  // Digits do not repeat within a cage (single-cell cages need no constraint).
  ...cages.filter(cells => cells.length > 1).map(cells => new AllDifferent(...cells)),

  // White dot: cage sums consecutive.
  ...whitePairs.map(([a, b]) =>
    new NFA(consecutiveSpec, 'white cage dot', cages[a], cages[b])),
  // Black dot: cage sums in a 1:2 ratio.
  ...blackPairs.map(([a, b]) =>
    new NFA(ratioTwoSpec, 'black cage dot', cages[a], cages[b])),
  // No dot on an adjacent pair: neither relation holds (exhaustiveness --
  // both dot colours are used on this board, so an undrawn boundary is a
  // positive claim, not silence).
  ...noDotPairs.map(([a, b]) =>
    new NFA(neitherSpec, 'no cage dot', cages[a], cages[b])),
];
