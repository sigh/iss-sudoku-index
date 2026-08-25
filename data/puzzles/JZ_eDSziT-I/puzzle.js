// Title: Odd Knight Sudoku
// Author: Jonathan Parker
// Video: https://www.youtube.com/watch?v=JZ_eDSziT-I
// Source: https://app.crackingthecryptic.com/webapp/2BgLfhHg69

// Normal sudoku rules apply. Cages sum to their printed total with no repeated
// digit inside a cage. Odd digits carry an anti-knight restriction: a knight's
// move apart, the same odd digit may not repeat; even digits have no such
// restriction (rules text: "Odd numbers have anti-knight restrictions, so e.g.
// 1 can never be a knight's move away from another 1.").

const givens = [
  new Given('R1C3', 5),
  new Given('R1C9', 4),
  new Given('R2C1', 3),
  new Given('R2C2', 1),
  new Given('R2C9', 2),
  new Given('R3C4', 9),
  new Given('R3C6', 6),
  new Given('R4C3', 8),
  new Given('R5C3', 7),
  new Given('R5C5', 5),
  new Given('R7C5', 8),
  new Given('R8C1', 4),
  new Given('R9C2', 2),
  new Given('R9C8', 3),
  new Given('R9C9', 1),
];

// Cage cells, from the payload's `cages` array (0-indexed [row, col] there).
const cages = [
  new Cage(8, 'R1C5', 'R2C5'),
  new Cage(13, 'R6C4', 'R7C4'),
  new Cage(8, 'R7C7', 'R8C7'),
  new Cage(24, 'R4C7', 'R5C6', 'R5C7'),
];

// Odd anti-knight: for every knight's-move pair of cells, reject only the case
// where both cells hold the same odd digit -- even repeats a knight's move
// apart are unrestricted. This is not the built-in AntiKnight (which forbids
// any repeat, not just odd ones), so it is a custom Pair relation instead.
// One knight offset produces the same relative Pair template everywhere on
// the grid, so each of the 4 distinct knight-move shapes ((1,2), (1,-2),
// (2,1), (2,-1) -- their negations are the same unordered edge) is stamped
// with one Replicate rather than 56 individual Pair constraints.
const graph = cellGraph('9x9');
const oddKnightRelation = Pair.fnToKey((a, b) => !(a === b && a % 2 === 1), 9);
const KNIGHT_OFFSETS = [[1, 2], [1, -2], [2, 1], [2, -1]];
const oddKnightGroups = KNIGHT_OFFSETS.map(([dr, dc]) => {
  const origins = graph.cells().filter(cell => graph.step(cell, dr, dc));
  const origin = origins[0];
  return new Replicate(
    [new Pair(oddKnightRelation, 'OddKnight', origin, graph.step(origin, dr, dc))],
    Replicate.encodeTargetCells(origins, origin, graph),
    origin,
  );
});

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
  ...oddKnightGroups,
];
