// Title: The Lattice
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=r5jFMm5cms8
// Source: https://sudokupad.app/hc775p3w0o

// Rules: normal sudoku; digits along a gray line are strictly between the
// digits in that line's circles; digits along a red line sum to the digits
// in that line's circles; a "V" on a shared edge means those two cells sum
// to 5 (unmarked pairs may also sum to 5 -- Vs are not exhaustive, so no
// negative constraint is added).
//
// Sixteen circles sit at rows {1,4,6,9} x columns {1,4,6,9}. Every drawn
// line starts, bends, or ends only at one of those sixteen cells, so each
// drawn stroke decomposes into a chain of circle-to-circle segments; a
// circle bounds every segment it touches, not only the stroke's two overall
// ends.

// Gray (between) segments: [circle, ...interior cells (strictly between),
// circle]. `Between` constrains only the interior cells; the endpoints are
// the bounds.
const betweenSegments = [
  ['R4C1', 'R3C1', 'R2C1', 'R1C1'], // E-A
  ['R1C1', 'R1C2', 'R1C3', 'R1C4'], // A-B
  ['R1C4', 'R2C4', 'R3C4', 'R4C4'], // B-F
  ['R4C6', 'R3C6', 'R2C6', 'R1C6'], // G-C
  ['R1C6', 'R1C7', 'R1C8', 'R1C9'], // C-D
  ['R1C9', 'R2C9', 'R3C9', 'R4C9'], // D-H
  ['R9C6', 'R9C7', 'R9C8', 'R9C9'], // O-P
  ['R9C9', 'R8C9', 'R7C9', 'R6C9'], // P-L
  ['R6C1', 'R7C1', 'R8C1', 'R9C1'], // I-M
  ['R6C4', 'R7C4', 'R8C4', 'R9C4'], // J-N
];

// Red (sum) segments: the two circle cells and the interior cells between
// them, as two equal-sum groups -- the segment's interior digits total the
// same as its two bounding circles.
const sumSegments = [
  { circles: ['R4C1', 'R4C4'], interior: ['R4C2', 'R4C3'] }, // E-F
  { circles: ['R4C4', 'R1C1'], interior: ['R3C3', 'R2C2'] }, // F-A
  { circles: ['R4C6', 'R4C9'], interior: ['R4C7', 'R4C8'] }, // G-H
  { circles: ['R4C9', 'R1C6'], interior: ['R3C8', 'R2C7'] }, // H-C
  { circles: ['R9C6', 'R6C6'], interior: ['R8C6', 'R7C6'] }, // O-K
  { circles: ['R6C6', 'R6C9'], interior: ['R6C7', 'R6C8'] }, // K-L
  { circles: ['R9C9', 'R6C6'], interior: ['R8C8', 'R7C7'] }, // P-K
  { circles: ['R6C6', 'R6C4'], interior: ['R6C5'] },         // K-J
  { circles: ['R6C4', 'R6C1'], interior: ['R6C3', 'R6C2'] }, // J-I
  { circles: ['R6C1', 'R9C4'], interior: ['R7C2', 'R8C3'] }, // I-N
  { circles: ['R9C4', 'R9C1'], interior: ['R9C3', 'R9C2'] }, // N-M
];

const betweenLines = betweenSegments.map(cells => new Between(...cells));

const sumLines = sumSegments.map(({ circles, interior }) =>
  new EqualSum(interior, circles));

// "V" edges (sum to 5), transcribed from the drawn edge marks. Not
// exhaustive -- see rules -- so each is only a positive pairwise
// constraint, never a StrictXV-style negative.
const vClues = [
  new V('R6C4', 'R7C4'),
  new V('R7C1', 'R8C1'),
  new V('R4C3', 'R4C4'),
  new V('R5C2', 'R5C3'),
];

return [
  new Shape('9x9'),
  ...betweenLines,
  ...sumLines,
  ...vClues,
];
