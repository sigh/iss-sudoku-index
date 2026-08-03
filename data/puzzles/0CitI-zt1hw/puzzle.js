// Title: Duplicity
// Author: zetamath
// Video: https://www.youtube.com/watch?v=0CitI-zt1hw
// Source: https://app.crackingthecryptic.com/sudoku/t3tR9bGgjG

// Normal sudoku (default row/col/box). Purple lines: Renban (non-repeating
// consecutive set, any order). Green lines: Whisper(5) (adjacent digits
// differ by >= 5). Black dots: BlackDot (2:1 ratio), both drawn on
// orthogonally adjacent cells. Cages: Cage (distinct digits summing to the
// printed total). Arrows: Arrow (first cell is the circle, remaining cells
// are the arm; arm sums to the circle). Thermometers: Thermo (strictly
// increasing from the bulb, listed bulb-first). Blue lines: RegionSumLine
// (equal sum per box segment) -- the rules text's own worked example
// (r6c2+r6c3=r5c4+r4c5) confirms this segmentation for the first blue line.
// Black circles (quad clues): Quad(topLeftCell, ...values) -- each listed
// digit must appear in at least one of the surrounding four cells.

return [
  new Shape('9x9'),

  // Cages (top-left cell corner total; drawn geometry).
  new Cage(14, 'R3C2', 'R3C3', 'R3C4'),
  new Cage(12, 'R4C6', 'R5C6'),

  // Thermometers (grey lines with a filled bulb circle at one end).
  new Thermo('R4C1', 'R5C1', 'R6C1'),
  new Thermo('R7C3', 'R8C2', 'R9C3'),

  // Blue lines (equal sum within each box segment).
  new RegionSumLine('R6C2', 'R6C3', 'R5C4', 'R4C5'),
  new RegionSumLine('R8C5', 'R7C5', 'R7C6', 'R7C7', 'R7C8'),

  // Purple lines (Renban).
  new Renban('R1C3', 'R1C2', 'R1C1', 'R2C1'),
  new Renban('R1C8', 'R1C7', 'R2C6', 'R3C6'),

  // Green lines (Whisper, difference >= 5).
  new Whisper(5, 'R4C8', 'R5C9', 'R6C8', 'R7C9'),
  new Whisper(5, 'R7C1', 'R8C1', 'R9C1', 'R9C2'),

  // Arrows (circle cell first, then arm cells).
  new Arrow('R6C4', 'R7C4', 'R8C4'),
  new Arrow('R8C9', 'R9C9', 'R9C8'),

  // Black dots (2:1 ratio), on adjacent cell pairs.
  new BlackDot('R2C9', 'R3C9'),
  new BlackDot('R8C6', 'R9C6'),

  // Black circles / quad clues.
  new Quad('R1C4', 3, 6),
  new Quad('R2C7', 2),
];
