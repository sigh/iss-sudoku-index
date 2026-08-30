// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=kxcFKeyER0o
// Source: https://cracking-the-cryptic.web.app/sudoku/pdbPTjmPBj

// Normal sudoku rules apply (rows, columns, and 2x3 boxes each contain 1-6
// once; the payload's regions array matches the Shape('6x6') default box
// tiling). No givens.
//
// The payload draws 4 grey lines, each with a matching grey filled circle
// at one end. No rules text is stored (normal for this era). The
// circle-bulb-plus-line drawing is the standard Thermo convention, but
// that reading is omitted here: a reduced check (the two 6-cell lines
// alone, plus baseline row/column rules) is unsatisfiable under a strict
// increasing-from-bulb Thermo in either uniform direction, so the only
// art-grounded reading is refuted by its own arithmetic. No alternative
// reading is grounded in the art or in any rules text, so the whole group
// of 4 lines is left unencoded rather than guessed at.

return [
  new Shape('6x6'),
];
