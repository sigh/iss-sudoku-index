// Title: Omens of Misfortune
// Author: Eivind H
// Video: https://www.youtube.com/watch?v=LgNkYpyp4r8
// Source: https://app.crackingthecryptic.com/sudoku/hLr6MP6B8d

// Normal sudoku rules apply (Shape + default row/column/box all-different).
// Orthogonally adjacent digits cannot be consecutive -> AntiConsecutive
// (built-in binary constraint over orthogonal neighbour pairs only).
// Each omen is a star glyph whose spikes are fixed by the drawing: an
// edge-midpoint spike names an orthogonal neighbour, a corner spike names a
// diagonal neighbour. The pointed-to cells (not the omen's own cell) sum to
// 13 -> one Sum(13, ...) per omen, repeats allowed since the rule states no
// distinctness. Omen positions and spike directions are transcribed from the
// drawn line waypoints.

const omens = [
  ['R2C1', 'R2C3', 'R3C1', 'R3C2'],           // omen at R2C2
  ['R2C7', 'R2C8', 'R3C7', 'R4C9'],           // omen at R3C8
  ['R3C3', 'R5C2'],                            // omen at R4C2
  ['R4C6', 'R5C6'],                            // omen at R4C7
  ['R4C5', 'R5C4', 'R5C6', 'R6C5'],           // omen at R5C5
  ['R5C1', 'R6C2', 'R7C2'],                    // omen at R6C1
  ['R5C2', 'R5C4', 'R6C2', 'R7C2', 'R7C4'],   // omen at R6C3
  ['R5C3', 'R5C4', 'R7C4'],                    // omen at R6C4
  ['R7C7', 'R8C9'],                            // omen at R8C8
];

return [
  new Shape('9x9'),
  new AntiConsecutive(),
  ...omens.map(cells => new Sum(13, ...cells)),
];
