// Title: Less Than 15 Sudoku - Another Masterpiece
// Author: Bastien Vial-Jaime
// Video: https://www.youtube.com/watch?v=JpS7f9uwIGc
// Source: https://cracking-the-cryptic.web.app/sudoku/ht46hB3Rd7

// Normal sudoku. No two orthogonally adjacent cells may sum to 15 or more
// (rules text transcribed from the video's on-screen rules panel; the source
// payload itself carries no rules text or drawn geometry beyond the givens
// and the nine standard boxes).

const givens = [
  ['R1C1', 5], ['R1C3', 3], ['R1C8', 1],
  ['R2C2', 2], ['R2C4', 4], ['R2C9', 3],
  ['R3C1', 1], ['R3C5', 3],
  ['R4C1', 3], ['R4C6', 4],
  ['R5C2', 1], ['R5C7', 5],
  ['R6C3', 2], ['R6C8', 3],
  ['R7C1', 2], ['R7C4', 3], ['R7C9', 1],
  ['R8C2', 3], ['R8C5', 4], ['R8C8', 2],
  ['R9C3', 4], ['R9C6', 7], ['R9C7', 3], ['R9C9', 5],
];

// The adjacency rule applies to every orthogonally-adjacent cell pair on the
// board, not just marked ones (no marks are drawn at all). It is two shifted
// copies of one relation -- a horizontal-neighbour template and a
// vertical-neighbour template -- so each is one Replicate over every cell
// that has a right/down neighbour, rather than 144 individual Pairs.
const graph = cellGraph('9x9');
const lessThan15 = Pair.fnToKey((a, b) => a + b < 15, 9);
const horizontalTargets = graph.cells().filter(cell => graph.step(cell, 0, 1));
const verticalTargets = graph.cells().filter(cell => graph.step(cell, 1, 0));

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  graph.makeReplicate(
    [new Pair(lessThan15, 'adjacent sum < 15 (horizontal)', 'R1C1', 'R1C2')],
    horizontalTargets),
  graph.makeReplicate(
    [new Pair(lessThan15, 'adjacent sum < 15 (vertical)', 'R1C1', 'R2C1')],
    verticalTargets),
];
