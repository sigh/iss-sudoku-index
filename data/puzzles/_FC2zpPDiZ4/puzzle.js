// Title: Consecutive Regional Constraints
// Author: Belamis
// Video: https://www.youtube.com/watch?v=_FC2zpPDiZ4
// Source: https://sudokupad.app/zt3l4bqwuj

// Normal sudoku rules apply (default 3x3 boxes; the payload's `regions`
// array lists exactly the nine default boxes). No givens.
//
// Two rules layer on top of every constraint type below: each drawn
// line/arrow/dot keeps its own local rule (Arrow sum, RegionSumLine segment
// sums, Renban, Whisper(4) for Dutch Whisper, Entropic, WhiteDot,
// Modular(2) for Parity), and additionally every cell belonging to that
// *type* -- pooled across all of that type's instances -- must hold a
// non-repeating, consecutive set of digits (rules text: "any constraint
// type can not have a repeated digit ... digits across a constraint type
// must make up a consecutive set"). Renban's own semantics are exactly
// this: pairwise |a-b| < N && a!==b over the whole cell set, independent
// of adjacency or list order, which forces N distinct cells onto N
// consecutive digits. It is reused here as the pooling constraint per
// type, on top of each clue's own local constraint below.
//
// The Arrow type's pooled cells are its shaft only (R3C7, R2C7), not the
// circle (R4C6): rule 1 itself names "digits along an arrow" separately
// from "the digit in the connected circle", and the meta-rule's worked
// examples scope to cells "on"/"along" the line the same way. The single
// Kropki dot's pooled-type constraint below duplicates its own WhiteDot
// rule (two cells are always a trivial consecutive pair) and is kept
// anyway for uniform treatment of all seven types.

return [
  new Shape('9x9'),

  // Arrow: circle first, then shaft cells in order away from the bulb.
  new Arrow('R4C6', 'R3C7', 'R2C7'),

  // Region Sum lines: cells in drawn order. RegionSumLine walks the list
  // and splits into segments on box crossings; line 0 leaves its starting
  // box (R4C9) for another box (R3C9, R3C8) and re-enters the first
  // (R4C8, R5C7), so this walk order is load-bearing -- a cell-sorted
  // order would mis-split the segments.
  new RegionSumLine('R4C9', 'R3C9', 'R3C8', 'R4C8', 'R5C7'),
  new RegionSumLine('R9C6', 'R9C7', 'R9C8'),

  // Renban lines (each already a non-repeating consecutive set on its own).
  new Renban('R3C1', 'R3C2'),
  new Renban('R8C9', 'R9C9'),
  new Renban('R7C7', 'R6C6', 'R7C5'),

  // Dutch Whisper lines: adjacent digits differ by at least 4.
  new Whisper(4, 'R7C1', 'R7C2', 'R7C3'),
  new Whisper(4, 'R1C6', 'R1C7', 'R1C8'),
  new Whisper(4, 'R5C3', 'R6C3', 'R6C2'),

  // Entropic lines: every 3 consecutive cells hold one low(1-3)/mid(4-6)/
  // high(7-9) each. Both lines are >= 3 cells long.
  new Entropic('R4C1', 'R4C2', 'R4C3', 'R5C4', 'R6C4'),
  new Entropic('R2C1', 'R1C1', 'R1C2', 'R1C3'),

  // Parity line: adjacent cells alternate odd/even.
  new Modular(2, 'R9C2', 'R9C3'),

  // Kropki white dot: the two cells are consecutive.
  new WhiteDot('R2C3', 'R2C4'),

  // Meta-rule: pooled per constraint type, over every cell that type
  // occupies anywhere in the grid -- non-repeating and consecutive
  // (Renban's semantics, reused on the union of cells rather than one
  // line's cells).
  new Renban('R3C7', 'R2C7'), // Arrow: shaft only (see note above)
  new Renban(
    'R4C9', 'R3C9', 'R3C8', 'R4C8', 'R5C7',
    'R9C6', 'R9C7', 'R9C8'), // Region Sum: both lines pooled
  new Renban(
    'R3C1', 'R3C2',
    'R8C9', 'R9C9',
    'R7C7', 'R6C6', 'R7C5'), // Renban: all three lines pooled
  new Renban(
    'R7C1', 'R7C2', 'R7C3',
    'R1C6', 'R1C7', 'R1C8',
    'R5C3', 'R6C3', 'R6C2'), // Dutch Whisper: all three lines pooled
  new Renban(
    'R4C1', 'R4C2', 'R4C3', 'R5C4', 'R6C4',
    'R2C1', 'R1C1', 'R1C2', 'R1C3'), // Entropic: both lines pooled
  new Renban('R9C2', 'R9C3'), // Parity: only line; pooled == local
  new Renban('R2C3', 'R2C4'), // Kropki: only dot; pooled == local (redundant)
];
