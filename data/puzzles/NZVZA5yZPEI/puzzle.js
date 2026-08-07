// Title: Turbulence
// Author: Scojo
// Video: https://www.youtube.com/watch?v=NZVZA5yZPEI
// Source: https://sudokupad.app/prg8idgvw2

// Standard sudoku on a 9x9 grid (rows, columns, boxes all-different; from Shape).
// No given digits.
//
// Arrows: the sum of the shaft (arm) cells equals the digit in the circled
// bulb cell (Arrow(bulb, ...shaft)).
//
// Double Arrows: the sum of the cells between two circles equals the sum of
// the two circled digits (DoubleArrow(circle, ...between, circle)).
//
// Two of the drawn lines double as arrows: R1C6 and R4C9 are simultaneously
// an arrow bulb and a double-arrow endpoint (same physical circle, drawn
// once, doing both jobs); likewise R6C1 and R9C4.
//
// The line from R7C6 to R1C4 is one continuous drawn stroke, but it passes
// through a third circle at R3C2 partway along it. A drawn stroke is not
// necessarily one clue, and the rule text's own phrasing ("a line sum to
// ... the attached circles") reads generically per instance, matching the
// exactly-2 end circles every other double arrow in this puzzle has. So
// this is read as two double arrows chained through the shared R3C2 circle,
// rather than one clue summing three circles -- the two readings are not
// equivalent (sum(shaft1)+sum(shaft2) = c1+c2+c3 vs. sum(shaft1) = c1+c2
// and sum(shaft2) = c2+c3).

return [
  new Shape('9x9'),

  // Arrows: Arrow(bulb, ...shaft)
  new Arrow('R4C9', 'R3C9', 'R2C8'),
  new Arrow('R9C4', 'R9C3', 'R9C2'),
  new Arrow('R1C6', 'R1C7', 'R2C7', 'R3C7'),
  new Arrow('R6C1', 'R7C2', 'R7C3', 'R8C3'),
  new Arrow('R9C8', 'R9C9', 'R8C9', 'R7C8'),
  new Arrow('R8C7', 'R9C7', 'R9C6'),

  // Double Arrows: DoubleArrow(circle, ...between, circle)
  new DoubleArrow(
    'R1C6', 'R1C5', 'R2C4', 'R3C4', 'R4C4', 'R5C5', 'R6C6', 'R6C7', 'R6C8', 'R5C9', 'R4C9'),
  new DoubleArrow('R6C1', 'R5C2', 'R5C3', 'R6C4', 'R7C5', 'R8C5', 'R9C4'),
  new DoubleArrow('R7C1', 'R8C2', 'R9C1', 'R8C1'),
  // R7C6..R1C4 line, split at the shared R3C2 circle (see note above).
  new DoubleArrow('R7C6', 'R6C5', 'R5C4', 'R4C3', 'R3C2'),
  new DoubleArrow('R3C2', 'R2C2', 'R2C3', 'R1C4'),
];
