// Title: Claudia Cum Cereo Circulat
// Author: olima
// Video: https://www.youtube.com/watch?v=vcQuufZ1rOE
// Source: https://app.crackingthecryptic.com/sudoku/JHnRqh93pr

// Normal sudoku on the default 3x3 boxes, no givens. Fog is solving UI and
// carries no final-grid rule, so the "FOGLIGHT" cage over R1C1/R2C1/R2C2/R1C2
// is omitted. "Adjacent digits along a line differ by at least 5" is the
// puzzle's only line rule; both drawn line colours (green #A3E048 and blue
// #34BBE6) share it, since nothing in the rules text distinguishes them.
//
// One further line entry in the source carries styling but no waypoints, so
// it covers no cells and renders nothing -- constructor-tool residue, not a
// drawn clue.
//
// Lines 5 and 6 below share cell R8C7 as a branch point (two drawn strokes
// meeting at each other's interior cell), so they are two separate Whisper
// constraints rather than one path.
//
// "Cells separated by an X sum to 10" / "by a V sum to 5"; "all X/V clues are
// given" means every other adjacent pair sums to neither -- StrictXV.

return [
  new Shape('9x9'),

  // Whisper lines (>= 5 difference), one per drawn stroke.
  new Whisper(5, 'R3C1', 'R2C1', 'R1C1', 'R2C2', 'R1C2', 'R1C3', 'R2C4'),
  new Whisper(5, 'R3C3', 'R3C4'),
  new Whisper(5, 'R2C5', 'R2C6', 'R2C7', 'R1C8', 'R1C7'),
  new Whisper(5, 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8'),
  new Whisper(5, 'R7C8', 'R7C7', 'R8C7', 'R9C6', 'R8C5'),
  new Whisper(5, 'R8C7', 'R7C6', 'R7C5'),
  new Whisper(5, 'R8C3', 'R7C4'),
  new Whisper(5, 'R9C5', 'R8C6'),

  // X (sum 10) / V (sum 5) pair markers, from the drawn overlays.
  new X('R1C1', 'R2C1'),
  new X('R7C8', 'R8C8'),
  new V('R2C1', 'R2C2'),

  // Every adjacent pair without a drawn X/V mark sums to neither 10 nor 5.
  new StrictXV(),
];
