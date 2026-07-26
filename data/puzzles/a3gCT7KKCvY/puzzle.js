// Title: Zippy
// Author: gdc
// Video: https://www.youtube.com/watch?v=a3gCT7KKCvY
// Source: https://sudokupad.app/ivesq46yun
//
// Digits 0-8 (nine digits over a six-cell row/column), no repeats in any
// row, column, or box. The boxes are the grid's own quadrants (given
// explicitly as the payload's `regions`), which coincide with the standard
// 3x3 tiling of a 6x6 grid -- RegionSize(9) reproduces them without a
// hand-rolled Jigsaw layout (checked against `graph.boxes(9)`).
//
// Teal line: every 3-cell sequence contains one digit from {0,3,6}, one from
// {1,4,7}, one from {2,5,8} -- Modular(3) on the 9-value alphabet. The line
// is a closed 9-cell loop; since 9 is a multiple of 3, passing the cyclic
// cell list once (no wrap-around repeat) already forces every window,
// including the wrap, to hold one cell of each residue class.
//
// Lavender line ("hat"): digits equidistant from the hat sum to the hatted
// digit -- Zipper, whose odd-length semantics make the centre cell's value
// equal every symmetric pair's sum. The line is drawn as a pictorial hat
// icon (a tapered tassel, the main crown/brim, and a small band/buckle
// notch) whose single continuous stroke revisits R4C2; the centre cell of
// the full 13-waypoint path is R1C1, which is also where a separate grey
// "hat band" mark sits, alone. R4C2 then sits in two symmetric pairs
// (with R5C2, and with R3C3), which is a real consequence of the drawn
// path, not a contradiction: it forces R5C2 and R3C3 to be equal.
//
// Eyes: 1:2 ratio -> BlackDot. White dot: differ by 1 -> WhiteDot. X: sum to
// 10 -> X (fixed sum regardless of the value offset).
//
// Decoration only, not encoded: the "FOGLIGHT" cage (fog-reveal UI area, a
// non-numeric-valued 24-cell stub that cannot be a real all-different cage
// over only 9 possible digits), the "restart me plz" fog-reset graphic, and
// the "You/good/mate?" greeting text.

return [
  new Shape('6x6', '0-8'),
  new RegionSize(9),

  new Modular(3,
    'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R2C6', 'R1C6', 'R1C5', 'R1C4', 'R2C4'),

  new Zipper(
    'R4C3', 'R5C2', 'R4C2', 'R4C1', 'R3C1', 'R2C1', 'R1C1',
    'R1C2', 'R1C3', 'R2C3', 'R3C3', 'R4C2', 'R3C2'),

  // Eyes (1:2 ratio dots).
  new BlackDot('R2C1', 'R2C2'),
  new BlackDot('R2C2', 'R2C3'),
  new BlackDot('R6C4', 'R6C5'),
  new BlackDot('R6C5', 'R6C6'),

  // White dots (consecutive).
  new WhiteDot('R5C5', 'R6C5'),
  new WhiteDot('R6C1', 'R6C2'),
  new WhiteDot('R5C6', 'R6C6'),

  // X marks (sum to 10).
  new X('R1C5', 'R1C6'),
  new X('R4C5', 'R4C6'),
];
