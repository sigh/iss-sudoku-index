// Title: Serendipity
// Author: Peter Veenis; Aron Lide
// Video: https://www.youtube.com/watch?v=bUimouDX_WE
// Source: https://app.crackingthecryptic.com/sudoku/4h9T8nfb4h

// Normal sudoku rules apply (default 9x9 rows/columns/boxes, no givens).
//
// Numbers along arrows sum to the number in the circle/pill. For the three
// plain single-cell circles this is a standard Arrow. For the two blue
// pills, the arm is grouped into consecutive pairs of cells read away from
// the pill; each pair forms a 2-digit number (near-to-pill cell = tens,
// farther cell = units), and the sum of a pill's arm-pair numbers equals
// that pill's own value -- a 2-digit number (read downwards) for the
// vertical pill, a 3-digit number (read left-to-right) for the horizontal
// one. No digit is printed in any circle/pill; ISS derives each one's value
// from its own cells, so this is a self-clued total, not a `Given`. There is
// no built-in class for "arm grouped into 2-digit chunks summing to a
// multi-digit pill" (unlike plain `PillArrow`, whose arm sums individual
// digits), so each pill total is built directly as one linear `Sum(0, ...)`
// equation: pill cells carry negative place-value coefficients, each arm
// pair cell carries its 10s/1s coefficient, and the whole expression must
// equal 0.
//
// The horizontal 3-digit pill (R9C4-R9C5-R9C6) has three separate arrows
// feeding it, one starting from each of its three cells; the rules state
// each arrow's arm-pair sum equals "the number in the pill", so all three
// arrows are independently equated to the same pill value.

const goldArrows = [
  new Arrow('R3C4', 'R3C5', 'R2C5'),
  new Arrow('R5C8', 'R6C8', 'R6C7'),
  new Arrow('R7C7', 'R8C8', 'R9C9'),
];

// Vertical blue pill R1C1(tens)/R2C1(units) -- one arrow, arm read near to
// far as R3C1, R2C2, R1C3, R1C4 (drawn arrow path; diagonal segments
// snapped to the cells they cross), paired (R3C1,R2C2) and (R1C3,R1C4).
const pill1 = new Sum(
  0,
  ['R1C1', -10], ['R2C1', -1],
  ['R3C1', 10], ['R2C2', 1],
  ['R1C3', 10], ['R1C4', 1],
);

// Horizontal blue pill R9C4(hundreds)/R9C5(tens)/R9C6(units).
const pillCoeffs = [['R9C4', -100], ['R9C5', -10], ['R9C6', -1]];

// Arrow from the pill's middle cell (R9C5): arm R8C5, R7C6, R7C5, R8C6,
// paired (R8C5,R7C6) and (R7C5,R8C6).
const pill2FromMiddle = new Sum(
  0,
  ...pillCoeffs,
  ['R8C5', 10], ['R7C6', 1],
  ['R7C5', 10], ['R8C6', 1],
);

// Arrow from the pill's left cell (R9C4): arm R9C3, R8C3, R8C2, R9C2,
// paired (R9C3,R8C3) and (R8C2,R9C2).
const pill2FromLeft = new Sum(
  0,
  ...pillCoeffs,
  ['R9C3', 10], ['R8C3', 1],
  ['R8C2', 10], ['R9C2', 1],
);

// Arrow from the pill's right cell (R9C6): the long 22-cell arm, paired into
// 11 consecutive near/far chunks in path order (verified cell-by-cell
// against the drawn wayPoints, including diagonal segments' crossed cells).
const pill2FromRight = new Sum(
  0,
  ...pillCoeffs,
  ['R8C7', 10], ['R7C8', 1],
  ['R6C9', 10], ['R5C9', 1],
  ['R4C8', 10], ['R3C8', 1],
  ['R2C8', 10], ['R1C7', 1],
  ['R1C6', 10], ['R1C5', 1],
  ['R2C4', 10], ['R2C3', 1],
  ['R3C2', 10], ['R4C1', 1],
  ['R5C1', 10], ['R6C2', 1],
  ['R7C3', 10], ['R6C4', 1],
  ['R5C5', 10], ['R5C6', 1],
  ['R4C5', 10], ['R4C4', 1],
);

return [
  new Shape('9x9'),
  ...goldArrows,
  pill1,
  pill2FromMiddle,
  pill2FromLeft,
  pill2FromRight,
];
