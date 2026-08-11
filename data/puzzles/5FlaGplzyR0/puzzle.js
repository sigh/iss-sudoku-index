// Title: Bobsleigh
// Author: Tom Fry
// Video: https://www.youtube.com/watch?v=5FlaGplzyR0
// Source: https://app.crackingthecryptic.com/sudoku/JNDQqQ6Bfm

// Normal sudoku rules apply (standard 9x9 grid, default box regions, no
// givens). Along every drawn thermometer, values are non-decreasing from the
// bulb to the tip(s) -- "increase or stay the same" is weaker than the
// built-in strictly-increasing Thermo class, so each edge is encoded with a
// custom Pair relation a<=b instead.
//
// The gold strokes (payload lines 0-3) all share one bulb at R1C6 and branch
// into four tips -- a single "bobsleigh" thermometer, not four separate
// ones. Traced cell-by-cell from the drawn line waypoints, the tree is:
//   trunk:  R1C6-R2C5-R3C4-R4C3
//   sub-trunk (from R4C3): R4C3-R5C2
//   arm A1 (from R5C2): R5C2-R6C1-R7C1-R8C2-R8C3-R8C4
//   arm A2 (from R5C2): R5C2-R6C2-R7C3
//   arm B  (from R4C3): R4C3-R5C3-R6C4-R6C5-R5C6-R4C7-R3C8-R2C9
//   arm C  (from R4C3): R4C3-R4C4-R3C5-R2C6-R1C7
// Each segment below is one non-overlapping piece of that tree, so every
// edge of the branching thermometer is constrained exactly once.
//
// The three yellow-green strokes are separate ordinary (single-tip)
// thermometers and get the same treatment.

const nonDecreasing = Pair.fnToKey((a, b) => a <= b, 9);

const segments = [
  // Bobsleigh (gold) tree, bulb R1C6.
  ['bobsleigh-trunk', ['R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2']],
  ['bobsleigh-armA1', ['R5C2', 'R6C1', 'R7C1', 'R8C2', 'R8C3', 'R8C4']],
  ['bobsleigh-armA2', ['R5C2', 'R6C2', 'R7C3']],
  ['bobsleigh-armB', ['R4C3', 'R5C3', 'R6C4', 'R6C5', 'R5C6', 'R4C7', 'R3C8', 'R2C9']],
  ['bobsleigh-armC', ['R4C3', 'R4C4', 'R3C5', 'R2C6', 'R1C7']],
  // Ordinary yellow-green thermometers.
  ['thermo-R2C8', ['R2C8', 'R3C7', 'R4C6', 'R5C5']],
  ['thermo-R7C5', ['R7C5', 'R6C6', 'R5C7', 'R4C8']],
  ['thermo-R9C3', ['R9C3', 'R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9', 'R3C9']],
];

const thermoConstraints = segments.map(
  ([name, cells]) => new Pair(nonDecreasing, name, ...cells));

return [
  new Shape('9x9'),
  ...thermoConstraints,
];
