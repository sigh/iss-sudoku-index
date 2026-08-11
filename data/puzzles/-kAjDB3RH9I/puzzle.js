// Title: Together Apart
// Author: AnalyticalNinja
// Video: https://www.youtube.com/watch?v=-kAjDB3RH9I
// Source: https://app.crackingthecryptic.com/sudoku/M6bGJdtJFh

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Consecutive digits cannot be orthogonal neighbours, grid-wide
// -> AntiConsecutive.
// Arrows: digits along the arm sum to the digit(s) in the attached
// circle/pill -> Arrow(bulb, ...arm) for a single-digit circle bulb,
// PillArrow(2, ...pillCells, ...arm) for a two-digit pill bulb. Pills
// read left to right (horizontal) or top to bottom (vertical), per the
// rules text; PillArrow sorts the supplied pill cells into reading order
// itself. Each pill/circle underlay's cell count (drawn geometry) fixes
// which cells are the bulb versus the arm.
// Purple lines: a string of consecutive digits in any order
// -> Renban(...cells). "All arrows (including attached circles/pills)
// fully overlap purple lines" and the decoded cell lists confirm this
// exactly: every purple line's cells are precisely one arrow's bulb cells
// followed by its arm cells, so each Renban below spans a whole arrow's
// bulb+arm path.

const arrows = [
  // Single-cell circle bulb (drawn circle underlay at R1C7, not a pill).
  new Arrow('R1C7', 'R2C8', 'R3C7'),
  // Two-cell pill bulbs (drawn rounded-rect underlays spanning 2 cells).
  new PillArrow(2, 'R3C4', 'R3C5', 'R2C3', 'R1C2', 'R1C1', 'R2C1', 'R3C2', 'R4C3'),
  new PillArrow(2, 'R7C4', 'R7C5', 'R7C3', 'R7C2', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4'),
  new PillArrow(2, 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R8C7', 'R7C8'),
];

const renbanLines = [
  new Renban('R1C7', 'R2C8', 'R3C7'),
  new Renban('R3C4', 'R3C5', 'R2C3', 'R1C2', 'R1C1', 'R2C1', 'R3C2', 'R4C3'),
  new Renban('R7C4', 'R7C5', 'R7C3', 'R7C2', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4'),
  new Renban('R7C9', 'R8C9', 'R9C9', 'R9C8', 'R8C7', 'R7C8'),
];

return [
  new Shape('9x9'),
  new AntiConsecutive(),
  ...arrows,
  ...renbanLines,
];
