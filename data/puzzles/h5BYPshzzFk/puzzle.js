// Title: Nein!
// Author: PrimeWeasel
// Video: https://www.youtube.com/watch?v=h5BYPshzzFk
// Source: https://app.crackingthecryptic.com/webapp/8DHLDh3JgD

// Normal sudoku rules apply. Every drawn cage sums to 18 and cannot repeat a
// digit (blanket rule from the video description, not a per-cage total: the
// payload's own cages carry no printed value). 9s cannot touch each other
// diagonally. No two orthogonally-adjacent cells sum to 9.
//
// The three underlay fill colours (deepskyblue/yellowgreen/chocolate) exactly
// partition the 17 cages into three groups of matching colour; nothing in the
// rules text gives the colouring its own meaning beyond grouping the cages
// visually, so it is not encoded as a separate constraint.

const graph = cellGraph('9x9');

// Cage cell lists transcribed from the drawn cage geometry; every one is a
// real cage with no printed total, per the blanket "cages sum to 18" rule.
const cages = [
  ['R2C1', 'R2C2', 'R2C3', 'R1C3'],
  ['R3C2', 'R3C1', 'R4C1'],
  ['R4C2', 'R4C3', 'R4C4', 'R3C4', 'R3C3'],
  ['R1C4', 'R2C4', 'R2C5', 'R3C5'],
  ['R1C5', 'R1C6', 'R2C6'],
  ['R2C7', 'R1C7', 'R1C8'],
  ['R1C9', 'R2C9', 'R3C9', 'R3C8'],
  ['R4C8', 'R4C9', 'R5C9'],
  ['R5C7', 'R5C8', 'R6C8', 'R6C9', 'R6C7'],
  ['R6C6', 'R5C6', 'R4C6', 'R4C5', 'R5C5'],
  ['R6C5', 'R7C5', 'R8C5', 'R8C4'],
  ['R5C1', 'R5C2', 'R5C3', 'R6C3'],
  ['R6C1', 'R6C2', 'R7C2', 'R7C3'],
  ['R7C1', 'R8C1', 'R8C2'],
  ['R8C3', 'R9C3', 'R9C4'],
  ['R9C5', 'R9C6', 'R9C7', 'R8C6'],
  ['R7C8', 'R8C8', 'R9C8', 'R8C9'],
];

// No two 9s may occupy diagonally-adjacent cells. Scoped to value 9 only (an
// ordinary AntiKing would also forbid other repeats and orthogonal adjacency,
// neither of which the rule states). One Pair template per diagonal
// direction, replicated over every cell where that direction's neighbour is
// on-grid (each template's own origin is its direction's flat-index-minimal
// valid cell, so every replicated offset is non-negative).
const notBothNine = Pair.fnToKey((a, b) => !(a === 9 && b === 9), 9);
const diagonalTemplates = [
  { origin: 'R1C1', dRow: 1, dCol: 1 },   // down-right diagonal
  { origin: 'R1C2', dRow: 1, dCol: -1 },  // down-left diagonal
];

// No two orthogonally-adjacent cells (the plain "adjacent" of the rule text)
// may sum to 9. Global negative with no strict class for "sum equals 9". One
// Pair template per orthogonal direction, replicated the same way.
const notSumNine = Pair.fnToKey((a, b) => a + b !== 9, 9);
const orthogonalTemplates = [
  { origin: 'R1C1', dRow: 0, dCol: 1 },   // rightward
  { origin: 'R1C1', dRow: 1, dCol: 0 },   // downward
];

// Build one Replicate per template: the template Pair(origin, step(origin))
// stamped at every cell whose neighbour in that direction is on-grid.
const replicatePairs = (key, label, templates) => templates.map(
  ({ origin, dRow, dCol }) => {
    const targets = graph.cells().filter(cell => graph.step(cell, dRow, dCol));
    return new Replicate(
      [new Pair(key, label, origin, graph.step(origin, dRow, dCol))],
      Replicate.encodeTargetCells(targets, origin, graph),
      origin,
    );
  });

return [
  new Shape('9x9'),

  new Given('R3C1', 5),
  new Given('R3C5', 3),
  new Given('R3C7', 1),

  ...cages.map(cells => new Cage(18, ...cells)),

  ...replicatePairs(notBothNine, 'no diagonal 9s', diagonalTemplates),

  ...replicatePairs(notSumNine, 'no adjacent sum 9', orthogonalTemplates),
];
