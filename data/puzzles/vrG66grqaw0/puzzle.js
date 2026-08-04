// Title: Target Practice
// Author: DJV
// Video: https://www.youtube.com/watch?v=vrG66grqaw0
// Source: https://app.crackingthecryptic.com/sudoku/FPg9HPgDqT

// Normal sudoku + knight's move anti-duplication (AntiKnight). Each arrow's
// bulb cell holds the sum of its own arm cells (Arrow, bulb first). The red
// diamond line's box-segments (RegionSumLine) share one common sum, which
// also equals the separate red line confined to box 9 (EqualSum, tying one
// diamond segment to the box-9 line -- RegionSumLine already forces every
// diamond segment equal to that one). The four blue lines share one common
// total (EqualSum over each line's full cell list). A fifth blue line in the
// source payload carries no waypoints, so its cells could not be recovered
// and it is omitted here.
return [
  new Shape('9x9'),
  new Given('R7C7', 3),
  new AntiKnight(),

  // Arrows: bulb (circle) cell first, then arm cells.
  new Arrow('R3C2', 'R4C3'),
  new Arrow('R4C2', 'R5C2', 'R6C2', 'R6C1'),
  new Arrow('R9C5', 'R8C4', 'R9C4'),
  new Arrow('R5C5', 'R6C5', 'R7C5'),
  new Arrow('R5C5', 'R4C5', 'R3C5'),
  new Arrow('R5C5', 'R5C6', 'R5C7'),
  new Arrow('R5C5', 'R5C4', 'R5C3'),

  // Red diamond line, closed loop. Cell order rotated from the drawn path so
  // that box 2's three cells (R3C6, R2C5, R3C4) sit contiguously at the
  // array's end instead of straddling the wrap-around point where the loop
  // closes -- RegionSumLine partitions by list position, and an un-rotated
  // list would wrongly split box 2 into two separate segments.
  new RegionSumLine(
    'R4C3', 'R5C2', 'R6C3',
    'R7C4', 'R8C5', 'R7C6',
    'R6C7', 'R5C8', 'R4C7',
    'R3C6', 'R2C5', 'R3C4'
  ),
  // Ties the diamond line's common per-box sum (any one segment stands for
  // all of them) to the separate red line in box 9.
  new EqualSum(
    ['R3C6', 'R2C5', 'R3C4'],
    ['R8C8', 'R7C8', 'R7C9', 'R8C9', 'R9C9']
  ),

  // Blue lines: every individual line's total is the same.
  new EqualSum(
    ['R3C9', 'R4C8'],
    ['R8C7', 'R9C8'],
    ['R4C6', 'R4C5', 'R4C4', 'R5C4'],
    ['R6C6', 'R6C5', 'R6C4']
  ),
];
