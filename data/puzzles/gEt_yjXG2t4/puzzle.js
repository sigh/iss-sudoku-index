// Title: Tension
// Author: Maya
// Video: https://www.youtube.com/watch?v=gEt_yjXG2t4
// Source: https://sudokupad.app/6iqsdeorzo

// Quattroquadri: 6x6 cells hold digits 1-9, one each per 3x3 box; rows and
// columns stay all-different over their 6 cells (default ISS behaviour).
// Widened Shape + RegionSize(9) gives the four 3x3 quadrant boxes drawn in
// `regions`.
// Ten Lines: SumLine(10, ...) natively expresses "divide into segments each
// summing to the given total"; repeats on the line are otherwise unrestricted.
// Kropki Difference Pairs: WhiteDot per drawn dot (rule does not claim all
// pairs are marked, so absence of a dot implies nothing).
// Killer Cages: Cage enforces sum + all-different, matching the `unique` flag
// on every cage entry.
return [
  new Shape('6x6', 9),
  new RegionSize(9),

  // Killer cages (cells, totals from `cages`).
  new Cage(23, 'R5C1', 'R5C2', 'R6C2'),
  new Cage(19, 'R1C2', 'R2C1', 'R2C2'),
  new Cage(12, 'R1C5', 'R2C5', 'R2C6'),
  new Cage(17, 'R5C5', 'R5C6', 'R6C5'),

  // Ten Lines (teal; paths from `lines[].wayPoints`).
  new SumLine(10, 'R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1'),
  new SumLine(10, 'R1C4', 'R2C3', 'R2C2', 'R3C2', 'R3C3', 'R4C4'),
  new SumLine(10, 'R6C3', 'R6C2', 'R6C1', 'R5C1', 'R4C1'),
  new SumLine(10, 'R3C4', 'R4C5', 'R5C5', 'R6C6'),
  // Closed loop (wayPoints return to the first cell).
  new SumLine(10, 'R2C4', 'R3C5', 'R2C6', 'R1C5', 'LOOP'),

  // Kropki white dots (edge-centred rounded marks from `overlays`).
  new WhiteDot('R3C1', 'R4C1'),
  new WhiteDot('R1C3', 'R1C4'),
  new WhiteDot('R6C3', 'R6C4'),
  new WhiteDot('R3C6', 'R4C6'),
  new WhiteDot('R2C4', 'R2C5'),
];
