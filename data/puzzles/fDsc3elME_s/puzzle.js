// Title: Just Add Colour
// Author: Polycarp
// Video: https://www.youtube.com/watch?v=fDsc3elME_s
// Source: https://app.crackingthecryptic.com/sudoku/Lg8hmpQhdM

// Normal sudoku rules apply (default row/column/box all-different; regions
// array is the standard nine 3x3 boxes, just listed column-major).
// Identical digits cannot be a knight's move apart -> AntiKnight.
// A digit never appears twice in the same position in two 3x3 boxes ->
// DisjointSets.
// A black dot joins two cells with a 1:2 ratio; not all dots are given, so
// only the drawn pairs are constrained (no negative/exhaustive reading) ->
// BlackDot per drawn edge dot.
// Digits increase on thermos, from the bulb -> Thermo(bulb, ...rest); the
// grey bulb circle overlay marks the low end of each 2-cell thermo line.
// The clue outside the grid shows the sum of the indicated diagonal, which
// may include repeats -> Sum (does not require distinct values). The "30"
// clue sits under C4/beyond R9, paired with the arrow at R9C5 pointing
// up-right; the diagonal it indicates runs R9C5-R8C6-R7C7-R6C8-R5C9 (off-grid
// ray direction (-1,1), stopping at the grid edge).

return [
  new Shape('9x9'),

  new AntiKnight(),
  new DisjointSets(),

  // Black dots, cell pairs as drawn (edge-sized rounded overlays).
  new BlackDot('R1C2', 'R1C3'),
  new BlackDot('R1C3', 'R1C4'),
  new BlackDot('R1C4', 'R1C5'),
  new BlackDot('R1C6', 'R1C7'),
  new BlackDot('R1C7', 'R2C7'),
  new BlackDot('R2C9', 'R3C9'),
  new BlackDot('R3C8', 'R3C9'),
  new BlackDot('R2C5', 'R2C6'),
  new BlackDot('R2C2', 'R3C2'),
  new BlackDot('R2C3', 'R3C3'),
  new BlackDot('R3C3', 'R3C4'),
  new BlackDot('R3C4', 'R4C4'),
  new BlackDot('R4C4', 'R4C5'),
  new BlackDot('R4C3', 'R5C3'),
  new BlackDot('R5C1', 'R6C1'),
  new BlackDot('R7C2', 'R8C2'),
  new BlackDot('R9C1', 'R9C2'),
  new BlackDot('R7C5', 'R8C5'),
  new BlackDot('R6C6', 'R6C7'),
  new BlackDot('R5C7', 'R6C7'),
  new BlackDot('R7C8', 'R7C9'),
  new BlackDot('R7C8', 'R8C8'),

  // Thermos, bulb cell first (grey circle marks the bulb end).
  new Thermo('R5C5', 'R6C5'),
  new Thermo('R4C9', 'R5C9'),
  new Thermo('R8C6', 'R9C6'),

  // Outside diagonal sum: R9C5-R8C6-R7C7-R6C8-R5C9, repeats allowed.
  new Sum(30, 'R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9'),
];
