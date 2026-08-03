// Title: 6/24/23: Inside Philip's House
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=yfuBifYKQnU
// Source: https://tinyurl.com/34t2sb69

// Normal sudoku rules apply (default row/column/box all-different, from
// Shape). No given digits.
//
// Slow Thermo: digits along each thermometer must not decrease (but can
// stay the same) from the bulb to the tip. Encoded as a `Pair` over each
// thermometer's cells in bulb-to-tip order, with a custom a <= b relation
// applied to each consecutive pair along the line -- not `Thermo`, which
// requires strict increase and could not admit the 27-cell line below
// within a 1-9 range.

const slowThermo = Pair.fnToKey((a, b) => a <= b, 9);

return [
  new Shape('9x9'),

  // Thermometer 1: bulb R5C8 -> tip R9C5.
  new Pair(slowThermo, 'Slow Thermo 1',
    'R5C8', 'R6C8', 'R7C7', 'R8C7', 'R9C6', 'R9C5'),

  // Thermometer 2: bulb R2C6 -> tip R2C3.
  new Pair(slowThermo, 'Slow Thermo 2',
    'R2C6', 'R3C7', 'R4C8', 'R3C8', 'R4C7', 'R5C6', 'R5C7', 'R6C6', 'R7C5',
    'R6C5', 'R7C4', 'R8C3', 'R8C4', 'R7C3', 'R6C2', 'R5C3', 'R4C4', 'R3C5',
    'R2C4', 'R3C3', 'R4C2', 'R3C2', 'R4C3', 'R5C4', 'R4C5', 'R3C4', 'R2C3'),
];
