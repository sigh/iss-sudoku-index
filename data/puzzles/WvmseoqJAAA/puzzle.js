// Title: RAT RUN 28: Hypothesis
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=WvmseoqJAAA
// Source: https://sudokupad.app/ydgn4bxilt

// Normal sudoku rules apply (standard 9x9 boxes, no givens).

// Purple arrows sit between two orthogonally adjacent cells and point to the
// smaller of the two digits (GreaterThan's first cell is the larger one).
const arrows = [
  ['R9C2', 'R8C2'],
  ['R9C9', 'R8C9'],
  ['R3C4', 'R3C5'],
  ['R1C1', 'R1C2'],
  ['R9C6', 'R9C7'],
];

// Grapes sit between two orthogonally adjacent cells whose digits differ by
// at least 5.
const grapeKey = Pair.fnToKey((a, b) => Math.abs(a - b) >= 5, 9);
const grapes = [
  ['R4C1', 'R4C2'],
  ['R7C1', 'R7C2'],
  ['R8C1', 'R8C2'],
  ['R8C2', 'R8C3'],
  ['R9C2', 'R9C3'],
  ['R8C6', 'R8C7'],
  ['R7C8', 'R7C9'],
];

// Teleports: matching (same colour) teleport cells hold identical digits.
const teleportPairs = [
  ['R1C1', 'R4C9'], // A
  ['R1C4', 'R7C5'], // B
  ['R1C9', 'R7C6'], // C
  ['R6C3', 'R9C1'], // D
  ['R7C7', 'R9C5'], // E
];

// Non-matching teleports always have different digits: one representative
// cell per pair must be pairwise distinct from the others.
const teleportReps = teleportPairs.map(pair => pair[0]);

return [
  new Shape('9x9'),
  ...arrows.map(cells => new GreaterThan(...cells)),
  ...grapes.map(cells => new Pair(grapeKey, 'grape', ...cells)),
  ...teleportPairs.map(cells => new SameValues(...cells)),
  new AllDifferent(...teleportReps),
];
