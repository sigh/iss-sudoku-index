// Title: A Sudoku With Worms!
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=Kvaux4Z11Lg
// Source: https://cracking-the-cryptic.web.app/sudoku/qTGQdQ76hL

// Normal sudoku rules apply: rows, columns and the nine 3x3 boxes each hold
// 1-9 exactly once (the drawn regions are exactly those nine boxes, which is
// what Shape('9x9') already enforces). Five digits are given.
//
// The puzzle's source carries no rules text of any kind, so the two drawn
// features below have no stated meaning and are omitted rather than guessed:
//
//   - Six five-cell "worms", each a light-grey shaded orthogonal path of
//     cells: R3C1-R3C2-R2C2-R1C2-R1C3, R5C1-R5C2-R5C3-R5C4-R4C4,
//     R7C1-R8C1-R8C2-R9C2-R9C3, R6C6-R5C6-R5C7-R5C8-R5C9,
//     R1C7-R1C8-R2C8-R2C9-R3C9 and R9C7-R9C8-R8C8-R7C8-R7C9. Shading alone
//     says the five cells belong together; a sum, a non-repeating or
//     consecutive set, an ordered run from one (unmarked) end, or a bespoke
//     "worm" rule are all equally consistent with what is drawn.
//   - The two main diagonals, R1C1-R9C9 and R9C1-R1C9, each drawn as a
//     deepskyblue corner-to-corner stroke. Marking them commonly means digits
//     may not repeat along them, but each worm crosses exactly one diagonal
//     in exactly one cell (A/R2C2, B/R4C4, D/R6C6, F/R8C8 on the main;
//     C/R8C2, E/R2C8 on the anti-diagonal), so the strokes may instead mark
//     where the unknown worm rule applies. Nothing drawn decides between
//     those, and the no-repeat reading would only tighten the puzzle.
//
// Only standard sudoku and the five givens are encoded.

// The five printed digits.
const givens = [
  new Given('R6C2', 9),
  new Given('R6C6', 4),
  new Given('R7C1', 1),
  new Given('R7C5', 4),
  new Given('R9C3', 8),
];

return [
  new Shape('9x9'),
  ...givens,
];
