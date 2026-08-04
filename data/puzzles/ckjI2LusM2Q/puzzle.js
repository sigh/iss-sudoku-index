// Title: Zoom - Layer 1
// Author: Matyas
// Video: https://www.youtube.com/watch?v=ckjI2LusM2Q
// Source: https://app.crackingthecryptic.com/sudoku/mFgHtTDMDg

// The drawn canvas is 9x9, but 72 of its 81 cells are a solid black
// decorative underlay; only the center 3x3 block (raw R4-6/C4-6) is
// uncovered and playable, matching "Place the numbers 1-3 exactly once
// in every row and column." This script models that block directly as
// a 3x3 grid: local R1-R3/C1-C3 = raw R4-6/C4-6.
//
// A 3x3 grid has no valid box tiling (no divisor pair of 3 with both
// factors >= 2), so Shape('3x3') already produces no box groups here --
// matching the rules text, which names only rows and columns.
//
// German Whispers: adjacent digits on the line differ by >= 2 (the
// rules state 2, not the usual German-Whisper default of 5).
//
// Maximum cell: the grey cell (raw R6C6 -> local R3C3) is higher than
// its orthogonal neighbours. R3C3 is the playable block's corner, so
// only two of the rule's stated "four" orthogonal neighbours are cells
// of this 3x3 grid at all (local R2C3 and R3C2); the other two fall on
// the decorative black canvas and hold no digit, so no relation is
// encoded for them.

return [
  new Shape('3x3'),

  new Whisper(2, 'R2C1', 'R1C1', 'R1C2'),

  new GreaterThan('R3C3', 'R2C3', 'R3C2'),
];
