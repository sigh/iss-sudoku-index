// Title: Hurricane
// Author: SudokuExplorer
// Video: https://www.youtube.com/watch?v=vStK0M2nQF0
// Source: https://app.crackingthecryptic.com/sudoku/fMrD7D3hmH

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes; the
// drawn regions are the nine ordinary 3x3 boxes, verified cell by cell, so
// no Jigsaw/NoBoxes override is needed).
//
// "Digits cannot repeat in cages, and sum to the number in the upper-left
// corner of the cage (if given)." Two cages carry a total (Cage); two carry
// no total, so per that same rule they are all-different only
// (AllDifferent), not a sum constraint. The two nine-cell no-total cages are
// the spiral "hurricane" shapes the title refers to.
//
// "Digits along an arrow must sum to the digit in its circle. Digits may
// repeat along an arrow if allowed by other rules." -- Arrow(bulb, ...path)
// already permits repeats along the path (it adds no all-different of its
// own), matching the second sentence; no extra constraint is needed for it.
// Ten arrows are drawn, each with a circle at the bulb end (each bulb cell
// below has a matching drawn circle, one per arrow).

return [
  new Shape('9x9'),

  new Given('R2C6', 5),

  // Cages: cells transcribed from the drawn cage outlines, each with a
  // one-line provenance/kind note.
  new Cage(22, 'R1C1', 'R2C1', 'R1C2', 'R2C2'),
  new Cage(24, 'R8C8', 'R9C8', 'R9C9', 'R8C9'),
  // No-total 9-cell cage ("hurricane" arm through column 3 / row 7).
  new AllDifferent(
    'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C3', 'R7C1', 'R7C2', 'R7C4', 'R7C5'),
  // No-total 9-cell cage ("hurricane" arm through row 3 / column 7).
  new AllDifferent(
    'R1C7', 'R2C7', 'R3C7', 'R4C7', 'R5C7', 'R3C6', 'R3C8', 'R3C9', 'R3C5'),

  // Arrows: bulb first, then path cells, transcribed from the drawn arrow
  // paths, cross checked against the ten drawn circle underlays -- one per
  // bulb.
  new Arrow('R2C5', 'R3C5', 'R4C5'),
  new Arrow('R8C5', 'R7C5', 'R6C5'),
  new Arrow('R4C3', 'R3C2', 'R3C1'),
  new Arrow('R3C4', 'R2C3', 'R1C3'),
  new Arrow('R5C2', 'R6C3', 'R6C4', 'R7C4'),
  new Arrow('R7C1', 'R8C2', 'R9C3'),
  new Arrow('R7C6', 'R8C7', 'R9C7'),
  new Arrow('R6C7', 'R7C8', 'R7C9'),
  new Arrow('R5C8', 'R4C7', 'R4C6', 'R3C6'),
  new Arrow('R3C9', 'R2C8', 'R1C7'),
];
