// Title: De Stijl
// Author: Nordy
// Video: https://www.youtube.com/watch?v=Bgz4wMQ62V4
// Source: https://app.crackingthecryptic.com/sudoku/fBf6B3FFrG

// Normal sudoku rules apply (standard 3x3 boxes, no given digits).
// Along each of the 7 drawn lines, every consecutive pair of cells must
// satisfy: differ by 1, or one is double the other (a pair such as 1/2
// satisfies both at once, per the "and/or" in the rules text).
// Line colour (gold/blue/red) carries no separate rule -- all 7 lines use
// the same pairwise relation, so one shared key groups them as one clue
// type. Closed loops repeat their first cell at the end to cover the
// wrap-around edge; the blue open line does not.
// Two lines of different colour (gold loop C and the blue open line) pass
// through the same end cells (R7C7, R6C8) -- drawn overlap, not one merged
// clue; each line's own edges are still enforced independently.

const consecutiveOrRatio = Pair.fnToKey(
  (a, b) => a === b + 1 || b === a + 1 || a === 2 * b || b === 2 * a, 9);

const lines = [
  ['R1C2', 'R1C1', 'R2C1', 'R1C2'],                                         // gold loop A (closed triangle)
  ['R4C5', 'R5C4', 'R6C5', 'R5C6', 'R4C5'],                                 // gold loop B (closed diamond)
  ['R6C6', 'R5C7', 'R6C8', 'R7C9', 'R8C8', 'R7C7', 'R6C6'],                 // gold loop C (closed)
  ['R7C7', 'R8C6', 'R7C5', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R4C8', 'R5C9', 'R6C8'], // blue open line
  ['R3C1', 'R3C2', 'R3C3', 'R4C3', 'R5C3', 'R4C2', 'R3C1'],                 // blue loop (closed)
  ['R7C3', 'R8C3', 'R9C3', 'R9C4', 'R9C5', 'R8C4', 'R7C3'],                 // red loop A (closed)
  ['R2C7', 'R1C6', 'R2C5', 'R3C6', 'R4C7', 'R3C8', 'R2C9', 'R1C8', 'R2C7'], // red loop B (closed)
];

return [
  new Shape('9x9'),
  ...lines.map(cells => new Pair(consecutiveOrRatio, 'ConsecutiveOrRatio', ...cells)),
];
