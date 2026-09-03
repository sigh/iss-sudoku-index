// Title: The OG Wiggle
// Author: Community Creation
// Video: https://www.youtube.com/watch?v=GvWt9W2iYMU
// Source: https://app.crackingthecryptic.com/sudoku/LNqP9d8tdj

// Normal sudoku rules apply, with no given digits.
//
// Rules encoded below, in the order they are stated:
//   - The grey circle is odd and the grey square is even.
//   - Digits along the blue line must be between the values at each end of
//     that line.
//   - Digits along an arrow sum to the value in the associated circle. The
//     two-digit pill is read as a two-digit number from left to right.
//   - Digits in a cage do not repeat; if a value is given for the cage, the
//     digits sum to that value.
//   - Digits along a thermometer must increase from the bulb end.
//   - The orange cell is greater than the four digits orthogonally adjacent
//     to it.
//   - Two cells separated by a black dot must have a 1:2 ratio.
//   - Digits along the marked brown diagonal may not repeat.
//
// Nothing is omitted. The four small arrows drawn pointing out of the orange
// cell restate the orthogonal-neighbour rule and add nothing to it.

return [
  new Shape('9x9'),

  // Parity marks. R6C4 also carries a grey circle, but that circle is the bulb
  // of the grey thermometer stroke R6C4-R7C3-R8C2, so R1C7 is the lone
  // unattached grey circle the singular rule names.
  new Given('R1C7', 1, 3, 5, 7, 9),
  new Given('R9C5', 2, 4, 6, 8),

  // Blue line, ends at R3C7 and R5C5; the interior digits lie between them.
  new Between(
    'R3C7', 'R3C6', 'R3C5', 'R3C4', 'R3C3',
    'R4C3', 'R5C3', 'R6C3', 'R7C3',
    'R7C4', 'R7C5', 'R7C6', 'R7C7',
    'R6C7', 'R5C7', 'R5C6', 'R5C5'),

  // Arrows: circle cell first, then that arm. The black circle R4C6 has two
  // arms drawn out of it, so each arm sums to R4C6 independently.
  new Arrow('R4C4', 'R3C3', 'R2C2', 'R1C1'),
  new Arrow('R4C6', 'R3C7', 'R2C8'),
  new Arrow('R4C6', 'R5C5', 'R6C4'),
  // Pill R1C5,R1C6 (2 cells, read left to right), then the arm.
  new PillArrow(2,
    'R1C5', 'R1C6',
    'R2C5', 'R3C5', 'R4C5', 'R5C6', 'R6C5', 'R7C4', 'R8C5'),

  // Cages, as drawn. The third carries no printed total; sum 0 means "no
  // total", leaving only the no-repeat half of the rule.
  new Cage(15, 'R8C1', 'R9C1', 'R9C2', 'R8C2'),
  new Cage(11, 'R8C9', 'R9C9', 'R9C8'),
  new Cage(0, 'R2C4', 'R3C4', 'R3C3', 'R4C3', 'R4C2'),

  // Thermometer, bulb first.
  new Thermo('R6C4', 'R7C3', 'R8C2'),

  // Orange cell R6C8 against its four orthogonal neighbours. GreaterThan
  // relates each cell to the adjacent cells later in the list; the four
  // neighbours are pairwise non-adjacent, so this is exactly the four
  // comparisons R6C8 > neighbour.
  new GreaterThan('R6C8', 'R5C8', 'R6C7', 'R6C9', 'R7C8'),

  // Black dot on the R3C1/R3C2 edge.
  new BlackDot('R3C1', 'R3C2'),

  // Brown diagonal R1C9-R9C1; direction 1 is the anti-diagonal.
  new Diagonal(1),
];
