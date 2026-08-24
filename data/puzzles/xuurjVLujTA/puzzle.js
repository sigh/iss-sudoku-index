// Title: Euro Final
// Author: Olima
// Video: https://www.youtube.com/watch?v=xuurjVLujTA
// Source: https://app.crackingthecryptic.com/sudoku/GPMDDPqNT2
//
// Normal sudoku rules. DisjointSets: no digit repeats in the same relative
// position across any two boxes -- the puzzle's own rules state this in
// plain words ("the same digit cannot appear twice in the same position
// within two 3x3 boxes"), which is exactly DisjointSets' own description
// ("No digit may appear in the same position in any two boxes").
// Thermometers strictly increase from the bulb. Cages have no printed
// total; digits do not repeat within a cage. Black dots mark a 2:1 ratio
// between adjacent cells; the rules say not all dots are given, so no
// negative (StrictKropki) constraint is added for undotted pairs.

return [
  new Shape('9x9'),

  new DisjointSets(),

  // Branching thermo, bulb R1C2: shared stem R1C2-R1C1-R2C1, then two arms.
  // Encoded as two Thermo calls sharing the same increasing prefix, one per
  // drawn arm (payload draws this as two line entries with an identical
  // waypoint prefix and different suffixes).
  new Thermo('R1C2', 'R1C1', 'R2C1', 'R3C1', 'R3C2'),
  new Thermo('R1C2', 'R1C1', 'R2C1', 'R2C2'),

  new Thermo('R1C3', 'R2C3', 'R3C3', 'R3C4', 'R2C4', 'R1C4'),

  // Last leg (R2C6 -> R3C7) is drawn as a diagonal segment in the payload's
  // waypoints; Thermo only orders the given cell list, so this needs no
  // special handling.
  new Thermo('R3C5', 'R2C5', 'R1C5', 'R1C6', 'R2C6', 'R3C7'),

  new Thermo('R2C8', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R3C8'),

  // Cages: no printed total, so all-different only.
  new AllDifferent('R4C1', 'R4C2', 'R5C1', 'R6C1'),
  new AllDifferent('R4C3', 'R5C3', 'R5C2', 'R6C2'),
  new AllDifferent('R6C3', 'R6C4', 'R5C4', 'R4C4'),
  new AllDifferent('R5C6', 'R5C7', 'R5C8', 'R4C8', 'R5C9', 'R6C7'),

  // Black dots. BlackDot forms the ratio relation over every adjacent pair
  // within the given cells, so the two stacked dots share one call.
  new BlackDot('R4C5', 'R5C5', 'R6C5'),
  new BlackDot('R8C1', 'R8C2'),
];
