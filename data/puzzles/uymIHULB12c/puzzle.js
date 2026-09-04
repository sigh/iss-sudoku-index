// Title: Spiraling Circles
// Author: Pulsar
// Video: https://www.youtube.com/watch?v=uymIHULB12c
// Source: https://sudokupad.app/ppi5a0p5p8

// Normal sudoku rows and columns (the payload's single 81-cell region means
// no box groups -- NoBoxes drops them, leaving only rows/columns).
// Counting circles: the digit placed in a circle states how many circles
// across the whole grid hold that same digit -- CountingCircles implements
// exactly this self-referential count.

// Circle cells, transcribed from the payload's `underlays` (45 identical
// plain white circles tracing one connected spiral from R1C1 inward to R5C5;
// no other geometry is drawn).
const CIRCLES = [
  'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9',
  'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9',
  'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2',
  'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2',
  'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7',
  'R4C7', 'R5C7', 'R6C7', 'R7C7',
  'R7C6', 'R7C5', 'R7C4',
  'R6C4', 'R5C4', 'R5C5',
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  new CountingCircles(...CIRCLES),
];
