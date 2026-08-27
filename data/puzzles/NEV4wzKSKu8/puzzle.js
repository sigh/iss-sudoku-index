// Title: Ring Loop
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=NEV4wzKSKu8
// Source: https://sudokupad.app/ilf81086nm

// Encodes: normal Sudoku (default rows/columns/boxes -- the payload's own
// `regions` array matches the default 3x3 boxes exactly), plus 9
// Quadruple-style circle clues: each circle sits at a lattice point where a
// 2x2 block of four cells meet, and its listed digits must each appear at
// least once among those four cells (`Quad`'s own semantics match this
// reading exactly -- no per-cell position is implied by the rule text).
//
// Omitted: the puzzle's title mechanic -- an undrawn loop the solver must
// find, which must visit every box, may touch itself, and pairs up "partner"
// cells (two cells equidistant, by loop-step-count, in both directions
// around the loop) whose absolute value differences must all be distinct.
// No ISS primitive reaches this: pairing depends on the loop's own
// solver-chosen length, which no modular-position-counter or
// distance-along-a-route technique exposes as a value to compute "half the
// loop" from, and the partner relation it would drive is itself a
// dynamically selected pairing over all on-loop cells, not a fixed, anchored
// set.

return [
  new Shape('9x9'),

  // Quadruple-style circles. Cell sets and digit lists transcribed from the
  // source's own drawn circle-plus-small-number overlays (one circle plus 2
  // or 4 small-number labels per clue), translated from the payload's 11x11
  // canvas frame to this 9x9 grid by subtracting 1 from each row and column.
  new Quad('R1C1', 3, 4, 5, 6),
  new Quad('R2C4', 1, 3),
  new Quad('R6C7', 5, 7),
  new Quad('R8C1', 2, 3, 4, 7),
  new Quad('R1C8', 1, 2, 4, 8),
  new Quad('R8C8', 4, 6, 7, 8),
  new Quad('R4C4', 2, 4, 7, 9),
  new Quad('R7C5', 8, 9),
  new Quad('R6C2', 5, 8),
];
