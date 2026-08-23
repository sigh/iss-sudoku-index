// Title: Stitches
// Author: Ricky Cruz
// Video: https://www.youtube.com/watch?v=06AddSTekmM
// Source: https://app.crackingthecryptic.com/sudoku/J2HhJ9Pb9t

// Normal sudoku rules apply (standard row/column/box all-different, the ISS
// default). Every drawn line is an isolated 2-cell segment: two grey
// thermometers (digits increase from the bulb, marked by the filled
// circle), ten blue threads summing to 6, and six purple threads summing to
// 14. The rules state repeats are allowed on the sum threads, so the two
// cells of a blue/purple segment may hold equal digits (still subject to
// normal sudoku row/column/box rules); `Sum` permits repeats natively,
// unlike `Cage`.

return [
  new Shape('9x9'),

  // Thermometers: bulb cell first, per the drawn filled circle.
  new Thermo('R1C3', 'R2C3'),
  new Thermo('R7C9', 'R7C8'),

  // Blue threads, sum to 6.
  new Sum(6, 'R2C1', 'R3C1'),
  new Sum(6, 'R3C2', 'R4C1'),
  new Sum(6, 'R4C2', 'R5C2'),
  new Sum(6, 'R7C2', 'R8C3'),
  new Sum(6, 'R3C6', 'R4C7'),
  new Sum(6, 'R1C8', 'R2C9'),
  new Sum(6, 'R1C9', 'R2C8'),
  new Sum(6, 'R8C5', 'R8C6'),
  new Sum(6, 'R9C6', 'R8C7'),
  new Sum(6, 'R9C7', 'R9C8'),

  // Purple threads, sum to 14.
  new Sum(14, 'R1C4', 'R2C4'),
  new Sum(14, 'R1C5', 'R2C6'),
  new Sum(14, 'R5C7', 'R6C7'),
  new Sum(14, 'R5C8', 'R6C9'),
  new Sum(14, 'R8C1', 'R9C2'),
  new Sum(14, 'R7C3', 'R6C4'),
];
