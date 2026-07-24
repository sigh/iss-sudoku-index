// Title: FEEDING FRIENDSy: It's Not Pea-sy Being Green
// Author: sujoyku
// Video: https://www.youtube.com/watch?v=epbcrQT4a9o
// Source: https://sudokupad.app/pdywima58n

// Standard sudoku: digits 1-9 once per row, column, and 3x3 box.
//
// Croakz the frog draws a self-avoiding path from his start cell, through
// all nine water lilies (in an order the solver must determine), while
// never crossing a rock wall and only cutting diagonally through an open
// 2x2 space (never through either rounded rock corner). Segments of that
// path between consecutively-visited lilies must sum to the two-digit
// number formed by the two lilies' digits (either digit order), and the
// opening segment (start cell to the first lily) must sum to just that
// lily's digit. None of this has an ISS primitive: solver-discovered
// connectivity (ConnectedValues) is orthogonal-only, while this path also
// needs king-move diagonals, wall-aware adjacency, and an along-path digit
// order/sum -- all outside the catalog. The whole path/lily-order/segment-
// sum mechanic is omitted.
//
// The three edge marks below sit directly on fixed grid cells and hold
// independently of the (unencoded) path, so they are kept. Per the rules,
// each mark type is only partially given ("not all possible ... have been
// given"), so no negative/exhaustive claim is made anywhere.
//
// TWIGS -- brown leafy twig: the two digits sum to 5 (native V dot).
// LEAVES -- large green leaf: the two digits differ by at least 5 (no
// native class for a minimum-difference pair; custom Pair over the fixed
// edge).
// FROG EGG -- round egg: one digit is double the other (native BlackDot).
//
// The nine water lilies themselves are a fixed, path-independent set of
// cells, and no two may share a digit; that half of the lily rule is kept
// as a plain AllDifferent even though which lily the path visits first
// (and thus the Trials-and-Trails sums) is omitted above.

return [
  new Shape('9x9'),

  // Water lilies: no repeated digit among them. Provenance: nine drawn
  // lily glyphs at R2C5, R3C9, R4C6, R5C3, R5C6, R6C1, R6C9, R9C6, R9C9.
  new AllDifferent(
    'R2C5', 'R3C9', 'R4C6', 'R5C3', 'R5C6', 'R6C1', 'R6C9', 'R9C6', 'R9C9'),

  // Twigs: sum = 5. Provenance: drawn V-shaped twig glyph between
  // R3C3/R3C4 and between R8C1/R8C2.
  new V('R3C3', 'R3C4'),
  new V('R8C1', 'R8C2'),

  // Leaves: |a-b| >= 5. Provenance: drawn leaf glyph between R9C3/R9C4 and
  // between R5C3/R5C4.
  new Pair(
    Pair.fnToKey((a, b) => Math.abs(a - b) >= 5, 9),
    'Leaf (diff >= 5)', 'R9C3', 'R9C4'),
  new Pair(
    Pair.fnToKey((a, b) => Math.abs(a - b) >= 5, 9),
    'Leaf (diff >= 5)', 'R5C3', 'R5C4'),

  // Frog egg: one digit double the other. Provenance: drawn round egg
  // between R6C4/R6C5.
  new BlackDot('R6C4', 'R6C5'),
];
